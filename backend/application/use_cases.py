from domain.meteorite.entity import Meteorite
from domain.meteorite.repository import (
    MeteoriteFilters,
    MeteoritePage,
    MeteoriteRepository,
    MeteoriteStats,
)
from domain.shared.exceptions import MeteoriteNotFoundError


class GetMeteoritesUseCase:
    def __init__(self, repo: MeteoriteRepository) -> None:
        self._repo = repo

    async def execute(self, filters: MeteoriteFilters) -> MeteoritePage:
        return await self._repo.find_all(filters)


class GetMeteoriteUseCase:
    def __init__(self, repo: MeteoriteRepository) -> None:
        self._repo = repo

    async def execute(self, meteorite_id: int) -> Meteorite:
        meteorite = await self._repo.find_by_id(meteorite_id)
        if meteorite is None:
            raise MeteoriteNotFoundError(f"Meteorite {meteorite_id} not found")
        return meteorite


class SearchMeteoritesUseCase:
    def __init__(self, repo: MeteoriteRepository) -> None:
        self._repo = repo

    async def execute(self, query: str, limit: int = 20) -> list[Meteorite]:
        return await self._repo.search(query, limit)


class GetStatsUseCase:
    def __init__(self, repo: MeteoriteRepository) -> None:
        self._repo = repo

    async def execute(self) -> MeteoriteStats:
        return await self._repo.get_stats()
