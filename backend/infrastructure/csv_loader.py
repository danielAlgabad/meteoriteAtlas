import csv
import logging
import os
from pathlib import Path

from domain.meteorite.entity import Meteorite
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass

logger = logging.getLogger(__name__)

DEFAULT_CSV_PATH = Path(__file__).parent.parent / "data" / "Meteorite_Landings.csv"


class CsvDataLoader:
    """Loads meteorite data from a local CSV file."""

    def __init__(self, csv_path: Path | None = None) -> None:
        self._csv_path = csv_path or Path(os.getenv("CSV_PATH", str(DEFAULT_CSV_PATH)))

    def load_all(self) -> list[Meteorite]:
        logger.info("Loading meteorite data from %s", self._csv_path)
        meteorites = []
        with open(self._csv_path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                m = self._map(row)
                if m is not None:
                    meteorites.append(m)
        logger.info("Loaded %d meteorites from CSV", len(meteorites))
        return meteorites

    def _map(self, row: dict) -> Meteorite | None:
        try:
            id_ = int(row["id"])
        except (ValueError, KeyError):
            return None

        name = row.get("name", "").strip()
        if not name:
            return None

        mass = None
        if raw := row.get("mass (g)", "").strip():
            try:
                mass = Mass(float(raw))
            except Exception:
                pass

        coordinates = None
        lat_str = row.get("reclat", "").strip()
        lon_str = row.get("reclong", "").strip()
        if lat_str and lon_str:
            try:
                coordinates = Coordinates(float(lat_str), float(lon_str))
            except Exception:
                pass

        meteorite_class = None
        if raw := row.get("recclass", "").strip():
            try:
                meteorite_class = MeteoriteClass(raw)
            except Exception:
                pass

        year = None
        if raw := row.get("year", "").strip():
            try:
                year = int(raw[:4])
            except (ValueError, TypeError):
                pass

        fall = row.get("fall", "").strip() or None

        return Meteorite(
            id=id_,
            name=name,
            mass=mass,
            year=year,
            coordinates=coordinates,
            meteorite_class=meteorite_class,
            fall=fall,
        )
