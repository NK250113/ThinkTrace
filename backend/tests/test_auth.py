import pytest
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import create_access_token
from app.feature.auth.deps import get_current_user

@pytest.mark.asyncio
async def test_signup_success(client):
    response = await client.post(
        "/signup/confirm",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    body = response.json()

    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert "refresh_token" in body
    assert body["refresh_token_type"] == "bearer"

