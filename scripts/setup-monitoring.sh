#!/bin/bash

# VPS監視システムセットアップスクリプト
# VPS上で実行してローカル監視を設定

set -e

APP_PATH="/var/www/uchi"
SCRIPT_PATH="$APP_PATH/scripts/health-check.sh"
LOG_DIR="/var/log"
CRON_FILE="/tmp/uchi-cron"

echo "🔧 Setting up monitoring system on VPS..."

# 1. ログディレクトリ確認
echo "📁 Setting up log directory..."
sudo mkdir -p "$LOG_DIR"
sudo touch "$LOG_DIR/uchi-health.log"
sudo chmod 644 "$LOG_DIR/uchi-health.log"

# 2. ヘルスチェックスクリプト実行権限設定
echo "🔐 Setting script permissions..."
chmod +x "$SCRIPT_PATH"

# 3. 初回ヘルスチェック実行
echo "🏥 Running initial health check..."
"$SCRIPT_PATH" --verbose

# 4. cron設定
echo "⏰ Setting up cron job..."

# 既存のcron取得
crontab -l 2>/dev/null > "$CRON_FILE" || touch "$CRON_FILE"

# 重複チェック
if ! grep -q "health-check.sh" "$CRON_FILE"; then
    echo "# うちのきろく ヘルスチェック - 毎5分実行" >> "$CRON_FILE"
    echo "*/5 * * * * $SCRIPT_PATH >> $LOG_DIR/uchi-health.log 2>&1" >> "$CRON_FILE"
    
    # cron設定適用
    crontab "$CRON_FILE"
    echo "✅ Cron job added: Health check every 5 minutes"
else
    echo "ℹ️ Cron job already exists"
fi

# 5. アラートログファイル作成
sudo touch /tmp/uchi-alerts.log
sudo chmod 666 /tmp/uchi-alerts.log

echo "🎉 Monitoring setup completed!"
echo ""
echo "📋 Setup Summary:"
echo "- Health check script: $SCRIPT_PATH"
echo "- Log file: $LOG_DIR/uchi-health.log"
echo "- Alert file: /tmp/uchi-alerts.log"
echo "- Cron schedule: Every 5 minutes"
echo ""
echo "🔍 Check status with:"
echo "  tail -f $LOG_DIR/uchi-health.log"
echo "  crontab -l"
echo ""
echo "🧪 Test manually with:"
echo "  $SCRIPT_PATH --verbose"

# クリーンアップ
rm -f "$CRON_FILE"