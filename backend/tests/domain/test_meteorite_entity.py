import pytest
from domain.meteorite.entity import Meteorite
from domain.meteorite.value_objects import Coordinates, Mass, MeteoriteClass
from domain.shared.exceptions import InvalidCoordinatesError, InvalidMassError


def make_meteorite(**kwargs) -> Meteorite:
    defaults = dict(
        id=1,
        name="Test",
        mass=Mass(500.0),
        year=1969,
        coordinates=Coordinates(40.0, -3.0),
        meteorite_class=MeteoriteClass("L5"),
        fall="Fell",
    )
    return Meteorite(**{**defaults, **kwargs})


class TestMass:
    def test_valid_mass(self):
        m = Mass(1000.0)
        assert m.value == 1000.0

    def test_negative_mass_raises(self):
        with pytest.raises(InvalidMassError):
            Mass(-1.0)

    def test_in_kg(self):
        assert Mass(2000.0).in_kg() == 2.0

    def test_in_tonnes(self):
        assert Mass(1_000_000.0).in_tonnes() == 1.0


class TestCoordinates:
    def test_valid_coordinates(self):
        c = Coordinates(40.0, -3.0)
        assert c.lat == 40.0
        assert c.lon == -3.0

    def test_invalid_latitude_raises(self):
        with pytest.raises(InvalidCoordinatesError):
            Coordinates(91.0, 0.0)

    def test_invalid_longitude_raises(self):
        with pytest.raises(InvalidCoordinatesError):
            Coordinates(0.0, 181.0)


class TestMeteoriteEntity:
    def test_is_large_true(self):
        m = make_meteorite(mass=Mass(2_000_000.0))
        assert m.is_large() is True

    def test_is_large_false(self):
        m = make_meteorite(mass=Mass(500.0))
        assert m.is_large() is False

    def test_is_large_no_mass(self):
        m = make_meteorite(mass=None)
        assert m.is_large() is False

    def test_is_historic(self):
        assert make_meteorite(year=1850).is_historic() is True
        assert make_meteorite(year=1969).is_historic() is False

    def test_fell_in_century(self):
        m = make_meteorite(year=1969)
        assert m.fell_in_century(20) is True
        assert m.fell_in_century(21) is False

    def test_has_valid_coordinates_true(self):
        assert make_meteorite().has_valid_coordinates() is True

    def test_has_valid_coordinates_false(self):
        assert make_meteorite(coordinates=None).has_valid_coordinates() is False

    def test_was_observed_falling(self):
        assert make_meteorite(fall="Fell").was_observed_falling() is True
        assert make_meteorite(fall="Found").was_observed_falling() is False

    def test_classification_group(self):
        assert make_meteorite(meteorite_class=MeteoriteClass("L5")).classification_group() == "Chondrite"
        assert make_meteorite(meteorite_class=None).classification_group() == "Unknown"
