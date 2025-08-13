#!/bin/bash

# 🧹 環境クリーンアップスクリプト (統合版)
# 作成日: 2025年8月13日  
# 更新日: 2025年8月13日
# 目的: ローカル・VPS環境の残渣・汚染を自動クリーンアップ

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VPS_HOST="conoha-vps"  # SSH config使用
CLEANUP_LOG="/tmp/uchi-cleanup-$(date +%Y%m%d-%H%M%S).log"

echo "🧹 環境クリーンアップスクリプト"
echo "==============================="

# 引数チェック
if [ $# -eq 0 ]; then
    echo "使用方法: $0 [local|vps|both]"
    exit 1
fi

cleanup_local() {
    echo "📍 ローカル環境のクリーンアップ開始..." | tee -a "$CLEANUP_LOG"
    
    # Dockerクリーンアップ (統合版)
    echo "🐳 Docker環境の徹底クリーンアップ..."
    if command -v docker &> /dev/null; then
        # 停止中コンテナ削除
        docker container prune -f >> "$CLEANUP_LOG" 2>&1 || true
        
        # 未使用イメージ削除
        docker image prune -f >> "$CLEANUP_LOG" 2>&1 || true
        
        # 未使用ボリューム削除
        docker volume prune -f >> "$CLEANUP_LOG" 2>&1 || true
        
        # 未使用ネットワーク削除
        docker network prune -f >> "$CLEANUP_LOG" 2>&1 || true
        
        # uchiプロジェクト特有のリソース削除
        docker images | grep -i uchi | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
        docker volume ls | grep -i uchi | awk '{print $2}' | xargs docker volume rm -f 2>/dev/null || true
        
        echo "✅ Docker環境クリーンアップ完了"
    else
        echo "ℹ️ Docker未インストール"
    fi
    
    # Next.jsプロセス確認・停止
    echo "⚡ Next.js/Node.jsプロセス確認..."
    LOCAL_NEXT_PIDS=$(pgrep -f "next|npm.*dev|node.*dev" 2>/dev/null || true)
    if [ -n "$LOCAL_NEXT_PIDS" ]; then
        echo "⚠️ Next.js関連プロセス停止中..."
        pkill -f "next" 2>/dev/null || true
        pkill -f "npm.*dev" 2>/dev/null || true
        sleep 3
        echo "✅ プロセス停止完了"
    else
        echo "✅ Next.js関連プロセスなし"
    fi
    
    # プロジェクトディレクトリクリーンアップ
    echo "📁 プロジェクトディレクトリクリーンアップ..."
    cd "$PROJECT_ROOT"
    
    # .DS_Store削除
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    # ログファイル削除 (ドキュメント除く)
    find . -name "*.log" -not -path "./docs/*" -delete 2>/dev/null || true
    find . -name "nohup.out" -delete 2>/dev/null || true
    rm -f app.log dev.log startup.log restart.log production.log 2>/dev/null || true
    
    # 一時ファイル削除
    find . -name "temp*" -o -name "tmp*" | while read file; do
        [ -e "$file" ] && rm -rf "$file" 2>/dev/null || true
    done
    
    echo "✅ ローカル環境クリーンアップ完了"
}

cleanup_vps() {
    echo "📍 VPS環境のクリーンアップ開始..." | tee -a "$CLEANUP_LOG"
    
    # SSH接続テスト (新しい設定使用)
    echo "🔑 SSH接続テスト..."
    if ! ssh -o ConnectTimeout=10 "$VPS_HOST" "echo 'SSH接続成功'" &>/dev/null; then
        echo "❌ SSH接続に失敗しました (VPS停止中の可能性)" | tee -a "$CLEANUP_LOG"
        echo "ℹ️ VPSが利用可能になったら手動で実行してください"
        return 1
    fi
    
    # VPS上のNext.jsプロセス確認・停止
    echo "⚡ VPS上のNext.jsプロセス確認..."
    VPS_NEXT_PIDS=$(ssh "$VPS_HOST" "pgrep -f 'next|npm.*start|node.*next' || true")
    if [ -n "$VPS_NEXT_PIDS" ]; then
        echo "⚠️ VPS上のNext.js関連プロセス停止中..."
        ssh "$VPS_HOST" "
            pkill -f 'next' || true
            pkill -f 'npm.*start' || true
            pkill -f 'node.*next' || true
        "
        sleep 3
        echo "✅ VPSプロセス停止完了"
    else
        echo "✅ VPS上にNext.js関連プロセスなし"
    fi
    
    # VPS上のアプリケーションディレクトリクリーンアップ
    echo "🗑️ VPS上のアプリケーションディレクトリクリーンアップ..."
    ssh "$VPS_HOST" "
        cd /var/www/uchi
        
        # ログファイル削除 (監視ログ除く)
        rm -f *.log nohup.out app.log dev.log startup.log restart.log production.log 2>/dev/null || true
        find . -name '*.log' -not -path './docs/*' -not -name 'uchi-health.log' -delete 2>/dev/null || true
        
        # 一時ファイル削除
        find . -name 'temp*' -o -name 'tmp*' | xargs rm -rf 2>/dev/null || true
        
        # .DS_Store削除 (もしあれば)
        find . -name '.DS_Store' -delete 2>/dev/null || true
        
        echo 'VPS上の一時ファイル削除完了'
    " || echo "⚠️ VPS上のクリーンアップで一部エラー (続行)"
    
    # ポート・プロセス状況確認
    echo "🔍 VPS上のポート・プロセス状況確認..."
    ssh "$VPS_HOST" "
        echo '=== ポート3000使用状況 ==='
        ss -tlnp | grep :3000 || echo '✅ ポート3000は空き'
        
        echo '=== Next.js関連プロセス ==='
        ps aux | grep -E 'next|npm.*start|node.*next' | grep -v grep || echo '✅ Next.js関連プロセスなし'
    " | tee -a "$CLEANUP_LOG"
    
    echo "✅ VPS環境クリーンアップ完了"
}

show_status() {
    echo ""
    echo "📊 環境状態サマリー"
    echo "==================="
    
    # ローカル状態
    echo "📍 ローカル環境:"
    LOCAL_NEXT=$(pgrep -f "next" | wc -l || echo "0")
    echo "  - Next.jsプロセス: ${LOCAL_NEXT}個"
    
    if command -v docker &> /dev/null; then
        DOCKER_CONTAINERS=$(docker ps -q | wc -l || echo "0")
        echo "  - Dockerコンテナ: ${DOCKER_CONTAINERS}個"
    fi
    
    # VPS状態 (SSH接続可能な場合のみ)
    echo "📍 VPS環境:"
    if ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$VPS_HOST" "echo 'connected'" &>/dev/null; then
        VPS_NEXT=$(ssh -i "$SSH_KEY" "$VPS_HOST" "pgrep -f 'next' | wc -l || echo '0'")
        VPS_PORT_3000=$(ssh -i "$SSH_KEY" "$VPS_HOST" "ss -tlnp | grep :3000 | wc -l || echo '0'")
        echo "  - Next.jsプロセス: ${VPS_NEXT}個"
        echo "  - ポート3000使用: ${VPS_PORT_3000}個"
    else
        echo "  - SSH接続エラー（スキップ）"
    fi
}

# メイン処理
case "$1" in
    "local")
        cleanup_local
        ;;
    "vps")
        cleanup_vps
        ;;
    "both")
        cleanup_local
        cleanup_vps
        ;;
    "status")
        show_status
        exit 0
        ;;
    *)
        echo "無効なオプション: $1"
        echo "使用方法: $0 [local|vps|both|status]"
        exit 1
        ;;
esac

# 最終状態確認
show_status

echo ""
echo "🎉 クリーンアップ処理完了！"