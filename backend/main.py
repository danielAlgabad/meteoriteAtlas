import logging
import os

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from infrastructure.csv_loader import CsvDataLoader
from infrastructure.persistence.models import Base
from infrastructure.persistence.sqlalchemy_repo import SQLAlchemyMeteoriteRepository
from interfaces.api.routers.meteorites import router as meteorites_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meteorites.db")

db_url = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
engine = create_async_engine(db_url, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False)

repo = SQLAlchemyMeteoriteRepository(session_factory)
loader = CsvDataLoader()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database ready")

    app.state.repo = repo

    count = await repo.count()
    if count == 0:
        logger.info("Empty database — loading from CSV...")
        try:
            meteorites = loader.load_all()
            await repo.save_batch(meteorites)
        except Exception:
            logger.warning("CSV load failed — server will start with empty database.")

    yield

    await engine.dispose()


app = FastAPI(
    title="Meteorite Atlas API",
    description="RESTful API serving NASA meteorite landing data.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(meteorites_router)


@app.get("/health")
async def health():
    count = await repo.count()
    return {"status": "ok", "meteorites_in_db": count}
