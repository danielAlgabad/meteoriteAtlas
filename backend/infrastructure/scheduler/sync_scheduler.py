import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from domain.meteorite.repository import MeteoriteRepository
from infrastructure.nasa.nasa_client import NasaApiClient

logger = logging.getLogger(__name__)


class SyncScheduler:
    """
    Schedules a monthly sync from the NASA API.
    Compares record count before downloading to avoid unnecessary full fetches.
    """

    def __init__(
        self,
        repo: MeteoriteRepository,
        nasa_client: NasaApiClient,
        interval_hours: int = 720,  # 30 days
    ) -> None:
        self._repo = repo
        self._nasa = nasa_client
        self._interval_hours = interval_hours
        self._scheduler = AsyncIOScheduler()

    def start(self) -> None:
        self._scheduler.add_job(
            self._sync,
            trigger="interval",
            hours=self._interval_hours,
            id="nasa_sync",
            replace_existing=True,
        )
        self._scheduler.start()
        logger.info("Sync scheduler started — interval: %dh", self._interval_hours)

    def stop(self) -> None:
        self._scheduler.shutdown(wait=False)

    async def _sync(self) -> None:
        logger.info("Starting NASA sync...")
        try:
            nasa_count = await self._nasa.fetch_count()
            local_count = await self._repo.count()

            if nasa_count == local_count:
                logger.info("Dataset unchanged (%d records). Skipping sync.", local_count)
                return

            logger.info(
                "Dataset changed: local=%d nasa=%d. Fetching all records...",
                local_count,
                nasa_count,
            )
            meteorites = await self._nasa.fetch_all()
            await self._repo.save_batch(meteorites)
            logger.info("Sync complete. Saved %d records.", len(meteorites))

        except Exception:
            logger.exception("NASA sync failed")
