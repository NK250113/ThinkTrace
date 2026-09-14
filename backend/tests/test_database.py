import pytest
from sqlalchemy import text, inspect
from sqlalchemy.orm import configure_mappers

@pytest.mark.asyncio
async def test_database_connection(db):
    result = await db.execute(text("SELECT 1"))

    assert result.scalar() == 1


@pytest.mark.asyncio
async def test_database_migration(db):
    def get_table_names(connection):
        return inspect(connection).get_table_names()

    connection = await db.connection()

    table_names = await connection.run_sync(get_table_names)

    print("TABLES:", table_names)
    assert "users" in table_names


@pytest.mark.asyncio
async def test_all_mappers_can_be_configured():
    configure_mappers()


import pytest
from sqlalchemy import select

from app.core import models

# 内部でコミットした状況を再現
@pytest.mark.asyncio
async def test_database_is_rolled_back(db):
    user = models.Users(
        name="Test User",
        email="rollback@example.com",
        hashed_password="password",
    )

    db.add(user)
    await db.commit()

    result = await db.execute(
        select(models.Users).where(
            models.Users.email == "rollback@example.com"
        )
    )

    assert result.scalar_one_or_none() is not None

# 内部でコミットがあっても、テスト終了後にロールバックされることを確認
@pytest.mark.asyncio
async def test_database_is_clean(db):
    result = await db.execute(
        select(models.Users).where(
            models.Users.email == "rollback@example.com"
        )
    )

    assert result.scalar_one_or_none() is None
