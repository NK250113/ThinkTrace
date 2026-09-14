"""
import pytest
@pytest.mark.asyncio
async def test_create_user(client):
    response = await client.post(
        "/users",
        params={
            "name": "Taro",
            "email": "taro@example.com",
        },
    )

    assert response.status_code == 200


from sqlalchemy import select

from app.models import User


def test_create_user_and_check_database(client, db):
    response = client.post(
        "/users",
        params={
            "name": "Taro",
            "email": "taro@example.com",
        },
    )

    assert response.status_code == 200

    user = db.execute(
        select(User)
    ).scalar_one()

    assert user.name == "Taro"


def test_get_user(client, db):
    user = User(
        name="Taro",
        email="taro@example.com",
    )

    db.add(user)
    db.flush()

    response = client.get(
        f"/users/{user.id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Taro"
"""