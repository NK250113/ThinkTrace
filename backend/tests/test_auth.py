import pytest
"""
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
"""
# 1. 正常系
# 2. メール重複
# 3. パスワードが短い
# 4. パスワードが長い
# 5. 名前が長い
# 6. メール形式が不正
# 7. 必須項目がない