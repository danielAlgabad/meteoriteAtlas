from __future__ import annotations
from dataclasses import dataclass
from typing import Literal

from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass


@dataclass
class Meteorite:
    """
    Core domain entity representing a meteorite landing record.
    Contains business logic — not just data.
    """

    id: int
    name: str
    mass: Mass | None
    year: int | None
    coordinates: Coordinates | None
    meteorite_class: MeteoriteClass | None
    fall: Literal["Fell", "Found"] | None

    # --- Behaviour ---

    def is_large(self) -> bool:
        """True if mass exceeds 1 tonne (1,000,000 g)."""
        return self.mass is not None and self.mass.value > 1_000_000

    def is_historic(self) -> bool:
        """True if the meteorite fell or was found before the 20th century."""
        return self.year is not None and self.year < 1900

    def fell_in_century(self, century: int) -> bool:
        """Check whether the event occurred in a given century (e.g. 20 for 1900-1999)."""
        if self.year is None:
            return False
        return (century - 1) * 100 <= self.year < century * 100

    def has_valid_coordinates(self) -> bool:
        """True if coordinates are present and valid."""
        return self.coordinates is not None

    def was_observed_falling(self) -> bool:
        """True if the meteorite was witnessed falling (as opposed to found later)."""
        return self.fall == "Fell"

    def classification_group(self) -> str:
        """Return the broad classification group or 'Unknown'."""
        if self.meteorite_class is None:
            return "Unknown"
        return self.meteorite_class.group()

    def __repr__(self) -> str:
        return f"Meteorite(id={self.id}, name={self.name!r}, year={self.year})"
