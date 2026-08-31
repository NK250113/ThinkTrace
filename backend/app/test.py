# 通信のテスト用ファイルです
# 実際のアプリとは関係がありません
from fastapi import FastAPI
app = FastAPI()
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

@app.get("/api/message")
def get_message():
    return {"message": "Hello from FastAPI!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    name: str


@app.post("/api/users")
def create_user(user: UserRequest):
    return {
        "message": f"こんにちは、{user.name}さん！"
    }
