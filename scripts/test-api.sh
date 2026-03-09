#!/bin/bash
# 花粉ガチャAPI 動作テストスクリプト
# 使い方: ./scripts/test-api.sh

# ============================================
# ここにAPI GatewayのURLを設定してください
# API Gateway → ステージ → prod → 「URLを呼び出す」に表示されるURL
# ============================================
API_URL="https://yjp4mjhvhc.execute-api.ap-northeast-1.amazonaws.com/prod"

# --- 色付き出力用 ---
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "====================================="
echo " 花粉ガチャAPI テスト"
echo " API_URL: $API_URL"
echo "====================================="
echo ""

# 1. 花粉データ取得
echo -e "${CYAN}[1/5] 花粉データ取得 (GET /pollen?region=tokyo)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/pollen?region=tokyo")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}  OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}  NG (HTTP $HTTP_CODE)${NC}"
fi
echo "  $BODY" | head -3
echo ""

# 2. ユーザー登録
echo -e "${CYAN}[2/5] ユーザー登録 (POST /user)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/user" \
  -H "Content-Type: application/json" \
  -d '{"nickname": "テスト太郎"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}  OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}  NG (HTTP $HTTP_CODE)${NC}"
fi
echo "  $BODY" | head -3
echo ""

# 3. ガチャ実行
echo -e "${CYAN}[3/5] ガチャ実行 (POST /gacha)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/gacha" \
  -H "Content-Type: application/json" \
  -d '{"nickname": "テスト太郎", "region": "tokyo"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}  OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}  NG (HTTP $HTTP_CODE)${NC}"
fi
echo "  $BODY" | head -3
echo ""

# 4. ランキング取得
TODAY=$(date +%Y-%m-%d)
echo -e "${CYAN}[4/5] ランキング取得 (GET /ranking?region=tokyo&date=$TODAY)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/ranking?region=tokyo&date=$TODAY")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}  OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}  NG (HTTP $HTTP_CODE)${NC}"
fi
echo "  $BODY" | head -3
echo ""

# 5. 利用者数取得
echo -e "${CYAN}[5/5] 利用者数取得 (GET /user)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/user")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}  OK (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}  NG (HTTP $HTTP_CODE)${NC}"
fi
echo "  $BODY" | head -3
echo ""

echo "====================================="
echo " テスト完了"
echo "====================================="
