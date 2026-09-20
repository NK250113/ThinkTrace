import asyncio

import pytest, pytest_asyncio
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from testcontainers.community.postgres import PostgresContainer

from app.core.database import get_db
from app.core import models
from app.main import app


@pytest.fixture(scope="session")
def postgres():
    with PostgresContainer(
        "postgres:16",
        username="test",
        password="test",
        dbname="test",
    ) as container:
        yield container


@pytest_asyncio.fixture(scope="session")
async def migrated_db(postgres):
    url = make_url(postgres.get_connection_url())
    url = url.set(drivername="postgresql+psycopg")

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option(
        "sqlalchemy.url",
        url.render_as_string(hide_password=False),
    )

    await asyncio.to_thread(
        command.upgrade,
        alembic_cfg,
        "head",
    )

    yield

@pytest_asyncio.fixture
async def engine(postgres):
    url = make_url(postgres.get_connection_url())
    url = url.set(drivername="postgresql+asyncpg")

    engine = create_async_engine(url)

    yield engine

    await engine.dispose()


@pytest_asyncio.fixture
async def db(engine, migrated_db):
    connection = await engine.connect()
    transaction = await connection.begin()

    session_factory = async_sessionmaker(
        bind=connection,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        join_transaction_mode="create_savepoint",
    )

    session = session_factory()

    try:
        yield session
    finally:
        await session.close()
        await transaction.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def client(db):
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def test_user(db):
    user = models.Users(
        name="testuser",
        email="test@example.com",
        hashed_password="hashedpassword",
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    return user
