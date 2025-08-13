#!/bin/bash

# 環境クリーンアップスクリプト
# 使用方法: ./scripts/cleanup-environment.sh [local|vps]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SSH_KEY="/Users/nakayamamasayuki/Documents/GitHub/uchi/docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem"
VPS_HOST="root@160.251.136.92"

echo "🧹 環境クリーンアップスクリプト"
echo "==============================="

# 引数チェック
if [ $# -eq 0 ]; then
    echo "使用方法: $0 [local|vps|both]"
    exit 1
fi

cleanup_local() {
    echo "📍 ローカル環境のクリーンアップ開始..."
    
    # ローカルDocker確認・停止
    echo "🐳 Dockerコンテナの確認..."
    if command -v docker &> /dev/null; then
        RUNNING_CONTAINERS=$(docker ps -q)
        if [ -n "$RUNNING_CONTAINERS" ]; then
            echo "⚠️  実行中のDockerコンテナを停止中..."
            docker stop $RUNNING_CONTAINERS
        else
            echo "✅ 実行中のDockerコンテナなし"
        fi
    fi
    
    # ローカルNext.jsプロセス確認・停止
    echo "⚡ Next.jsプロセスの確認..."
    LOCAL_NEXT_PIDS=$(pgrep -f "next" || true)
    if [ -n "$LOCAL_NEXT_PIDS" ]; then
        echo "⚠️  ローカルNext.jsプロセスを停止中..."
        pkill -f "next" || true
        sleep 2
    else
        echo "✅ ローカルNext.jsプロセスなし"
    fi
    
    # 一時ファイル削除
    echo "🗑️  一時ファイルの削除..."
    cd "$PROJECT_ROOT"
    find . -name "*.log" -not -path "./docs/*" -delete 2>/dev/null || true
    find . -name "nohup.out" -delete 2>/dev/null || true
    rm -f app.log dev.log startup.log 2>/dev/null || true
    
    echo "✅ ローカル環境クリーンアップ完了"
}

cleanup_vps() {
    echo "📍 VPS環境のクリーンアップ開始..."
    
    # SSH接続テスト
    echo "🔑 SSH接続テスト..."
    if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$VPS_HOST" "echo 'SSH接続成功'" &>/dev/null; then
        echo "❌ SSH接続に失敗しました"
        return 1
    fi
    
    # VPS上のNext.jsプロセス確認・停止
    echo "⚡ VPS上のNext.jsプロセス確認..."
    VPS_NEXT_PIDS=$(ssh -i "$SSH_KEY" "$VPS_HOST" "pgrep -f 'next' || true")
    if [ -n "$VPS_NEXT_PIDS" ]; then
        echo "⚠️  VPS上のNext.jsプロセスを停止中..."
        ssh -i "$SSH_KEY" "$VPS_HOST" "pkill -f 'next' || true"
        sleep 3
    else
        echo "✅ VPS上にNext.jsプロセスなし"
    fi
    
    # VPS上の一時ファイル削除
    echo "🗑️  VPS上の一時ファイル削除..."
    ssh -i "$SSH_KEY" "$VPS_HOST" "
        cd /var/www/uchi
        rm -f *.log nohup.out 2>/dev/null || true
        find . -name '*.log' -not -path './docs/*' -delete 2>/dev/null || true
    "
    
    # ポート使用状況確認
    echo "🔍 ポート使用状況確認..."
    PORT_3000=$(ssh -i "$SSH_KEY" "$VPS_HOST" "ss -tlnp | grep :3000 || true")
    if [ -n "$PORT_3000" ]; then
        echo "⚠️  ポート3000が使用中:"
        echo "$PORT_3000"
    else
        echo "✅ ポート3000は利用可能"
    fi
    
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