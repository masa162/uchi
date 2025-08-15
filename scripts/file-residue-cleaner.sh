#!/bin/bash
# ファイル残渣自動検出・クリーンアップシステム
# ローカル・本番環境のファイル残渣を検出・削除

set -e

# 設定
SCAN_REPORT="docs/代行作業log/file_residue_scan.json"
CLEANUP_REPORT="docs/代行作業log/cleanup_results.json"
WHITELIST_FILE="scripts/cleanup_whitelist.txt"
DANGEROUS_PATTERNS_FILE="scripts/dangerous_patterns.txt"

# 色付きメッセージ関数
log_info() { echo -e "\033[36m🔍 $1\033[0m"; }
log_success() { echo -e "\033[32m✅ $1\033[0m"; }
log_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
log_error() { echo -e "\033[31m❌ $1\033[0m"; }
log_danger() { echo -e "\033[91m🚨 $1\033[0m"; }

# 使用方法
show_usage() {
    echo "🧹 ファイル残渣自動検出・クリーンアップシステム"
    echo ""
    echo "使用方法:"
    echo "  $0 scan [--deep]           # ファイル残渣スキャン実行"
    echo "  $0 clean [--dry-run]       # 安全なファイル残渣クリーンアップ"
    echo "  $0 deep-clean [--confirm]  # 深度クリーンアップ（要確認）"
    echo "  $0 report                  # スキャン結果レポート表示"
    echo "  $0 whitelist-add <pattern> # ホワイトリストにパターン追加"
    echo "  $0 setup                   # 初期設定・設定ファイル作成"
    echo ""
    echo "オプション:"
    echo "  --deep        詳細スキャン（時間がかかります）"
    echo "  --dry-run     実際の削除は行わずに確認のみ"
    echo "  --confirm     危険な操作の確認"
    echo ""
    echo "例:"
    echo "  $0 scan --deep"
    echo "  $0 clean --dry-run"
    echo "  $0 whitelist-add '*.important'"
}

# 現在時刻取得
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# 環境検出
detect_environment() {
    if [ -f "/var/www/uchi/package.json" ]; then
        echo "VPS"
    elif [ -d "D:/github/uchi" ]; then
        echo "Windows"
    elif [ -d "/Users/nakayamamasayuki/Documents/GitHub/uchi" ]; then
        echo "Mac"
    else
        echo "Unknown"
    fi
}

# 初期設定
setup_configs() {
    local timestamp=$(get_timestamp)
    
    log_info "初期設定を実行中..."
    
    # ディレクトリ作成
    mkdir -p "$(dirname "$SCAN_REPORT")"
    mkdir -p "$(dirname "$WHITELIST_FILE")"
    
    # ホワイトリスト作成
    if [ ! -f "$WHITELIST_FILE" ]; then
        cat > "$WHITELIST_FILE" <<EOF
# ファイル残渣クリーンアップ ホワイトリスト
# 絶対に削除してはいけないファイル・パターン

# 設定ファイル
*.env
*.env.local
*.env.production
.env.*
CLAUDE.md
README.md
package.json
package-lock.json
tsconfig.json
next.config.js
tailwind.config.*
.gitignore
.gitattributes

# 重要なディレクトリ
.git/
.github/
node_modules/
prisma/
src/
docs/
scripts/

# データベース関連
*.sql
*.db
*.sqlite
*.sqlite3
prisma/migrations/

# 証明書・鍵
*.pem
*.key
*.crt
*.cert
*key*
*secret*
*password*

# バックアップファイル（重要）
backup_*
*.backup
*.bak

# ログファイル（重要な情報が含まれる可能性）
*.log

# IDE設定（個人設定保護）
.vscode/
.idea/
*.code-workspace
EOF
        log_success "ホワイトリスト作成: $WHITELIST_FILE"
    fi
    
    # 危険パターンリスト作成
    if [ ! -f "$DANGEROUS_PATTERNS_FILE" ]; then
        cat > "$DANGEROUS_PATTERNS_FILE" <<EOF
# 危険な削除パターン（特別な注意が必要）
# これらのパターンは deep-clean でのみ処理し、必ず確認を求める

# 重要な本番ファイル
/var/www/
/etc/
/opt/
/usr/local/
/home/
/root/

# システムディレクトリ
/bin/
/sbin/
/lib/
/lib64/
/boot/

# データベース
*.sql
*.db
*.sqlite

# 設定ファイル
*.conf
*.config
*.ini
*.yaml
*.yml

# 証明書・セキュリティ
*.pem
*.key
*.crt
*.p12
*.pfx
EOF
        log_success "危険パターンリスト作成: $DANGEROUS_PATTERNS_FILE"
    fi
    
    log_success "初期設定完了"
}

# ホワイトリストチェック
is_whitelisted() {
    local file_path="$1"
    
    if [ ! -f "$WHITELIST_FILE" ]; then
        return 1
    fi
    
    # コメント行と空行を除外してパターンチェック
    grep -v '^#' "$WHITELIST_FILE" | grep -v '^$' | while read pattern; do
        if [[ "$file_path" == $pattern ]] || [[ "$file_path" =~ $pattern ]]; then
            return 0
        fi
    done
    
    return 1
}

# 危険パターンチェック
is_dangerous() {
    local file_path="$1"
    
    if [ ! -f "$DANGEROUS_PATTERNS_FILE" ]; then
        return 1
    fi
    
    grep -v '^#' "$DANGEROUS_PATTERNS_FILE" | grep -v '^$' | while read pattern; do
        if [[ "$file_path" == $pattern ]] || [[ "$file_path" =~ $pattern ]]; then
            return 0
        fi
    done
    
    return 1
}

# ファイル残渣スキャン
scan_residues() {
    local deep_scan="$1"
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    local scan_results=()
    
    log_info "ファイル残渣スキャン開始..."
    
    # スキャン結果初期化
    cat > "$SCAN_REPORT" <<EOF
{
  "scan_timestamp": "$timestamp",
  "environment": "$environment",
  "scan_type": "${deep_scan:+deep}${deep_scan:-normal}",
  "results": {
    "temp_files": [],
    "cache_files": [],
    "backup_files": [],
    "log_files": [],
    "build_artifacts": [],
    "ide_files": [],
    "suspicious_files": []
  },
  "stats": {
    "total_scanned": 0,
    "total_residues": 0,
    "safe_to_delete": 0,
    "requires_review": 0
  }
}
EOF
    
    local total_scanned=0
    local total_residues=0
    local safe_to_delete=0
    local requires_review=0
    
    # 一時ファイルスキャン
    log_info "一時ファイルをスキャン中..."
    find . -type f \( -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.swp" -o -name ".DS_Store" \) \
        -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            total_scanned=$((total_scanned + 1))
            if ! is_whitelisted "$file"; then
                total_residues=$((total_residues + 1))
                safe_to_delete=$((safe_to_delete + 1))
                echo "  一時ファイル: $file"
            fi
        fi
    done
    
    # キャッシュファイルスキャン
    log_info "キャッシュファイルをスキャン中..."
    find . -type d \( -name ".cache" -o -name "cache" -o -name ".next" -o -name "dist" -o -name "build" \) \
        -not -path "./node_modules/*" 2>/dev/null | while read dir; do
        if [ -d "$dir" ]; then
            total_scanned=$((total_scanned + 1))
            if ! is_whitelisted "$dir"; then
                total_residues=$((total_residues + 1))
                safe_to_delete=$((safe_to_delete + 1))
                echo "  キャッシュディレクトリ: $dir"
            fi
        fi
    done
    
    # バックアップファイルスキャン
    log_info "バックアップファイルをスキャン中..."
    find . -type f \( -name "*.bak" -o -name "*.backup" -o -name "*_backup*" -o -name "backup_*" \) \
        -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            total_scanned=$((total_scanned + 1))
            total_residues=$((total_residues + 1))
            if is_dangerous "$file"; then
                requires_review=$((requires_review + 1))
                log_warning "  要確認バックアップファイル: $file"
            else
                safe_to_delete=$((safe_to_delete + 1))
                echo "  バックアップファイル: $file"
            fi
        fi
    done
    
    # 古いログファイルスキャン
    log_info "古いログファイルをスキャン中..."
    find . -type f -name "*.log" -mtime +7 \
        -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | while read file; do
        if [ -f "$file" ]; then
            total_scanned=$((total_scanned + 1))
            if ! is_whitelisted "$file"; then
                total_residues=$((total_residues + 1))
                safe_to_delete=$((safe_to_delete + 1))
                echo "  古いログファイル: $file"
            fi
        fi
    done
    
    if [ "$deep_scan" = "true" ]; then
        # IDE設定ファイルスキャン
        log_info "IDE設定ファイルをスキャン中..."
        find . -type f \( -name "*.code-workspace" -o -name ".project" \) \
            -not -path "./node_modules/*" 2>/dev/null | while read file; do
            if [ -f "$file" ]; then
                total_scanned=$((total_scanned + 1))
                total_residues=$((total_residues + 1))
                requires_review=$((requires_review + 1))
                log_warning "  要確認IDE設定: $file"
            fi
        done
        
        # 不審なファイルスキャン
        log_info "不審なファイルをスキャン中..."
        find . -type f \( -name "*.exe" -o -name "*.bat" -o -name "*.cmd" -o -name "*.com" \) \
            -not -path "./node_modules/*" 2>/dev/null | while read file; do
            if [ -f "$file" ]; then
                total_scanned=$((total_scanned + 1))
                total_residues=$((total_residues + 1))
                requires_review=$((requires_review + 1))
                log_danger "  不審な実行ファイル: $file"
            fi
        done
    fi
    
    # 統計更新
    local stats_json="{\"total_scanned\":$total_scanned,\"total_residues\":$total_residues,\"safe_to_delete\":$safe_to_delete,\"requires_review\":$requires_review}"
    
    log_success "スキャン完了"
    log_info "スキャンしたファイル数: $total_scanned"
    log_info "発見された残渣: $total_residues"
    log_info "安全に削除可能: $safe_to_delete"
    
    if [ $requires_review -gt 0 ]; then
        log_warning "要確認ファイル: $requires_review"
    fi
}

# 安全なクリーンアップ
safe_cleanup() {
    local dry_run="$1"
    local timestamp=$(get_timestamp)
    local deleted_count=0
    local skipped_count=0
    
    if [ "$dry_run" = "true" ]; then
        log_info "ドライラン: 実際の削除は行いません"
    else
        log_info "安全なクリーンアップを開始..."
    fi
    
    # 一時ファイル削除
    find . -type f \( -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name "*.swp" -o -name ".DS_Store" \) \
        -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | while read file; do
        if [ -f "$file" ] && ! is_whitelisted "$file"; then
            if [ "$dry_run" = "true" ]; then
                log_info "削除予定: $file"
            else
                rm -f "$file"
                log_success "削除: $file"
            fi
            deleted_count=$((deleted_count + 1))
        else
            skipped_count=$((skipped_count + 1))
        fi
    done
    
    # 空のキャッシュディレクトリ削除
    find . -type d \( -name ".cache" -o -name "cache" \) -empty \
        -not -path "./node_modules/*" 2>/dev/null | while read dir; do
        if [ -d "$dir" ] && ! is_whitelisted "$dir"; then
            if [ "$dry_run" = "true" ]; then
                log_info "削除予定ディレクトリ: $dir"
            else
                rmdir "$dir"
                log_success "ディレクトリ削除: $dir"
            fi
            deleted_count=$((deleted_count + 1))
        fi
    done
    
    # 古いログファイル削除（7日以上前）
    find . -type f -name "*.log" -mtime +7 \
        -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | while read file; do
        if [ -f "$file" ] && ! is_whitelisted "$file"; then
            if [ "$dry_run" = "true" ]; then
                log_info "削除予定ログ: $file"
            else
                rm -f "$file"
                log_success "古いログ削除: $file"
            fi
            deleted_count=$((deleted_count + 1))
        fi
    done
    
    # 結果記録
    cat > "$CLEANUP_REPORT" <<EOF
{
  "cleanup_timestamp": "$timestamp",
  "cleanup_type": "safe",
  "dry_run": $( [ "$dry_run" = "true" ] && echo "true" || echo "false" ),
  "stats": {
    "deleted_count": $deleted_count,
    "skipped_count": $skipped_count
  }
}
EOF
    
    if [ "$dry_run" = "true" ]; then
        log_success "ドライラン完了: $deleted_count 個のファイルが削除対象"
    else
        log_success "クリーンアップ完了: $deleted_count 個のファイルを削除"
    fi
    
    log_info "スキップ: $skipped_count 個のファイル（ホワイトリスト）"
}

# 深度クリーンアップ（要確認）
deep_cleanup() {
    local confirm="$1"
    
    if [ "$confirm" != "true" ]; then
        log_danger "深度クリーンアップは危険な操作を含みます"
        log_warning "実行前に必ずバックアップを取り、--confirm オプションを使用してください"
        log_info "例: $0 deep-clean --confirm"
        return 1
    fi
    
    log_danger "深度クリーンアップを開始します"
    log_warning "バックアップが取られていることを確認してください"
    
    echo -n "続行しますか？ (yes/NO): "
    read response
    
    if [ "$response" != "yes" ]; then
        log_info "キャンセルされました"
        return 0
    fi
    
    # node_modules 再構築
    if [ -d "node_modules" ]; then
        log_warning "node_modules を削除・再構築中..."
        rm -rf node_modules
        npm install
        log_success "node_modules 再構築完了"
    fi
    
    # ビルドキャッシュクリア
    for dir in ".next" "dist" "build" ".cache"; do
        if [ -d "$dir" ]; then
            log_warning "削除: $dir"
            rm -rf "$dir"
        fi
    done
    
    log_success "深度クリーンアップ完了"
}

# スキャンレポート表示
show_report() {
    if [ ! -f "$SCAN_REPORT" ]; then
        log_error "スキャンレポートが見つかりません"
        log_info "先に 'scan' を実行してください"
        return 1
    fi
    
    log_info "最新のスキャンレポート:"
    
    # JSONパース（jqがある場合）
    if command -v jq > /dev/null 2>&1; then
        jq -r '.scan_timestamp + " (" + .scan_type + " scan on " + .environment + ")"' "$SCAN_REPORT"
        echo ""
        jq -r '.stats | "スキャン対象: \(.total_scanned) ファイル", "発見残渣: \(.total_residues) ファイル", "安全削除: \(.safe_to_delete) ファイル", "要確認: \(.requires_review) ファイル"' "$SCAN_REPORT"
    else
        # jqがない場合の簡易表示
        cat "$SCAN_REPORT"
    fi
}

# ホワイトリスト追加
add_to_whitelist() {
    local pattern="$1"
    
    if [ -z "$pattern" ]; then
        log_error "パターンが指定されていません"
        return 1
    fi
    
    echo "$pattern" >> "$WHITELIST_FILE"
    log_success "ホワイトリストに追加: $pattern"
}

# メイン処理
main() {
    local action="$1"
    shift
    
    case "$action" in
        "scan")
            local deep=false
            for arg in "$@"; do
                case "$arg" in
                    "--deep") deep=true ;;
                esac
            done
            scan_residues "$deep"
            ;;
        "clean")
            local dry_run=false
            for arg in "$@"; do
                case "$arg" in
                    "--dry-run") dry_run=true ;;
                esac
            done
            safe_cleanup "$dry_run"
            ;;
        "deep-clean")
            local confirm=false
            for arg in "$@"; do
                case "$arg" in
                    "--confirm") confirm=true ;;
                esac
            done
            deep_cleanup "$confirm"
            ;;
        "report")
            show_report
            ;;
        "whitelist-add")
            add_to_whitelist "$1"
            ;;
        "setup")
            setup_configs
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# 実行
main "$@"