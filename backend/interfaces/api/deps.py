from __future__ import annotations

from fastapi import Request

from infrastructure.persistence.sqlalchemy_repo import SQLAlchemyMeteoriteRepository


def get_repo(request: Request) -> SQLAlchemyMeteoriteRepository:
    return request.app.state.repo
