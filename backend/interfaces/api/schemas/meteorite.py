from __future__ import annotations
from pydantic import BaseModel, ConfigDict


class MeteoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    mass: float | None
    year: int | None
    lat: float | None
    lon: float | None
    meteorite_class: str | None
    fall: str | None
    classification_group: str | None


class MeteoritePageResponse(BaseModel):
    items: list[MeteoriteResponse]
    total: int
    page: int
    size: int
    pages: int


class MeteoriteStatsResponse(BaseModel):
    total: int
    with_coordinates: int
    observed_falling: int
    largest_mass_g: float | None
    earliest_year: int | None
    latest_year: int | None
    by_century: dict[str, int]
    by_class_group: dict[str, int]
