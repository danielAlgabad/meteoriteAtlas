from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol

from domain.meteorite.entity import Meteorite


@dataclass
class MeteoriteFilters:
    """Value object encapsulating all supported query filters."""

    page: int = 1
    size: int = 100
    mass_min: float | None = None
    mass_max: float | None = None
    year_from: int | None = None
    year_to: int | None = None
    fall: str | None = None          # "Fell" | "Found"
    meteorite_class: str | None = None
    lat_center: float | None = None
    lon_center: float | None = None
    radius_deg: float | None = None

    def __post_init__(self) -> None:
        if self.size > 500:
            self.size = 500
        if self.page < 1:
            self.page = 1


@dataclass
class MeteoritePage:
    """Paginated result set returned by the repository."""

    items: list[Meteorite]
    total: int
    page: int
    size: int

    @property
    def pages(self) -> int:
        if self.size == 0:
            return 0
        return -(-self.total // self.size)  # ceiling division


@dataclass
class MeteoriteStats:
    """Aggregated statistics across the entire dataset."""

    total: int
    with_coordinates: int
    observed_falling: int
    largest_mass_g: float | None
    earliest_year: int | None
    latest_year: int | None
    by_century: dict[str, int] = field(default_factory=dict)
    by_class_group: dict[str, int] = field(default_factory=dict)


class MeteoriteRepository(Protocol):
    """
    Domain interface for meteorite persistence.
    Implementations live in infrastructure/persistence/.
    """

    async def find_all(self, filters: MeteoriteFilters) -> MeteoritePage: ...

    async def find_by_id(self, id: int) -> Meteorite | None: ...

    async def search(self, query: str, limit: int = 20) -> list[Meteorite]: ...

    async def get_stats(self) -> MeteoriteStats: ...

    async def count(self) -> int: ...

    async def save_batch(self, meteorites: list[Meteorite]) -> None: ...
