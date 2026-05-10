from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from application.use_cases import (
    GetMeteoriteUseCase,
    GetMeteoritesUseCase,
    GetStatsUseCase,
    SearchMeteoritesUseCase,
)
from domain.meteorite.repository import MeteoriteFilters
from domain.shared.exceptions import MeteoriteNotFoundError
from interfaces.api.schemas.meteorite import (
    MeteoritePageResponse,
    MeteoriteResponse,
    MeteoriteStatsResponse,
)

router = APIRouter(prefix="/meteorites", tags=["meteorites"])


def _to_response(m) -> MeteoriteResponse:
    return MeteoriteResponse(
        id=m.id,
        name=m.name,
        mass=m.mass.value if m.mass else None,
        year=m.year,
        lat=m.coordinates.lat if m.coordinates else None,
        lon=m.coordinates.lon if m.coordinates else None,
        meteorite_class=m.meteorite_class.value if m.meteorite_class else None,
        fall=m.fall,
        classification_group=m.classification_group(),
    )


@router.get("", response_model=MeteoritePageResponse)
async def list_meteorites(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=500),
    mass_min: float | None = Query(None),
    mass_max: float | None = Query(None),
    year_from: int | None = Query(None),
    year_to: int | None = Query(None),
    fall: str | None = Query(None, pattern="^(Fell|Found)$"),
    meteorite_class: str | None = Query(None),
    use_case: GetMeteoritesUseCase = Depends(),
):
    filters = MeteoriteFilters(
        page=page,
        size=size,
        mass_min=mass_min,
        mass_max=mass_max,
        year_from=year_from,
        year_to=year_to,
        fall=fall,
        meteorite_class=meteorite_class,
    )
    result = await use_case.execute(filters)
    return MeteoritePageResponse(
        items=[_to_response(m) for m in result.items],
        total=result.total,
        page=result.page,
        size=result.size,
        pages=result.pages,
    )


@router.get("/stats", response_model=MeteoriteStatsResponse)
async def get_stats(use_case: GetStatsUseCase = Depends()):
    stats = await use_case.execute()
    return MeteoriteStatsResponse(**stats.__dict__)


@router.get("/search", response_model=list[MeteoriteResponse])
async def search_meteorites(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    use_case: SearchMeteoritesUseCase = Depends(),
):
    results = await use_case.execute(q, limit)
    return [_to_response(m) for m in results]


@router.get("/{meteorite_id}", response_model=MeteoriteResponse)
async def get_meteorite(
    meteorite_id: int,
    use_case: GetMeteoriteUseCase = Depends(),
):
    try:
        meteorite = await use_case.execute(meteorite_id)
        return _to_response(meteorite)
    except MeteoriteNotFoundError:
        raise HTTPException(status_code=404, detail=f"Meteorite {meteorite_id} not found")
