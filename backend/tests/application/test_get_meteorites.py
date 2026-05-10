import pytest
from unittest.mock import AsyncMock

from application.use_cases import (
    GetMeteoriteUseCase,
    GetMeteoritesUseCase,
    GetStatsUseCase,
    SearchMeteoritesUseCase,
)
from domain.meteorite.entity import Meteorite
from domain.meteorite.repository import (
    MeteoriteFilters,
    MeteoritePage,
    MeteoriteStats,
)
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass
from domain.shared.exceptions import MeteoriteNotFoundError


def make_meteorite(**kwargs) -> Meteorite:
    defaults = dict(
        id=1,
        name="Allende",
        mass=Mass(2000.0),
        year=1969,
        coordinates=Coordinates(26.97, -105.32),
        meteorite_class=MeteoriteClass("CV3"),
        fall="Fell",
    )
    return Meteorite(**{**defaults, **kwargs})


class TestGetMeteoritesUseCase:
    async def test_delegates_to_repo(self):
        repo = AsyncMock()
        expected = MeteoritePage(items=[make_meteorite()], total=1, page=1, size=100)
        repo.find_all.return_value = expected

        result = await GetMeteoritesUseCase(repo).execute(MeteoriteFilters())

        assert result is expected
        repo.find_all.assert_called_once_with(MeteoriteFilters())

    async def test_passes_filters_through(self):
        repo = AsyncMock()
        repo.find_all.return_value = MeteoritePage(items=[], total=0, page=2, size=50)
        filters = MeteoriteFilters(page=2, size=50, mass_min=100.0)

        await GetMeteoritesUseCase(repo).execute(filters)

        repo.find_all.assert_called_once_with(filters)


class TestGetMeteoriteUseCase:
    async def test_returns_meteorite_when_found(self):
        repo = AsyncMock()
        m = make_meteorite(id=42)
        repo.find_by_id.return_value = m

        result = await GetMeteoriteUseCase(repo).execute(42)

        assert result is m
        repo.find_by_id.assert_called_once_with(42)

    async def test_raises_not_found_when_none(self):
        repo = AsyncMock()
        repo.find_by_id.return_value = None

        with pytest.raises(MeteoriteNotFoundError):
            await GetMeteoriteUseCase(repo).execute(999)


class TestSearchMeteoritesUseCase:
    async def test_delegates_to_repo(self):
        repo = AsyncMock()
        results = [make_meteorite(), make_meteorite(id=2, name="Murchison")]
        repo.search.return_value = results

        result = await SearchMeteoritesUseCase(repo).execute("Allen", limit=10)

        assert result is results
        repo.search.assert_called_once_with("Allen", 10)


class TestGetStatsUseCase:
    async def test_returns_stats(self):
        repo = AsyncMock()
        stats = MeteoriteStats(
            total=100,
            with_coordinates=80,
            observed_falling=30,
            largest_mass_g=60000.0,
            earliest_year=860,
            latest_year=2013,
            by_century={"20th": 50},
            by_class_group={"Chondrite": 70},
        )
        repo.get_stats.return_value = stats

        result = await GetStatsUseCase(repo).execute()

        assert result is stats
        repo.get_stats.assert_called_once()
