# 花粉ガチャアプリ - AWS構築 備忘録

AWS手動構築で詰まったポイントと解決方法をまとめた備忘録です。
Qiita記事執筆時の参考用。

---

## 2026-03-09

### 1. EventBridge「ルール」画面にスケジュール設定がない

**現象**
EventBridgeの「ルール」→「ルールを作成」を開いたが、ルールタイプに「スケジュール」の選択肢が表示されない。
画面にはトリガーイベント（イベントパターン）とターゲットの設定しか出てこなかった。

**原因**
AWSコンソールのUIが更新され、スケジュール機能は **EventBridge Scheduler** という別サービスに移行されていた。
「ルール」メニューはイベントパターンベースのルール専用になっている。

**解決方法**
1. 「ルールを作成」画面はキャンセル
2. EventBridge左メニューの **「スケジュール」**（Scheduler > スケジュール）を選択
3. 「スケジュールを作成」から以下を設定：
   - スケジュール名: `pollen-gacha-daily-update`
   - スケジュールパターン: cronベースのスケジュール → `0 0 * * ? *`
   - フレックスタイムウィンドウ: オフ
   - ターゲットAPI: AWS Lambda - Invoke → `pollen-gacha-pollen-updater`
   - 実行ロール: 新しいロールを作成

**学び**
- AWSのコンソールUIは頻繁に変わる。ネット上の手順書が古い場合がある
- EventBridgeのスケジュール機能はEventBridge Schedulerに完全移行している

---

### 2. API Gateway `/user` エンドポイントが 405 Method Not Allowed

**現象**
`POST /user`（ユーザー登録）と `GET /user`（利用者数取得）の両方で以下のレスポンスが返ってきた：
```json
{"statusCode": 405, "body": "{\"error\":\"Method not allowed\"}"}
```
他のエンドポイント（`/gacha`, `/pollen`, `/ranking`）は正常に動作していた。

**原因**
API Gatewayの `/user` リソースで **Lambdaプロキシ統合がオフ** になっていた。

Lambdaプロキシ統合がオフだと、API GatewayからLambdaに渡される `event` オブジェクトに `httpMethod` が含まれない。
Lambda関数内の `event.httpMethod` が `undefined` になり、POST/GETの条件分岐をすり抜けて `405 Method not allowed` が返されていた。

**解決方法**
1. API Gateway → `pollen-gacha-api` → 左メニュー **「リソース」** を選択
2. `/user` → POST メソッドをクリック
3. 「統合リクエスト」→「編集」→ **Lambdaプロキシ統合をオン** にして保存
4. GET メソッドも同様に修正
5. **APIを再デプロイ**（変更後は必ず再デプロイが必要）

**学び**
- Lambdaプロキシ統合がオフだと `httpMethod`, `headers`, `queryStringParameters` などがeventに含まれない
- 設定の確認は「ステージ」画面ではなく「リソース」画面で行う
- API Gatewayの設定変更後は**必ず再デプロイ**しないと反映されない

---

### 3. テストスクリプトの作成

**背景**
ガイドのテスト手順では `{API_URL}` を毎回手動で置き換える必要があり面倒だった。

**対応**
`scripts/test-api.sh` を作成。スクリプト上部の `API_URL` を1箇所設定すれば、5つのAPIエンドポイントを一括テストできるようにした。

```bash
# 実行方法
./scripts/test-api.sh
```

**最終テスト結果（全5テストOK）**
| テスト | 結果 | レスポンス例 |
|--------|------|-------------|
| 花粉データ取得 | OK | `{"region":"tokyo","level":5,"levelLabel":"極めて多い"}` |
| ユーザー登録 | OK | `{"message":"User already exists"}` |
| ガチャ実行 | OK | `{"character":{"name":"ブタクサン","rarity":"N"}}` |
| ランキング取得 | OK | `{"ranking":[...]}` |
| 利用者数取得 | OK | `{"totalUsers":2}` |
