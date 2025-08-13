#!/bin/bash

# ⚡ 接続事前チェック・タイムアウト最適化スクリプト
# 作成日: 2025年8月13日
# 目的: フェイルファスト原則でタイムアウト問題を予防

set -e

SCRIPT_NAME="$(basename "$0")"
CHECK_LOG="/tmp/connection-check-$(date +%Y%m%d-%H%M%S).log"

# カラー出力定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log() {
    echo -e "[$(date '+%H:%M:%S')] $1" | tee -a "$CHECK_LOG"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$CHECK_LOG"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$CHECK_LOG"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$CHECK_LOG"
}

info() {
    echo -e "${BLUE}ℹ️ $1${NC}" | tee -a "$CHECK_LOG"
}

# 基本ネットワーク接続確認
check_network() {
    log "🌐 基本ネットワーク接続確認..."
    
    # DNS解決テスト
    if nslookup github.com 8.8.8.8 >/dev/null 2>&1; then
        success "DNS解決: 正常"
    else
        error "DNS解決: 失敗"
        return 1
    fi
    
    # インターネット接続テスト
    if curl -I --max-time 5 https://github.com >/dev/null 2>&1; then
        success "インターネット接続: 正常"
    else
        error "インターネット接続: 失敗"
        return 1
    fi
    
    return 0
}

# SSH接続チェック
check_ssh() {
    local target="$1"
    local timeout="${2:-10}"
    
    log "🔑 SSH接続チェック: $target (タイムアウト: ${timeout}秒)"
    
    # ping疎通確認 (高速)
    local host=$(ssh -G "$target" | grep "^hostname " | awk '{print $2}')
    if ping -c 1 -W 3000 "$host" >/dev/null 2>&1; then
        success "Ping疎通: $host 応答あり"
    else
        warning "Ping疎通: $host 応答なし (ファイアウォールかサーバー停止)"
    fi
    
    # SSH接続テスト
    if ssh -o ConnectTimeout="$timeout" -o BatchMode=yes "$target" "echo 'SSH接続成功'" >/dev/null 2>&1; then
        success "SSH接続: $target 成功 (${timeout}秒以内)"
        return 0
    else
        error "SSH接続: $target 失敗 (${timeout}秒でタイムアウト)"
        return 1
    fi
}

# Git接続チェック
check_git() {
    log "📚 Git接続チェック..."
    
    # GitHub SSH接続テスト
    if ssh -T git@github.com -o ConnectTimeout=10 >/dev/null 2>&1; then
        success "GitHub SSH: 接続正常"
    else
        warning "GitHub SSH: 接続問題 (HTTPSを使用推奨)"
    fi
    
    # GitHub HTTPS接続テスト
    if git ls-remote --heads https://github.com/masa162/uchi.git >/dev/null 2>&1; then
        success "GitHub HTTPS: 接続正常"
    else
        error "GitHub HTTPS: 接続失敗"
        return 1
    fi
    
    return 0
}

# Docker接続チェック
check_docker() {
    log "🐳 Docker接続チェック..."
    
    # Docker Daemon接続テスト
    if timeout 10 docker version >/dev/null 2>&1; then
        success "Docker Daemon: 接続正常"
    else
        error "Docker Daemon: 接続失敗 (起動していない可能性)"
        return 1
    fi
    
    # Docker Hub接続テスト
    if timeout 15 docker search --limit 1 hello-world >/dev/null 2>&1; then
        success "Docker Hub: 接続正常"
    else
        warning "Docker Hub: 接続問題 (低速またはオフライン)"
    fi
    
    return 0
}

# 高速接続診断
quick_check() {
    log "⚡ 高速接続診断開始..."
    
    local failures=0
    
    check_network || ((failures++))
    check_git || ((failures++))
    check_docker || ((failures++))
    
    # VPS接続チェック (オプション)
    if [ "$1" = "--include-vps" ]; then
        check_ssh "conoha-vps" 5 || ((failures++))
    fi
    
    if [ $failures -eq 0 ]; then
        success "すべての接続チェック通過 - 作業継続可能"
        return 0
    else
        error "$failures 個の接続問題を検出 - 修復が必要"
        return 1
    fi
}

# 詳細診断
detailed_check() {
    log "🔍 詳細接続診断開始..."
    
    echo "=== ネットワーク詳細情報 ===" | tee -a "$CHECK_LOG"
    
    # 接続速度測定
    info "GitHub接続速度測定:"
    time curl -I --max-time 10 https://github.com 2>&1 | grep "real\|HTTP" | tee -a "$CHECK_LOG"
    
    # DNS応答時間
    info "DNS応答時間測定:"
    time nslookup github.com 8.8.8.8 2>&1 | grep "real\|Name:" | tee -a "$CHECK_LOG"
    
    # SSH設定確認
    info "SSH設定状況:"
    ssh -G conoha-vps | grep -E "connecttimeout|serveraliveinterval|compression" | tee -a "$CHECK_LOG"
    
    # Git設定確認
    info "Git設定状況:"
    git config --get-regexp "http\.|push\.|fetch\." | tee -a "$CHECK_LOG"
    
    # Docker設定確認
    info "Docker設定状況:"
    env | grep -E "DOCKER.*TIMEOUT|COMPOSE.*TIMEOUT" | tee -a "$CHECK_LOG"
}

# 修復提案
suggest_fixes() {
    log "🔧 問題解決提案..."
    
    cat << 'EOF' | tee -a "$CHECK_LOG"

📋 タイムアウト問題の解決方法:

1. ネットワーク問題:
   - WiFi接続を確認
   - VPN接続を確認
   - ファイアウォール設定を確認

2. SSH接続問題:
   - VPSが起動しているか確認
   - SSH鍵の権限確認: chmod 600 ~/.ssh/id_ed25519_sinvps_macbook
   - SSH設定確認: cat ~/.ssh/config

3. Git接続問題:
   - GitHub Personal Access Token更新
   - Git認証情報確認: git config --list | grep user

4. Docker接続問題:  
   - Docker Desktop起動確認
   - Docker設定確認: docker version

EOF
}

# メイン処理
main() {
    echo "⚡ 接続事前チェック・タイムアウト最適化ツール"
    echo "=============================================="
    
    case "${1:-quick}" in
        "quick"|"q")
            quick_check "$2"
            ;;
        "detailed"|"d")
            detailed_check
            ;;
        "ssh")
            check_ssh "${2:-conoha-vps}" "${3:-10}"
            ;;
        "git")
            check_git
            ;;
        "docker")
            check_docker
            ;;
        "network")
            check_network
            ;;
        "fix"|"help")
            suggest_fixes
            ;;
        *)
            echo "使用方法: $SCRIPT_NAME [quick|detailed|ssh|git|docker|network|fix]"
            echo ""
            echo "オプション:"
            echo "  quick [--include-vps]  高速チェック (デフォルト)"
            echo "  detailed              詳細診断"
            echo "  ssh [host] [timeout]  SSH接続テスト"
            echo "  git                   Git接続テスト"
            echo "  docker                Docker接続テスト"
            echo "  network               基本ネットワークテスト"
            echo "  fix                   問題解決提案"
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    echo ""
    info "詳細ログ: $CHECK_LOG"
    
    if [ $exit_code -eq 0 ]; then
        success "接続チェック完了 - 問題なし"
    else
        error "接続問題を検出 - 修復してから作業を継続してください"
        echo ""
        suggest_fixes
    fi
    
    return $exit_code
}

# 実行
main "$@"