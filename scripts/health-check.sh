#!/bin/bash

# うちのきろく - ヘルスチェックスクリプト
# 作成日: 2025年8月13日
# 目的: Webサイト・データベース・認証API・プロセスの監視

set -e

# 設定
SITE_URL="https://uchinokiroku.com"
DB_CHECK_URL="https://uchinokiroku.com/api/health/db"
AUTH_CHECK_URL="https://uchinokiroku.com/api/health/auth"
LOG_FILE="/var/log/uchi-health.log"
APP_PATH="/var/www/uchi"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 通知関数（後で拡張）
notify_issue() {
    local service="$1"
    local message="$2"
    log "🚨 ALERT: $service - $message"
    
    # TODO: Slack通知・メール通知を後で追加
    echo "🚨 [$service] $message" >> /tmp/uchi-alerts.log
}

notify_recovery() {
    local service="$1"
    log "✅ RECOVERY: $service - Service restored"
    
    # TODO: 復旧通知
    echo "✅ [$service] Service restored" >> /tmp/uchi-alerts.log
}

# 1. Webサイト応答チェック
check_website() {
    log "🔍 Checking website response..."
    
    if curl -f -s --max-time 10 "$SITE_URL" > /dev/null; then
        log "✅ Website: OK"
        return 0
    else
        notify_issue "Website" "Site not responding or returned error"
        return 1
    fi
}

# 2. データベース接続チェック
check_database() {
    log "🔍 Checking database connection..."
    
    # VPS上でPrisma接続テスト
    if cd "$APP_PATH" && timeout 15 npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        log "✅ Database: OK"
        return 0
    else
        notify_issue "Database" "Database connection failed"
        return 1
    fi
}

# 3. 認証API チェック
check_auth_api() {
    log "🔍 Checking authentication API..."
    
    # NextAuth.js セッション確認
    if curl -f -s --max-time 10 "$SITE_URL/api/auth/session" > /dev/null; then
        log "✅ Auth API: OK"
        return 0
    else
        notify_issue "Auth API" "Authentication API not responding"
        return 1
    fi
}

# 4. Next.jsプロセス確認
check_nextjs_process() {
    log "🔍 Checking Next.js process..."
    
    if pgrep -f "next-server\|npm.*dev\|node.*next" > /dev/null; then
        log "✅ Next.js Process: Running"
        return 0
    else
        notify_issue "Next.js Process" "No Next.js processes found"
        return 1
    fi
}

# 5. ディスク使用量チェック
check_disk_usage() {
    log "🔍 Checking disk usage..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        log "✅ Disk Usage: ${usage}% (OK)"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "⚠️ Disk Usage: ${usage}% (Warning)"
        return 0
    else
        notify_issue "Disk Usage" "Disk usage critical: ${usage}%"
        return 1
    fi
}

# 6. メモリ使用量チェック
check_memory_usage() {
    log "🔍 Checking memory usage..."
    
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2 }')
    
    if [ "$usage" -lt 80 ]; then
        log "✅ Memory Usage: ${usage}% (OK)"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "⚠️ Memory Usage: ${usage}% (Warning)"
        return 0
    else
        notify_issue "Memory Usage" "Memory usage critical: ${usage}%"
        return 1
    fi
}

# メイン実行
main() {
    log "🚀 Starting health check..."
    
    local failed_checks=0
    
    # 各チェック実行
    check_website || ((failed_checks++))
    check_nextjs_process || ((failed_checks++))
    check_database || ((failed_checks++))
    check_auth_api || ((failed_checks++))
    check_disk_usage || ((failed_checks++))
    check_memory_usage || ((failed_checks++))
    
    # 結果サマリー
    if [ $failed_checks -eq 0 ]; then
        log "🎉 All checks passed! System healthy."
    else
        log "❌ $failed_checks check(s) failed. See alerts above."
    fi
    
    log "📊 Health check completed."
    echo "---" >> "$LOG_FILE"
    
    return $failed_checks
}

# 引数チェック
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [--verbose]"
    echo "Options:"
    echo "  --verbose    Show detailed output"
    echo "  --help       Show this help"
    exit 0
fi

# 実行
if [ "$1" = "--verbose" ]; then
    main
else
    main > /dev/null 2>&1
fi