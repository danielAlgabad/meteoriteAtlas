from dataclasses import dataclass
from domain.shared.exceptions import (
    InvalidCoordinatesError,
    InvalidMassError,
    InvalidMeteoriteClassError,
)


@dataclass(frozen=True)
class Mass:
    """Mass of a meteorite in grams."""

    value: float

    def __post_init__(self) -> None:
        if self.value < 0:
            raise InvalidMassError(f"Mass cannot be negative: {self.value}")

    def in_kg(self) -> float:
        return self.value / 1000

    def in_tonnes(self) -> float:
        return self.value / 1_000_000

    def __str__(self) -> str:
        if self.value >= 1_000_000:
            return f"{self.in_tonnes():.2f} t"
        if self.value >= 1000:
            return f"{self.in_kg():.2f} kg"
        return f"{self.value:.2f} g"


@dataclass(frozen=True)
class Coordinates:
    """Geographic coordinates of a meteorite landing site."""

    lat: float
    lon: float

    def __post_init__(self) -> None:
        if not (-90 <= self.lat <= 90):
            raise InvalidCoordinatesError(f"Invalid latitude: {self.lat}")
        if not (-180 <= self.lon <= 180):
            raise InvalidCoordinatesError(f"Invalid longitude: {self.lon}")

    def as_tuple(self) -> tuple[float, float]:
        return (self.lat, self.lon)


@dataclass(frozen=True)
class MeteoriteClass:
    """Scientific classification of a meteorite (e.g. 'L5', 'H4', 'Iron')."""

    value: str

    def __post_init__(self) -> None:
        if not self.value or not self.value.strip():
            raise InvalidMeteoriteClassError("Meteorite class cannot be empty")

    def group(self) -> str:
        """Return the broad group: 'Chondrite', 'Achondrite', 'Iron' or 'Unknown'."""
        v = self.value.upper()
        if any(v.startswith(p) for p in ("L", "H", "LL", "E", "C", "R", "K")):
            return "Chondrite"
        if v.startswith("IRON") or v == "IRON":
            return "Iron"
        if any(v.startswith(p) for p in ("HED", "SNC", "LUNAR", "URE", "AUB")):
            return "Achondrite"
        return "Unknown"
