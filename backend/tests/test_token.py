import pytest
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import create_access_token
from app.feature.auth.deps import get_current_user


def test_create_access_token():
    data = {"sub": "123"}

    token = create_access_token(data)

    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )

    assert payload["sub"] == "123"
    assert "exp" in payload


@pytest.mark.asyncio
async def test_get_current_user(db, test_user):
    token = create_access_token(
        {"sub": str(test_user.id)}
    )

    user = await get_current_user(
        db=db,
        token=token,
    )

    assert user.id == test_user.id


@pytest.mark.asyncio
async def test_get_my_profile(client, test_user):
    token = create_access_token(
        {"sub": str(test_user.id)}
    )

    response = await client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_my_profile_without_token(client):
    response = await client.get("/users/me")

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_my_profile_with_invalid_token(client):
    response = await client.get(
        "/users/me",
        headers={
            "Authorization": "Bearer invalid-token"
        },
    )

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_my_profile_without_sub(client):
    token = create_access_token({})

    response = await client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_my_profile_with_nonexistent_user(client):
    token = create_access_token(
        {"sub": "99999999"}
    )

    response = await client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_my_profile_with_expired_token(client):
    token = create_access_token(
        {"sub": "1"},
        expires_delta=timedelta(seconds=-1),
    )

    response = await client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 401
