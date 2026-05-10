from sqlalchemy import Float, Index, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class MeteoriteModel(Base):
    __tablename__ = "meteorites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    mass: Mapped[float | None] = mapped_column(Float, nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    meteorite_class: Mapped[str | None] = mapped_column(String, nullable=True)
    fall: Mapped[str | None] = mapped_column(String, nullable=True)

    __table_args__ = (
        Index("ix_meteorites_year", "year"),
        Index("ix_meteorites_mass", "mass"),
        Index("ix_meteorites_fall", "fall"),
        Index("ix_meteorites_class", "meteorite_class"),
    )

    def __repr__(self) -> str:
        return f"<MeteoriteModel id={self.id} name={self.name!r}>"
