# backend/
## app内部での基本動作
1. ReactなどからHTTPリクエストが送られる
2. app/routes/ でリクエストを受信する
3. crud/ でリクエストを処理する
   ときにdb/ から PostgreSQL を操作する

- schemas/ APIのデータ形式を定義
- core/ アプリの設定を記述する

## 内部での各ディレクトリの責務
### api
- APIでのリクエストを受け取り、処理部分を呼び出す
- この中では処理は行わず、データのやり取りのみを行う
- deps.py: 依存関係を用意することで、不正な実行を自動的に排除する

### core
- アプリの設定を記述する
- 基本的には.envファイルを読み込み、バックエンドで利用可能にすることが責務
- security.py: パスワードの保存形式などセキュリティについて
- config.py: アプリ全体について

### db
- DB (本アプリではPostgreSQL) の操作を行う
- database.py: DBと接続し操作する
- models.py: DBのテーブルをPythonで表現する

### schemas
- APIでの送受信データの形式を定義する
- DBの送受信形式とは差異があるためそちらは db/momels.py で定義する

### crud
- APIに対する処理の内容を記述する
- APIの送受信は行わない

## backend/app/ 以外
- tests/: 各APIごとに必要なテストを実施する
- requirements.txt: 必要ライブラリの一覧
- .env: 環境ごとに変わる秘密情報・設定
