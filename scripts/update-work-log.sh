#!/bin/bash

# 作業ログ更新スクリプト
# 使用方法: ./scripts/update-work-log.sh "作業内容" "対象ファイル" "環境" "方法" "目的" "備考"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CSV_LOG="$PROJECT_ROOT/docs/代行作業log/作業履歴.csv"
MD_LOG="$PROJECT_ROOT/docs/代行作業log/作業履歴_詳細.md"

# 現在の日時を取得
CURRENT_TIME=$(date '+%Y-%m-%d %H:%M')

# 引数チェック
if [ $# -lt 5 ]; then
    echo "使用方法: $0 \"作業内容\" \"対象ファイル\" \"環境\" \"方法\" \"目的\" [\"備考\"]"
    echo ""
    echo "例: $0 \"LINE Provider設定修正\" \"src/lib/auth.ts\" \"VPS\" \"ファイル編集\" \"認証問題解決\" \"id_token_signed_response_alg追加\""
    echo ""
    echo "環境: ローカル / VPS / namecheap など"
    echo "方法: 新規作成 / ファイル編集 / コマンド実行 / SSH接続 など"
    exit 1
fi

WORK_CONTENT="$1"
TARGET_FILE="$2"
ENVIRONMENT="$3"
METHOD="$4"
PURPOSE="$5"
NOTES="${6:-}"

echo "📝 作業ログを更新しています..."
echo "作業内容: $WORK_CONTENT"
echo "対象ファイル: $TARGET_FILE"
echo "環境: $ENVIRONMENT"

# CSVログに追記
echo "$CURRENT_TIME,Claude Code,$WORK_CONTENT,$TARGET_FILE,$ENVIRONMENT,$METHOD,$PURPOSE,完了,$NOTES" >> "$CSV_LOG"

# Markdownログに追記（簡易版）
cat >> "$MD_LOG" << EOF

#### $(date '+%H:%M') - $WORK_CONTENT
- **👤 作業者**: Claude Code Assistant
- **📂 対象ファイル**: \`$TARGET_FILE\`
- **🏠 環境**: $ENVIRONMENT
- **🔧 方法**: $METHOD
- **🎯 目的**: $PURPOSE
- **✅ ステータス**: 完了
$(if [ -n "$NOTES" ]; then echo "- **📝 備考**: $NOTES"; fi)

EOF

echo "✅ 作業ログが更新されました"
echo "CSV: $CSV_LOG"
echo "Markdown: $MD_LOG"

# 最新5件を表示
echo ""
echo "📊 最新の作業履歴（5件）:"
tail -n 5 "$CSV_LOG" | while IFS=',' read -r datetime worker content file env method purpose status note; do
    echo "・$datetime: $content ($env)"
done