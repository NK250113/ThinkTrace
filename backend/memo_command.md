# 重要なコマンド
pip install -r requirements.txt：ライブラリを全て導入する
.venv/Scripts/Activate.ps1：仮想環境に入る(backendに移動の後行うこと)
uvicorn app.main:app --reload：アプリの実行

# Dockerの使用方法
初回： docker compose up --build
次回以降： docker compose up

# Gitへのアップロード方法
初回：
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push

次回以降：
git add .
git commit -m "ログイン画面を追加"
git push

バージョン更新：
git add .
git commit -m "Release v1.0.0"
git tag  -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0

# alembicの更新方法
alembic revision --autogenerate -m "create users table"
alembic upgrade head

