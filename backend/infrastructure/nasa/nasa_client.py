import logging
from typing import Any

import httpx

from domain.meteorite.entity import Meteorite
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass

logger = logging.getLogger(__name__)

NASA_API_URL = "https://data.nasa.gov/docs/legacy/meteorite_landings/gh4g-9sfh.json"
PAGE_SIZE = 1000


class NasaApiClient:
    """Fetches and maps meteorite data from the NASA Meteorite Landing API."""

    def __init__(self, base_url: str = NASA_API_URL) -> None:
        self._base_url = base_url

    async def fetch_all(self) -> list[Meteorite]:
        """Download all records from the NASA API using offset pagination."""
        meteorites: list[Meteorite] = []
        offset = 0

        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            while True:
                params = {"$limit": PAGE_SIZE, "$offset": offset}
                logger.info("Fetching NASA records offset=%d", offset)
                response = await client.get(self._base_url, params=params)
                response.raise_for_status()
                records: list[dict[str, Any]] = response.json()

                if not records:
                    break

                meteorites.extend(self._map(r) for r in records if self._valid(r))
                offset += PAGE_SIZE

                if len(records) < PAGE_SIZE:
                    break

        logger.info("Fetched %d valid meteorites from NASA API", len(meteorites))
        return meteorites

    async def fetch_count(self) -> int:
        """Return total record count — used to detect dataset changes cheaply."""
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            response = await client.get(
                self._base_url, params={"$select": "count(*)", "$limit": 1}
            )
            response.raise_for_status()
            data = response.json()
            return int(data[0].get("count", 0))

    # --- Private helpers ---

    def _valid(self, record: dict[str, Any]) -> bool:
        return bool(record.get("id") and record.get("name"))

    def _map(self, record: dict[str, Any]) -> Meteorite:
        mass = None
        if raw_mass := record.get("mass"):
            try:
                mass = Mass(float(raw_mass))
            except (ValueError, Exception):
                pass

        coordinates = None
        geo = record.get("geolocation", {})
        if geo and geo.get("latitude") and geo.get("longitude"):
            try:
                coordinates = Coordinates(
                    lat=float(geo["latitude"]),
                    lon=float(geo["longitude"]),
                )
            except (ValueError, Exception):
                pass

        meteorite_class = None
        if raw_class := record.get("recclass"):
            try:
                meteorite_class = MeteoriteClass(raw_class)
            except Exception:
                pass

        year = None
        if raw_year := record.get("year"):
            try:
                year = int(raw_year[:4])
            except (ValueError, TypeError):
                pass

        return Meteorite(
            id=int(record["id"]),
            name=record["name"],
            mass=mass,
            year=year,
            coordinates=coordinates,
            meteorite_class=meteorite_class,
            fall=record.get("fall"),
        )
