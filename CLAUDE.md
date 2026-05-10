Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Meteorite Atlas — Project Guide for Claude Code

## Description
Interactive meteorite impact dashboard with a 3D globe, animated timeline and advanced filters.
Data sourced from the NASA Meteorite Landing API (~45,000 records).
Portfolio project: emphasis on visual quality and clean code.

---

## General Architecture

```
NASA API → FastAPI (Python) → SQLite → React + React Three Fiber
```

- **Backend**: FastAPI + SQLite + APScheduler.
- **Frontend**: React + Vite + React Three Fiber.
- **Deployment**: Railway (backend) + Vercel (frontend). Target cost: $0.

---

## Tech Stack

### Backend (`/backend`)
- Python 3.11+
- FastAPI — main framework
- SQLAlchemy — ORM for SQLite
- Pydantic v2 — models and validation
- APScheduler — periodic NASA data sync
- HTTPX — async HTTP client for NASA API
- Pytest — tests

### Frontend (`/frontend`)
- React 18 + Vite
- React Three Fiber — 3D globe
- @react-three/drei — 3D helpers (controls, textures, etc.)
- Three.js — underlying 3D engine
- Zustand — global state (filters, selected meteorite)
- TanStack Query — fetching, caching and synchronisation
- Recharts — 2D charts (timeline, statistics)
- Tailwind CSS — styling
- Vitest + Testing Library — tests

---

## Backend Architecture

The backend follows a **Clean Architecture + pragmatic DDD** approach. The goal is clear separation of concerns without over-engineering.

### Layer responsibilities

**`domain/`** — Pure business logic. Zero dependencies on FastAPI, SQLAlchemy or any external library. This is the heart of the application and must remain framework-agnostic.

- `entity.py` — Meteorite entity with behaviour, not just data:
  ```python
  class Meteorite:
      def is_large(self) -> bool:
          return self.mass.value > 1_000_000  # > 1 tonne

      def fell_in_century(self, century: int) -> bool:
          return (century - 1) * 100 <= self.year < century * 100

      def has_valid_coordinates(self) -> bool:
          return self.coordinates is not None
  ```

- `value_objects.py` — Encapsulate validation of primitives:
  ```python
  class Mass:
      def __init__(self, value: float):
          if value < 0:
              raise InvalidMassError("Mass cannot be negative")
          self.value = value

  class Coordinates:
      def __init__(self, lat: float, lon: float):
          if not (-90 <= lat <= 90):
              raise InvalidCoordinatesError(f"Invalid latitude: {lat}")
          self.lat, self.lon = lat, lon
  ```

- `repository.py` — Protocol (interface) only. No implementation here:
  ```python
  class MeteoriteRepository(Protocol):
      async def find_all(self, filters: MeteoriteFilters) -> list[Meteorite]: ...
      async def find_by_id(self, id: int) -> Meteorite | None: ...
      async def count(self) -> int: ...
      async def save_batch(self, meteorites: list[Meteorite]) -> None: ...
  ```

**`application/`** — Use cases. One class per operation, depends only on domain interfaces:
  ```python
  class GetMeteoritesUseCase:
      def __init__(self, repo: MeteoriteRepository):
          self.repo = repo

      async def execute(self, filters: MeteoriteFilters) -> MeteoritePage:
          return await self.repo.find_all(filters)
  ```

**`infrastructure/`** — Concrete implementations of domain interfaces. SQLAlchemy, HTTPX and APScheduler live here. Never imported from domain or application layers.

**`interfaces/`** — FastAPI routers and Pydantic schemas. Translates HTTP requests into use case calls and domain objects into JSON responses.

### Dependency direction (strictly enforced)
```
interfaces → application → domain ← infrastructure
```
Infrastructure depends on domain (implements its interfaces), never the other way around.

### What DDD concepts are NOT used here
- Aggregates — single entity, no complex relations to manage
- Domain Events — no cross-domain side effects
- Full CQRS — overkill for this dataset size
- Multiple Bounded Contexts — only one domain: meteorites

---

```
meteorite-atlas/
├── CLAUDE.md                  ← This file
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml             ← Automated tests on every PR
├── backend/
│   ├── main.py                ← FastAPI app entry point
│   ├── requirements.txt
│   ├── domain/                ← Pure business logic, no framework deps
│   │   ├── meteorite/
│   │   │   ├── entity.py          ← Meteorite entity with behaviour
│   │   │   ├── repository.py      ← Repository Protocol (interface)
│   │   │   └── value_objects.py   ← Mass, Coordinates, MeteoriteClass
│   │   └── shared/
│   │       └── exceptions.py      ← Domain exceptions
│   ├── application/           ← Use cases (one file per operation)
│   │   ├── get_meteorites.py
│   │   ├── get_meteorite.py
│   │   ├── get_stats.py
│   │   └── sync_nasa.py
│   ├── infrastructure/        ← Concrete implementations
│   │   ├── persistence/
│   │   │   ├── sqlalchemy_repo.py ← MeteoriteRepository implementation
│   │   │   └── models.py          ← SQLAlchemy ORM models
│   │   ├── nasa/
│   │   │   └── nasa_client.py     ← Async NASA API HTTP client
│   │   └── scheduler/
│   │       └── sync_scheduler.py  ← APScheduler monthly sync
│   ├── interfaces/            ← Framework entry points
│   │   └── api/
│   │       ├── routers/
│   │       │   └── meteorites.py  ← FastAPI route handlers
│   │       └── schemas/
│   │           └── meteorite.py   ← Pydantic request/response schemas
│   └── tests/
│       ├── domain/
│       │   └── test_meteorite_entity.py
│       ├── application/
│       │   └── test_get_meteorites.py
│       └── infrastructure/
│           └── test_sqlalchemy_repo.py
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        │   ├── Globe/
        │   │   ├── Globe.jsx          ← Main 3D globe
        │   │   ├── MeteoritePoint.jsx ← Individual instanced point
        │   │   └── GlobeControls.jsx  ← Camera controls
        │   ├── Timeline/
        │   │   ├── Timeline.jsx
        │   │   └── TimelineChart.jsx
        │   ├── FilterPanel/
        │   │   ├── FilterPanel.jsx
        │   │   ├── MassFilter.jsx
        │   │   └── YearFilter.jsx
        │   └── MeteoriteDetail/
        │       └── MeteoriteDetail.jsx
        ├── hooks/
        │   ├── useMeteorities.js      ← Main data fetching
        │   ├── useFilters.js          ← Filter logic
        │   └── useGlobe.js            ← Globe state
        ├── services/
        │   └── api.js                 ← HTTP client
        ├── store/
        │   └── index.js               ← Zustand store
        └── tests/
            └── components/
```

---

## Backend API

Dev base URL: `http://localhost:8000`
Production base URL: env variable `VITE_API_URL`

### Available endpoints

```
GET  /meteorites              Paginated list with optional filters
GET  /meteorites/{id}         Single meteorite detail
GET  /meteorites/stats        Aggregated global statistics
GET  /meteorites/search?q=    Search by name or location
GET  /health                  Health check
```

### /meteorites query parameters

```
page          int     Page number (default: 1)
size          int     Results per page (default: 100, max: 500)
mass_min      float   Minimum mass in grams
mass_max      float   Maximum mass in grams
year_from     int     Year range start
year_to       int     Year range end
fall          string  "Fell" or "Found"
class         string  Meteorite class (e.g. "L5", "H4")
```

### Response model (Meteorite)

```json
{
  "id": 1,
  "name": "Aachen",
  "mass": 21.0,
  "year": 1880,
  "lat": 50.775,
  "lon": 6.083,
  "class": "L5",
  "fall": "Fell"
}
```

---

## Code Conventions

### Frontend (JavaScript/React)
- Components in **PascalCase**: `Globe.jsx`, `FilterPanel.jsx`
- Custom hooks in **camelCase** with `use` prefix: `useMeteorities.js`
- Service files in **camelCase**: `api.js`
- Zustand store in `/store/index.js` — single store with domain slices
- Imports ordered: external libraries → internal components → hooks → services

### 3D Performance (critical)
- **ALWAYS use InstancedMesh** for globe points — never individual Mesh per meteorite
- Cap at **10,000 visible points** maximum on screen (filter by mass or apply LOD)
- Use `useMemo` for globe geometries and materials
- Globe textures loaded with `useTexture` from @react-three/drei

### Tests
- Tests in `/src/tests/components/` mirroring the structure of `/src/components/`
- File naming: `Globe.test.jsx`, `useMeteorities.test.js`
- Each component must have at minimum: renders without errors, basic snapshot, main interaction
- **Do not** create empty snapshots or assertions-free tests

### Git
- Commit messages in English, format: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`
- One commit per completed task with passing tests
- Never commit `node_modules`, `.env` files, or build artifacts

---

## Environment Variables

### Backend (`.env` in `/backend`)
```
NASA_API_URL=https://data.nasa.gov/resource/gh4g-9sfh.json
DATABASE_URL=sqlite:///./meteorites.db
CACHE_TTL_SECONDS=3600
SCHEDULER_INTERVAL_HOURS=720
```

### Frontend (`.env` in `/frontend`)
```
VITE_API_URL=http://localhost:8000
```

---

## Useful Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # Development
pytest tests/                      # Run tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev                        # Development (port 5173)
npm run build                      # Production build
npm run test                       # Run tests with Vitest
npm run test:coverage              # Coverage report
```

---

## Important Notes for Claude Code

1. **The backend is developed by the user** — do not modify any files under `/backend` unless explicitly instructed.
2. **Before any large refactor**, use `/plan` to show what will change before executing.
3. **Globe performance is the top priority** — when in doubt between elegant code and performant code, choose performance.
4. **Respect the documented endpoints** — if the backend is missing a needed endpoint, flag it to the user instead of inventing a workaround.
5. **Tests are mandatory** — every new component or hook must include its tests in the same commit.
