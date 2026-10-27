# 重要なコマンド
### ライブラリを全て導入する
pip install -r requirements.txt

### バックエンドの起動
cd backend
.venv/Scripts/Activate.ps1
uvicorn app.main:app --reload

### フロントエンドの起動
cd frontend
npm run dev

# Dockerの使用方法
### 初回
docker compose up --build

### 次回以降
docker compose up

# Gitへのアップロード方法
### 初回
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push

### 次回以降
git add .
git commit -m "ログイン画面を追加"
git push

### 入れ忘れに気づいたとき
git commit --amend --no-edit

### バージョン更新
git add .
git commit -m "Release v1.0.0"
git tag  -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0

# alembicの更新方法
alembic revision --autogenerate -m "create users table"
alembic upgrade head

# schemas.py→types.tsへの変換
npm run generate-api
