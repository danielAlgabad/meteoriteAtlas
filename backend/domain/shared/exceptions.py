class DomainError(Exception):
    """Base class for all domain exceptions."""


class InvalidMassError(DomainError):
    """Raised when a mass value is invalid."""


class InvalidCoordinatesError(DomainError):
    """Raised when geographic coordinates are out of range."""


class InvalidMeteoriteClassError(DomainError):
    """Raised when a meteorite classification string is invalid."""


class MeteoriteNotFoundError(DomainError):
    """Raised when a meteorite cannot be found by its identifier."""
