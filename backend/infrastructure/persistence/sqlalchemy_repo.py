from __future__ import annotations

import logging
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from domain.meteorite.entity import Meteorite
from domain.meteorite.repository import (
    MeteoriteFilters,
    MeteoritePage,
    MeteoriteRepository,
    MeteoriteStats,
)
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass
from infrastructure.persistence.models import Base, MeteoriteModel

logger = logging.getLogger(__name__)


def build_engine(database_url: str):
    # aiosqlite driver required: pip install aiosqlite
    url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///")
    return create_async_engine(url, echo=False)


class SQLAlchemyMeteoriteRepository:
    """Concrete implementation of MeteoriteRepository backed by SQLite via SQLAlchemy."""

    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory

    # --- MeteoriteRepository protocol ---

    async def find_all(self, filters: MeteoriteFilters) -> MeteoritePage:
        async with self._session_factory() as session:
            query = select(MeteoriteModel)
            query = self._apply_filters(query, filters)

            count_query = select(func.count()).select_from(query.subquery())
            total = (await session.execute(count_query)).scalar_one()

            offset = (filters.page - 1) * filters.size
            query = query.offset(offset).limit(filters.size)
            rows = (await session.execute(query)).scalars().all()

            return MeteoritePage(
                items=[self._to_entity(r) for r in rows],
                total=total,
                page=filters.page,
                size=filters.size,
            )

    async def find_by_id(self, id: int) -> Meteorite | None:
        async with self._session_factory() as session:
            row = await session.get(MeteoriteModel, id)
            return self._to_entity(row) if row else None

    async def search(self, query: str, limit: int = 20) -> list[Meteorite]:
        async with self._session_factory() as session:
            stmt = (
                select(MeteoriteModel)
                .where(MeteoriteModel.name.ilike(f"%{query}%"))
                .limit(limit)
            )
            rows = (await session.execute(stmt)).scalars().all()
            return [self._to_entity(r) for r in rows]

    async def get_stats(self) -> MeteoriteStats:
        async with self._session_factory() as session:
            total = (await session.execute(select(func.count(MeteoriteModel.id)))).scalar_one()
            with_coords = (
                await session.execute(
                    select(func.count(MeteoriteModel.id)).where(
                        MeteoriteModel.lat.isnot(None)
                    )
                )
            ).scalar_one()
            observed = (
                await session.execute(
                    select(func.count(MeteoriteModel.id)).where(
                        MeteoriteModel.fall == "Fell"
                    )
                )
            ).scalar_one()
            largest = (await session.execute(select(func.max(MeteoriteModel.mass)))).scalar_one()
            earliest = (await session.execute(select(func.min(MeteoriteModel.year)))).scalar_one()
            latest = (await session.execute(select(func.max(MeteoriteModel.year)))).scalar_one()

            rows = (await session.execute(select(MeteoriteModel.year, MeteoriteModel.meteorite_class))).all()
            by_century: dict[str, int] = defaultdict(int)
            by_group: dict[str, int] = defaultdict(int)

            for year, cls in rows:
                if year:
                    n = (year // 100) + 1
                    if 11 <= n % 100 <= 13:
                        suffix = "th"
                    else:
                        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
                    by_century[f"{n}{suffix}"] += 1
                if cls:
                    try:
                        group = MeteoriteClass(cls).group()
                    except Exception:
                        group = "Unknown"
                    by_group[group] += 1

            return MeteoriteStats(
                total=total,
                with_coordinates=with_coords,
                observed_falling=observed,
                largest_mass_g=largest,
                earliest_year=earliest,
                latest_year=latest,
                by_century=dict(by_century),
                by_class_group=dict(by_group),
            )

    async def count(self) -> int:
        async with self._session_factory() as session:
            return (await session.execute(select(func.count(MeteoriteModel.id)))).scalar_one()

    async def save_batch(self, meteorites: list[Meteorite]) -> None:
        async with self._session_factory() as session:
            async with session.begin():
                await session.execute(
                    MeteoriteModel.__table__.delete()
                )
                session.add_all([self._to_model(m) for m in meteorites])
        logger.info("Saved %d meteorites to database", len(meteorites))

    # --- Private helpers ---

    def _apply_filters(self, query, filters: MeteoriteFilters):
        if filters.mass_min is not None:
            query = query.where(MeteoriteModel.mass >= filters.mass_min)
        if filters.mass_max is not None:
            query = query.where(MeteoriteModel.mass <= filters.mass_max)
        if filters.year_from is not None:
            query = query.where(MeteoriteModel.year >= filters.year_from)
        if filters.year_to is not None:
            query = query.where(MeteoriteModel.year <= filters.year_to)
        if filters.fall:
            query = query.where(MeteoriteModel.fall == filters.fall)
        if filters.meteorite_class:
            query = query.where(MeteoriteModel.meteorite_class == filters.meteorite_class)
        return query

    def _to_entity(self, row: MeteoriteModel) -> Meteorite:
        mass = Mass(row.mass) if row.mass is not None else None
        coordinates = (
            Coordinates(row.lat, row.lon)
            if row.lat is not None and row.lon is not None
            else None
        )
        meteorite_class = None
        if row.meteorite_class:
            try:
                meteorite_class = MeteoriteClass(row.meteorite_class)
            except Exception:
                pass

        return Meteorite(
            id=row.id,
            name=row.name,
            mass=mass,
            year=row.year,
            coordinates=coordinates,
            meteorite_class=meteorite_class,
            fall=row.fall,
        )

    def _to_model(self, m: Meteorite) -> MeteoriteModel:
        return MeteoriteModel(
            id=m.id,
            name=m.name,
            mass=m.mass.value if m.mass else None,
            year=m.year,
            lat=m.coordinates.lat if m.coordinates else None,
            lon=m.coordinates.lon if m.coordinates else None,
            meteorite_class=m.meteorite_class.value if m.meteorite_class else None,
            fall=m.fall,
        )
