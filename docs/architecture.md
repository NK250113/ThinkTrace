## 技術構成
### 言語
- Python
- JavaScript
### フレームワーク
- React
- TipTapというのが使えるらしい
### インフラ
- Docker
- Render
### データベース
- PostgreSQL
### 使用ライブラリ
- FastAPI

## 設計
### ディレクトリ構成
```text
ThinkTrace/
│
├── backend/
│   ├── app/
│   │   ├── api/             # API送受信の処理
│   │   │   ├── routes/       # APIを受け取って対応する機能を呼び出す
│   │   │   │   ├── auth.py    # アカウント関連
│   │   │   │   └── memo.py    # メモ関連
│   │   │   └── deps.py       # ファイルの接続設定
│   │   │
│   │   ├── core/            # 色々な設定
│   │   │   ├── config.py     # アプリの全体的な定数設定
│   │   │   └── security.py   # JWTやハッシュ関数などセキュリティ関連の設定
│   │   │
│   │   ├── db/              # データベースの処理
│   │   │   ├── database.py   # PostgreSQLへの接続
│   │   │   └── models.py     # データベースの要素を入れるクラスの定義
│   │   │
│   │   ├── schemas/         # データをクラスに整形する
│   │   │   ├── memo.py       # この辺りはapi/routes/ と同じ
│   │   │   └── user.py
│   │   │
│   │   ├── crud/            # アプリの処理
│   │   │   ├── auth.py
│   │   │   └── memo.py
│   │   │
│   │   ├── main.py          # FastAPIの起動
│   │   │
│   │   └── __init__.py
│   │
│   ├── tests/
│   │   ├── test_auth.py
│   │   └── test_memo.py
│   │
│   ├── requirements.txt
│   ├── .env                # 機密情報を記載する(Gitには上げない)
│   └── Dockerfile
│
├── frontend/                 # React
│   ├── public/
│   ├── src/
│   │   ├── components/  # HTMLに載せる部品
│   │   ├── pages/       # 各ページの基本的なHTML
│   │   ├── hooks/       # React特有の処理の記載
│   │   ├── services/    # FastAPIへの通信(axios)
│   │   ├── types/       # TypeScriptの型の記載
│   │   ├── App.tsx0
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
├── .gitignore
└── render.yaml（任意）
```
### アーキテクチャ
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="diagrams/architecture_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="diagrams/architecture_light.svg">
    <img alt="アーキテクチャ" src="diagrams/architecture_light.svg">
  </picture>

### ER図
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="diagrams/ERDiagram_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="diagrams/ERDiagram_light.svg">
    <img alt="ER図" src="diagrams/ERDiagram_light.svg">
  </picture>
