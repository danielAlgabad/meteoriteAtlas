import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from domain.meteorite.entity import Meteorite
from domain.meteorite.repository import MeteoriteFilters
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass
from infrastructure.persistence.models import Base
from infrastructure.persistence.sqlalchemy_repo import SQLAlchemyMeteoriteRepository


@pytest_asyncio.fixture
async def repo():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    yield SQLAlchemyMeteoriteRepository(session_factory)
    await engine.dispose()


def make_meteorite(id: int = 1, name: str = "Allende", **kwargs) -> Meteorite:
    defaults = dict(
        id=id,
        name=name,
        mass=Mass(2000.0),
        year=1969,
        coordinates=Coordinates(26.97, -105.32),
        meteorite_class=MeteoriteClass("CV3"),
        fall="Fell",
    )
    return Meteorite(**{**defaults, **kwargs})


class TestCount:
    async def test_empty_db(self, repo):
        assert await repo.count() == 0

    async def test_after_save(self, repo):
        await repo.save_batch([make_meteorite(id=1), make_meteorite(id=2, name="Murchison")])
        assert await repo.count() == 2


class TestSaveBatch:
    async def test_replaces_existing_data(self, repo):
        await repo.save_batch([make_meteorite(id=1)])
        await repo.save_batch([make_meteorite(id=2, name="Murchison"), make_meteorite(id=3, name="Sikhote-Alin")])
        assert await repo.count() == 2

    async def test_preserves_all_fields(self, repo):
        await repo.save_batch([make_meteorite(id=7)])
        m = await repo.find_by_id(7)
        assert m.name == "Allende"
        assert m.mass.value == 2000.0
        assert m.year == 1969
        assert m.coordinates.lat == pytest.approx(26.97)
        assert m.coordinates.lon == pytest.approx(-105.32)
        assert m.meteorite_class.value == "CV3"
        assert m.fall == "Fell"


class TestFindById:
    async def test_returns_entity(self, repo):
        await repo.save_batch([make_meteorite(id=42)])
        m = await repo.find_by_id(42)
        assert m is not None
        assert m.id == 42

    async def test_returns_none_when_missing(self, repo):
        assert await repo.find_by_id(999) is None

    async def test_null_fields_become_none(self, repo):
        m = make_meteorite(id=5, mass=None, coordinates=None, meteorite_class=None, year=None)
        await repo.save_batch([m])
        result = await repo.find_by_id(5)
        assert result.mass is None
        assert result.coordinates is None
        assert result.meteorite_class is None
        assert result.year is None


class TestFindAll:
    async def test_pagination(self, repo):
        batch = [make_meteorite(id=i, name=f"M{i}") for i in range(1, 6)]
        await repo.save_batch(batch)

        page = await repo.find_all(MeteoriteFilters(page=1, size=3))
        assert len(page.items) == 3
        assert page.total == 5
        assert page.pages == 2

    async def test_second_page(self, repo):
        batch = [make_meteorite(id=i, name=f"M{i}") for i in range(1, 6)]
        await repo.save_batch(batch)

        page = await repo.find_all(MeteoriteFilters(page=2, size=3))
        assert len(page.items) == 2

    async def test_filter_mass_min(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, mass=Mass(100.0)),
            make_meteorite(id=2, name="Heavy", mass=Mass(5000.0)),
        ])
        page = await repo.find_all(MeteoriteFilters(mass_min=1000.0))
        assert page.total == 1
        assert page.items[0].mass.value == 5000.0

    async def test_filter_mass_max(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, mass=Mass(100.0)),
            make_meteorite(id=2, name="Heavy", mass=Mass(5000.0)),
        ])
        page = await repo.find_all(MeteoriteFilters(mass_max=200.0))
        assert page.total == 1
        assert page.items[0].mass.value == 100.0

    async def test_filter_year_from(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, year=1800),
            make_meteorite(id=2, name="Recent", year=2000),
        ])
        page = await repo.find_all(MeteoriteFilters(year_from=1900))
        assert page.total == 1
        assert page.items[0].year == 2000

    async def test_filter_year_to(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, year=1800),
            make_meteorite(id=2, name="Recent", year=2000),
        ])
        page = await repo.find_all(MeteoriteFilters(year_to=1900))
        assert page.total == 1
        assert page.items[0].year == 1800

    async def test_filter_fall(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, fall="Fell"),
            make_meteorite(id=2, name="Found one", fall="Found"),
        ])
        page = await repo.find_all(MeteoriteFilters(fall="Found"))
        assert page.total == 1
        assert page.items[0].fall == "Found"

    async def test_filter_class(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, meteorite_class=MeteoriteClass("L5")),
            make_meteorite(id=2, name="Iron", meteorite_class=MeteoriteClass("Iron")),
        ])
        page = await repo.find_all(MeteoriteFilters(meteorite_class="L5"))
        assert page.total == 1
        assert page.items[0].meteorite_class.value == "L5"


class TestSearch:
    async def test_finds_by_partial_name(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, name="Allende"),
            make_meteorite(id=2, name="Murchison"),
        ])
        results = await repo.search("Allen")
        assert len(results) == 1
        assert results[0].name == "Allende"

    async def test_case_insensitive(self, repo):
        await repo.save_batch([make_meteorite(id=1, name="Allende")])
        results = await repo.search("allende")
        assert len(results) == 1

    async def test_returns_empty_when_no_match(self, repo):
        await repo.save_batch([make_meteorite(id=1)])
        results = await repo.search("XXXXXX")
        assert results == []

    async def test_respects_limit(self, repo):
        batch = [make_meteorite(id=i, name=f"Alpha{i}") for i in range(1, 6)]
        await repo.save_batch(batch)
        results = await repo.search("Alpha", limit=3)
        assert len(results) == 3


class TestGetStats:
    async def test_basic_counts(self, repo):
        await repo.save_batch([
            make_meteorite(id=1),
            make_meteorite(id=2, name="No coords", coordinates=None),
        ])
        stats = await repo.get_stats()
        assert stats.total == 2
        assert stats.with_coordinates == 1
        assert stats.observed_falling == 2

    async def test_year_range(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, year=1800),
            make_meteorite(id=2, name="Recent", year=2013),
        ])
        stats = await repo.get_stats()
        assert stats.earliest_year == 1800
        assert stats.latest_year == 2013

    async def test_largest_mass(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, mass=Mass(500.0)),
            make_meteorite(id=2, name="Giant", mass=Mass(60000.0)),
        ])
        stats = await repo.get_stats()
        assert stats.largest_mass_g == pytest.approx(60000.0)

    async def test_by_century_grouping(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, year=1969),
            make_meteorite(id=2, name="Modern", year=2005),
        ])
        stats = await repo.get_stats()
        assert "20th" in stats.by_century
        assert "21th" in stats.by_century

    async def test_by_class_group(self, repo):
        await repo.save_batch([
            make_meteorite(id=1, meteorite_class=MeteoriteClass("L5")),
            make_meteorite(id=2, name="Iron", meteorite_class=MeteoriteClass("Iron")),
        ])
        stats = await repo.get_stats()
        assert "Chondrite" in stats.by_class_group
        assert "Iron" in stats.by_class_group
