#!/bin/bash
# 作業ログ自動更新スクリプト
# Windows環境対応版

TASK_ID="$1"
STATUS="$2"
DESCRIPTION="$3"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
CSV_FILE="docs/代行作業log/作業履歴.csv"

# 引数チェック
if [ -z "$TASK_ID" ] || [ -z "$STATUS" ] || [ -z "$DESCRIPTION" ]; then
    echo "❌ 使用方法: ./auto-log-update.sh <TASK_ID> <STATUS> <DESCRIPTION>"
    echo "例: ./auto-log-update.sh F003 completed プレビュー機能実装"
    exit 1
fi

# セッション状態更新
echo "$TIMESTAMP: $TASK_ID - $DESCRIPTION ($STATUS)" > .session-state

# CSV記録
echo "$TIMESTAMP,Claude Code,$DESCRIPTION,$TASK_ID,Windows,TodoWrite自動更新,$TASK_ID実装,$STATUS,自動記録" >> "$CSV_FILE"

# 成功メッセージ
echo "📊 作業記録更新: $TASK_ID - $STATUS"
echo "💾 セッション状態保存: .session-state"

# PROJECT_MANAGEMENT.md更新提案（手動確認用）
if [ "$STATUS" = "completed" ]; then
    echo "✅ PROJECT_MANAGEMENT.md更新推奨: $TASK_ID を完了に変更"
fi