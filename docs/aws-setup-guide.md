# 花粉ガチャアプリ - AWS手動セットアップ手順書

この手順書では、AWSマネジメントコンソールを使って、花粉ガチャアプリのバックエンドを**すべて手動で**構築します。
CDKやSAMは使わず、AWSの各サービスを自分の手で触って学びます。

---

## 目次

1. [事前準備](#1-事前準備)
2. [DynamoDBテーブル作成（3テーブル）](#2-dynamodbテーブル作成)
3. [S3バケット作成（キャラ画像用）](#3-s3バケット作成)
4. [CloudFront設定（CDN）](#4-cloudfront設定)
5. [Lambda関数作成（5関数）](#5-lambda関数作成)
6. [API Gateway作成](#6-api-gateway作成)
7. [EventBridge設定（定期実行）](#7-eventbridge設定)
8. [動作テスト](#8-動作テスト)
9. [フロントエンドとの接続](#9-フロントエンドとの接続)

---

## 1. 事前準備

### 必要なもの
- AWSアカウント（無料利用枠でOK）
- AWSマネジメントコンソールへのアクセス

### リージョン設定
1. AWSマネジメントコンソールにログイン
2. 右上のリージョン選択で **「アジアパシフィック（東京）ap-northeast-1」** を選択
3. 以降、すべての作業をこのリージョンで行う

> ⚠️ リージョンを統一しないとサービス間の連携でエラーになります

---

## 2. DynamoDBテーブル作成

DynamoDBは「NoSQL（非リレーショナル）データベース」です。
テーブルを3つ作ります。

### 2-1. ガチャ結果テーブル

1. サービス検索バーに「DynamoDB」と入力 → DynamoDBを開く
2. 左メニュー「テーブル」→「テーブルの作成」ボタンをクリック
3. 以下を入力：

| 項目 | 値 |
|------|-----|
| テーブル名 | `pollen-gacha-results` |
| パーティションキー | `dateRegion`（型: 文字列） |
| ソートキー | `timestampNickname`（型: 文字列） |
| テーブル設定 | 「デフォルト設定」を選択 |

4. 「テーブルの作成」をクリック
5. ステータスが「アクティブ」になるまで待つ（1〜2分）

> 💡 **パーティションキー**はデータを分類する主キー、**ソートキー**はその中で並べ替えるための副キーです

### 2-2. 花粉データテーブル

1. 「テーブルの作成」をクリック
2. 以下を入力：

| 項目 | 値 |
|------|-----|
| テーブル名 | `pollen-gacha-pollen-data` |
| パーティションキー | `region`（型: 文字列） |
| ソートキー | `date`（型: 文字列） |
| テーブル設定 | 「デフォルト設定」を選択 |

3. 「テーブルの作成」をクリック

### 2-3. ユーザーテーブル

1. 「テーブルの作成」をクリック
2. 以下を入力：

| 項目 | 値 |
|------|-----|
| テーブル名 | `pollen-gacha-users` |
| パーティションキー | `nickname`（型: 文字列） |
| ソートキー | なし（空欄のまま） |
| テーブル設定 | 「デフォルト設定」を選択 |

3. 「テーブルの作成」をクリック

### 確認
- DynamoDB → テーブル一覧に3つのテーブルが表示されていればOK：
  - `pollen-gacha-results`
  - `pollen-gacha-pollen-data`
  - `pollen-gacha-users`

---

## 3. S3バケット作成

S3は「ファイル保管サービス」です。キャラ画像を保存します。

1. サービス検索バーに「S3」と入力 → S3を開く
2. 「バケットを作成」をクリック
3. 以下を入力：

| 項目 | 値 |
|------|-----|
| バケット名 | `pollen-gacha-images-{あなたのAWSアカウントID}` |
| リージョン | アジアパシフィック（東京）ap-northeast-1 |
| パブリックアクセスをすべてブロック | ✅ チェック（デフォルトのまま） |
| バージョニング | 無効 |

> ⚠️ バケット名は世界で一意である必要があります。AWSアカウントIDを末尾につけると被りにくいです
> アカウントIDの確認方法: 右上のアカウント名をクリック → アカウントID

4. 「バケットを作成」をクリック

### 画像をアップロード
1. 作成したバケットをクリックして開く
2. 「フォルダの作成」→ フォルダ名: `characters` → 「フォルダの作成」
3. `characters` フォルダに入る
4. 「アップロード」→ キャラ画像ファイルをドラッグ＆ドロップ
   - ファイル名: `sugicchi.png`, `hinokking.png`, `butakusan.png`, `kamogayar.png`, `inetchi.png`, `yomogirasu.png`, `shirakabaron.png`, `hanamizuking.png`, `matsudaioh.png`, `kafun-daimaoh.png`
5. 「アップロード」をクリック

> 💡 画像がまだなければ後からでOK。フォルバック絵文字が表示されます

---

## 4. CloudFront設定

CloudFrontは「CDN（コンテンツ配信ネットワーク）」です。S3の画像を高速配信します。

1. サービス検索バーに「CloudFront」と入力 → CloudFrontを開く
2. 「ディストリビューションを作成」をクリック
3. 以下を設定：

### オリジン設定
| 項目 | 値 |
|------|-----|
| オリジンドメイン | ドロップダウンからS3バケット `pollen-gacha-images-{ID}` を選択 |
| オリジンアクセス | 「Origin access control settings (recommended)」を選択 |
| Origin access control | 「Create new OAC」をクリック → デフォルトのまま「作成」 |

### デフォルトのキャッシュ動作
| 項目 | 値 |
|------|-----|
| ビューワープロトコルポリシー | 「Redirect HTTP to HTTPS」 |
| キャッシュポリシー | 「CachingOptimized」 |

### その他の設定
| 項目 | 値 |
|------|-----|
| 料金クラス | 「北米と欧州のみ使用」（コスト節約のため） |

4. 「ディストリビューションを作成」をクリック

### 重要: S3バケットポリシーの更新
CloudFront作成後、画面上部にバナーが表示されます：
「S3バケットポリシーを更新する必要があります」

1. 「ポリシーをコピー」をクリック
2. S3コンソールに移動 → バケットを開く
3. 「アクセス許可」タブ → 「バケットポリシー」の「編集」をクリック
4. コピーしたポリシーを貼り付け → 「変更の保存」

### 確認
- CloudFrontコンソールでディストリビューションのステータスが「有効」になるのを待つ（5〜10分かかります）
- ドメイン名（`d1234abcdef.cloudfront.net` 形式）をメモしておく

---

## 5. Lambda関数作成

Lambdaは「サーバーレスで関数を実行するサービス」です。5つの関数を作ります。

### 5-0. IAMロール作成（Lambda用）

Lambda関数がDynamoDBにアクセスするためのIAMロールを先に作ります。

1. サービス検索バーに「IAM」と入力 → IAMを開く
2. 左メニュー「ロール」→「ロールを作成」
3. 設定：

| 項目 | 値 |
|------|-----|
| 信頼されたエンティティタイプ | 「AWSのサービス」 |
| ユースケース | 「Lambda」を選択 |

4. 「次へ」→ 許可ポリシーの検索で以下を検索してチェック：
   - `AmazonDynamoDBFullAccess`
   - `CloudWatchLogsFullAccess`

5. 「次へ」
6. ロール名: `pollen-gacha-lambda-role`
7. 「ロールを作成」

### 5-1. ガチャ実行Lambda

1. サービス検索バーに「Lambda」と入力 → Lambdaを開く
2. 「関数の作成」をクリック
3. 以下を入力：

| 項目 | 値 |
|------|-----|
| 関数名 | `pollen-gacha-execute` |
| ランタイム | Node.js 20.x |
| アーキテクチャ | x86_64 |
| 実行ロール | 「既存のロールを使用する」→ `pollen-gacha-lambda-role` |

4. 「関数の作成」をクリック

5. **コードの入力:**
   - コードソースで `index.mjs` のファイル名を `gacha.mjs` に変更（ファイル名を右クリック → 名前の変更）
   - プロジェクトの `infra/lambda/gacha.mjs` の内容をコピー＆ペースト
   - 「Deploy」をクリック

6. **ランタイム設定の変更:**
   - 「ランタイム設定」タブ → 「編集」
   - ハンドラ: `gacha.handler`
   - 「保存」

7. **環境変数の設定:**
   - 「設定」タブ → 「環境変数」→「編集」
   - 以下を追加：

| キー | 値 |
|------|-----|
| `GACHA_RESULTS_TABLE` | `pollen-gacha-results` |
| `USERS_TABLE` | `pollen-gacha-users` |
| `POLLEN_DATA_TABLE` | `pollen-gacha-pollen-data` |

   - 「保存」

8. **タイムアウトの設定:**
   - 「設定」タブ → 「一般設定」→「編集」
   - タイムアウト: `10` 秒
   - 「保存」

### 5-2. ランキング取得Lambda

上記と同じ手順で以下の設定で作成：

| 項目 | 値 |
|------|-----|
| 関数名 | `pollen-gacha-ranking` |
| ファイル名 | `ranking.mjs` |
| コード | `infra/lambda/ranking.mjs` の内容 |
| ハンドラ | `ranking.handler` |
| 環境変数 | `GACHA_RESULTS_TABLE` = `pollen-gacha-results` |
| タイムアウト | 10秒 |

### 5-3. 花粉データ取得Lambda

| 項目 | 値 |
|------|-----|
| 関数名 | `pollen-gacha-pollen` |
| ファイル名 | `pollen.mjs` |
| コード | `infra/lambda/pollen.mjs` の内容 |
| ハンドラ | `pollen.handler` |
| 環境変数 | `POLLEN_DATA_TABLE` = `pollen-gacha-pollen-data` |
| タイムアウト | 10秒 |

### 5-4. ユーザー登録/統計Lambda

| 項目 | 値 |
|------|-----|
| 関数名 | `pollen-gacha-user` |
| ファイル名 | `user.mjs` |
| コード | `infra/lambda/user.mjs` の内容 |
| ハンドラ | `user.handler` |
| 環境変数 | `USERS_TABLE` = `pollen-gacha-users` |
| タイムアウト | 10秒 |

### 5-5. 花粉データ日次更新Lambda

| 項目 | 値 |
|------|-----|
| 関数名 | `pollen-gacha-pollen-updater` |
| ファイル名 | `pollenUpdater.mjs` |
| コード | `infra/lambda/pollenUpdater.mjs` の内容 |
| ハンドラ | `pollenUpdater.handler` |
| 環境変数 | `POLLEN_DATA_TABLE` = `pollen-gacha-pollen-data` |
| タイムアウト | 30秒 |

### Lambda動作テスト

各Lambdaを作成したら、テストしましょう。

1. Lambda関数のページで「テスト」タブを開く
2. テストイベント名: `test1`

**ガチャLambdaのテストイベント:**
```json
{
  "body": "{\"nickname\": \"テストユーザー\", \"region\": \"tokyo\"}",
  "httpMethod": "POST"
}
```

**ランキングLambdaのテストイベント:**
```json
{
  "queryStringParameters": {
    "date": "2026-03-08",
    "region": "tokyo"
  },
  "httpMethod": "GET"
}
```

**花粉データLambdaのテストイベント:**
```json
{
  "queryStringParameters": {
    "region": "tokyo"
  },
  "httpMethod": "GET"
}
```

**ユーザーLambda（POST）のテストイベント:**
```json
{
  "body": "{\"nickname\": \"テストユーザー\"}",
  "httpMethod": "POST"
}
```

**ユーザーLambda（GET）のテストイベント:**
```json
{
  "httpMethod": "GET"
}
```

**花粉更新Lambdaのテストイベント:**
```json
{}
```

3. 「テスト」をクリック → 緑色で「成功」が表示されればOK！

---

## 6. API Gateway作成

API Gatewayは「APIのエントリーポイント」です。フロントエンドからのリクエストを受けてLambdaに振り分けます。

### 6-1. APIの作成

1. サービス検索バーに「API Gateway」と入力 → API Gatewayを開く
2. 「APIを作成」をクリック
3. **REST API**（REST API プライベートではない方）の「構築」をクリック
4. 以下を入力：

| 項目 | 値 |
|------|-----|
| API名 | `pollen-gacha-api` |
| 説明 | 花粉ガチャアプリ用API |
| APIエンドポイントタイプ | リージョン |

5. 「APIを作成」をクリック

### 6-2. CORSの有効化（各リソースで実施）

フロントエンド（別ドメイン）からAPIを呼び出すためにCORS設定が必要です。

### 6-3. リソースとメソッドの作成

#### /gacha リソース（POST）
1. 「リソースの作成」をクリック
2. リソースパス: `/gacha`
3. 「CORS (Cross Origin Resource Sharing)」にチェック ✅
4. 「リソースの作成」
5. `/gacha` を選択 →「メソッドの作成」
6. 設定：

| 項目 | 値 |
|------|-----|
| メソッドタイプ | POST |
| 統合タイプ | Lambda関数 |
| Lambdaプロキシ統合 | ✅ オン |
| Lambda関数 | `pollen-gacha-execute` |

7. 「メソッドの作成」をクリック

#### /ranking リソース（GET）
1. ルート `/` に戻る →「リソースの作成」
2. リソースパス: `/ranking`
3. CORS ✅
4. 「リソースの作成」
5. `/ranking` →「メソッドの作成」

| 項目 | 値 |
|------|-----|
| メソッドタイプ | GET |
| 統合タイプ | Lambda関数 |
| Lambdaプロキシ統合 | ✅ オン |
| Lambda関数 | `pollen-gacha-ranking` |

6. 「メソッドの作成」

#### /pollen リソース（GET）
1. 同様に `/pollen` リソースを作成（CORS ✅）
2. GETメソッドを追加

| 項目 | 値 |
|------|-----|
| メソッドタイプ | GET |
| Lambdaプロキシ統合 | ✅ オン |
| Lambda関数 | `pollen-gacha-pollen` |

#### /user リソース（POST + GET）
1. `/user` リソースを作成（CORS ✅）
2. **POST**メソッドを追加：Lambda = `pollen-gacha-user`
3. **GET**メソッドを追加：Lambda = `pollen-gacha-user`

### 6-4. APIのデプロイ

1. 「APIをデプロイ」ボタンをクリック
2. ステージ: 「*新しいステージ*」
3. ステージ名: `prod`
4. 「デプロイ」をクリック

### 確認
- デプロイ後に表示される **「URLを呼び出す」** のURLをメモ
- 例: `https://abc123def.execute-api.ap-northeast-1.amazonaws.com/prod`
- このURLがフロントエンドから呼び出すAPIのベースURLになります

### テスト
ブラウザで以下のURLにアクセスして動作確認：
```
https://{あなたのAPIのURL}/prod/pollen?region=tokyo
```
→ JSON形式で花粉データが返ってくればOK！

---

## 7. EventBridge設定

EventBridgeは「スケジュール実行サービス」です。毎日0時に花粉データを自動更新します。

1. サービス検索バーに「EventBridge」と入力 → EventBridgeを開く
2. 左メニュー「ルール」→「ルールを作成」
3. 以下を入力：

### ステップ1: ルールの詳細
| 項目 | 値 |
|------|-----|
| 名前 | `pollen-gacha-daily-update` |
| 説明 | 花粉データの日次更新 |
| イベントバス | default |
| ルールタイプ | スケジュール |

4. 「次へ」

### ステップ2: スケジュール
| 項目 | 値 |
|------|-----|
| スケジュールパターン | cron式 |
| cron式 | `0 0 * * ? *` |

> 💡 これは毎日0:00 UTC（日本時間9:00）に実行される設定です
> 日本時間0:00に実行したい場合は `0 15 * * ? *` にしてください

5. 「次へ」

### ステップ3: ターゲット
| 項目 | 値 |
|------|-----|
| ターゲットタイプ | AWSのサービス |
| ターゲットを選択 | Lambda関数 |
| 関数 | `pollen-gacha-pollen-updater` |

6. 「次へ」→「次へ」→「ルールの作成」

### テスト
- Lambda関数 `pollen-gacha-pollen-updater` のページに行き、テストを実行
- DynamoDB → `pollen-gacha-pollen-data` テーブルを開き、「テーブルアイテムの探索」でデータが入っていることを確認

---

## 8. 動作テスト

すべてのAWSリソースが作成できたら、一通りテストしましょう。

### 8-1. 花粉データ更新テスト
```
GET https://{API_URL}/prod/pollen?region=tokyo
```
→ 花粉レベルが返ってくる

### 8-2. ユーザー登録テスト
```
POST https://{API_URL}/prod/user
Body: {"nickname": "テスト太郎"}
```
→ DynamoDB の `pollen-gacha-users` にデータが追加される

### 8-3. ガチャ実行テスト
```
POST https://{API_URL}/prod/gacha
Body: {"nickname": "テスト太郎", "region": "tokyo"}
```
→ キャラクターデータが返ってくる

### 8-4. ランキング取得テスト
```
GET https://{API_URL}/prod/ranking?region=tokyo
```
→ ガチャ結果のランキングが返ってくる

### 8-5. 利用者数取得テスト
```
GET https://{API_URL}/prod/user
```
→ 総利用者数が返ってくる

> 💡 テストにはブラウザ、curl、またはPostmanなどのAPIテストツールを使用できます

### curlでのテスト例
```bash
# 花粉データ取得
curl https://{API_URL}/prod/pollen?region=tokyo

# ユーザー登録
curl -X POST https://{API_URL}/prod/user \
  -H "Content-Type: application/json" \
  -d '{"nickname": "テスト太郎"}'

# ガチャ実行
curl -X POST https://{API_URL}/prod/gacha \
  -H "Content-Type: application/json" \
  -d '{"nickname": "テスト太郎", "region": "tokyo"}'

# ランキング取得
curl https://{API_URL}/prod/ranking?region=tokyo

# 利用者数取得
curl https://{API_URL}/prod/user
```

---

## 9. フロントエンドとの接続

APIが動作確認できたら、Next.jsフロントエンドと接続します。

### 9-1. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```
NEXT_PUBLIC_API_URL=https://{あなたのAPI GatewayのURL}/prod
NEXT_PUBLIC_APP_URL=https://あなたのアプリのURL
```

### 9-2. フロントエンドのAPI呼び出し

フロントエンドのコードを修正して、ローカルのガチャロジックの代わりにAPI Gateway経由のLambdaを呼び出すようにします。
（この作業は次のステップで実施）

---

## 構成図（完成イメージ）

```
[ユーザー] → [Next.js (Vercel)]
                    │
                    ▼
            [API Gateway]
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  [Lambda:         [Lambda:    [Lambda:
   ガチャ実行]     ランキング]  花粉データ取得]
        │           │           │
        ▼           ▼           ▼
    [DynamoDB: results] [DynamoDB: pollen-data]
                              ▲
                              │ (毎日0時)
                    [EventBridge]
                              │
                              ▼
                    [Lambda: 花粉データ更新]

[S3 + CloudFront] ← キャラ画像配信
```

---

## 料金について

| サービス | 無料利用枠 |
|---------|-----------|
| DynamoDB | 25GBストレージ + 読み書きリクエスト月25万回まで無料 |
| Lambda | 月100万リクエスト + 40万GB秒まで無料 |
| API Gateway | REST APIは月100万コールまで無料（12ヶ月） |
| S3 | 5GBストレージまで無料（12ヶ月） |
| CloudFront | 月1TBデータ転送まで無料（12ヶ月） |
| EventBridge | 月1400万イベントまで無料 |

> 💡 学習・ポートフォリオ用途であれば、無料利用枠内に収まる規模です

---

## トラブルシューティング

### Lambda関数がエラーになる
- CloudWatch Logsでエラーログを確認
  - Lambda関数 →「モニタリング」タブ →「CloudWatch Logsを表示」
- 環境変数が正しく設定されているか確認
- IAMロールにDynamoDBへのアクセス権限があるか確認

### API Gatewayからのレスポンスがエラー
- Lambda関数のテストが成功するか先に確認
- CORSが正しく設定されているか確認
- APIをデプロイしたか確認（変更後は必ず再デプロイが必要）

### CORSエラーが出る
- API Gatewayの各リソースでCORSが有効になっているか確認
- Lambda関数のレスポンスヘッダーに `Access-Control-Allow-Origin: *` が含まれているか確認
- APIを再デプロイする

---

## 次のステップ

- [ ] キャラ画像を作成してS3にアップロード
- [ ] フロントエンドとAPIの接続実装
- [ ] Vercelにデプロイ
- [ ] Qiita記事執筆
