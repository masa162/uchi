#!/bin/bash
# 強化版作業ログシステム
# 完全なトレーサビリティ・ファイル残渣追跡機能付き

set -e

# 設定
LOG_DIR="docs/代行作業log"
MAIN_CSV="$LOG_DIR/作業履歴.csv"
DETAIL_LOG="$LOG_DIR/detailed_operations.jsonl"
FILE_TRACKING="$LOG_DIR/file_changes_tracking.csv"
CLEANUP_LOG="$LOG_DIR/cleanup_history.csv"
SESSION_STATE=".session-state"
TEMP_TRACKING="/tmp/uchi_file_tracking_$$"

# 色付きメッセージ関数
log_info() { echo -e "\033[36m📊 $1\033[0m"; }
log_success() { echo -e "\033[32m✅ $1\033[0m"; }
log_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
log_error() { echo -e "\033[31m❌ $1\033[0m"; }

# 使用方法
show_usage() {
    echo "🔍 強化版作業ログシステム"
    echo ""
    echo "使用方法:"
    echo "  $0 start <TASK_ID> <DESCRIPTION>     # 作業開始記録"
    echo "  $0 update <TASK_ID> <STATUS> <DESC>  # 作業進捗更新"
    echo "  $0 file-change <ACTION> <FILE_PATH>  # ファイル変更追跡"
    echo "  $0 cleanup <AREA>                    # クリーンアップ実行・記録"
    echo "  $0 finish <TASK_ID> <RESULT>         # 作業完了記録"
    echo "  $0 report <PERIOD>                   # レポート生成"
    echo ""
    echo "例:"
    echo "  $0 start F005 '基本検索機能実装開始'"
    echo "  $0 update F005 in_progress 'API実装中'"
    echo "  $0 file-change create src/components/SearchBox.tsx"
    echo "  $0 cleanup temp_files"
    echo "  $0 finish F005 '検索機能実装完了・テスト成功'"
    echo "  $0 report today"
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

# Git情報取得
get_git_info() {
    local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "$branch:$commit_hash"
}

# 作業開始記録
start_task() {
    local task_id="$1"
    local description="$2"
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    local git_info=$(get_git_info)
    local user="Claude Code"
    
    # 引数チェック
    if [ -z "$task_id" ] || [ -z "$description" ]; then
        log_error "引数不足: task_id と description が必要です"
        show_usage
        exit 1
    fi
    
    # セッション状態記録
    cat > "$SESSION_STATE" <<EOF
{
  "task_id": "$task_id",
  "status": "started",
  "start_time": "$timestamp",
  "description": "$description",
  "environment": "$environment",
  "git_info": "$git_info",
  "worker": "$user"
}
EOF
    
    # CSV記録
    echo "$timestamp,$user,$description - 開始,$task_id,$environment,強化ログシステム,$task_id実装,started,作業開始" >> "$MAIN_CSV"
    
    # 詳細JSON記録
    cat >> "$DETAIL_LOG" <<EOF
{"timestamp":"$timestamp","action":"start_task","task_id":"$task_id","description":"$description","environment":"$environment","git_info":"$git_info","worker":"$user","session_id":"$$"}
EOF
    
    # ファイル追跡開始
    echo "timestamp,action,file_path,task_id,size_bytes,checksum" > "$TEMP_TRACKING"
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.sh" \) \
        -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" \
        | while read file; do
            if [ -f "$file" ]; then
                size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
                checksum=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1 || md5 -q "$file" 2>/dev/null || echo "unknown")
                echo "$timestamp,baseline,\"$file\",$task_id,$size,$checksum" >> "$TEMP_TRACKING"
            fi
        done
    
    log_success "作業開始記録: $task_id - $description"
    log_info "環境: $environment | Git: $git_info"
}

# 作業進捗更新
update_task() {
    local task_id="$1"
    local status="$2"
    local description="$3"
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    local git_info=$(get_git_info)
    local user="Claude Code"
    
    # 引数チェック
    if [ -z "$task_id" ] || [ -z "$status" ] || [ -z "$description" ]; then
        log_error "引数不足: task_id, status, description が必要です"
        show_usage
        exit 1
    fi
    
    # セッション状態更新
    if [ -f "$SESSION_STATE" ]; then
        local start_time=$(grep -o '"start_time":"[^"]*"' "$SESSION_STATE" | cut -d'"' -f4)
        cat > "$SESSION_STATE" <<EOF
{
  "task_id": "$task_id",
  "status": "$status",
  "start_time": "$start_time",
  "last_update": "$timestamp",
  "description": "$description",
  "environment": "$environment",
  "git_info": "$git_info",
  "worker": "$user"
}
EOF
    fi
    
    # CSV記録
    echo "$timestamp,$user,$description,$task_id,$environment,強化ログシステム,$task_id実装,$status,進捗更新" >> "$MAIN_CSV"
    
    # 詳細JSON記録
    cat >> "$DETAIL_LOG" <<EOF
{"timestamp":"$timestamp","action":"update_task","task_id":"$task_id","status":"$status","description":"$description","environment":"$environment","git_info":"$git_info","worker":"$user","session_id":"$$"}
EOF
    
    log_success "進捗更新記録: $task_id - $status"
    log_info "詳細: $description"
}

# ファイル変更追跡
track_file_change() {
    local action="$1"
    local file_path="$2"
    local timestamp=$(get_timestamp)
    local task_id=$(grep -o '"task_id":"[^"]*"' "$SESSION_STATE" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
    
    if [ -z "$action" ] || [ -z "$file_path" ]; then
        log_error "引数不足: action と file_path が必要です"
        show_usage
        exit 1
    fi
    
    # ファイル情報取得
    local size="0"
    local checksum="unknown"
    if [ -f "$file_path" ]; then
        size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path" 2>/dev/null || echo "0")
        checksum=$(md5sum "$file_path" 2>/dev/null | cut -d' ' -f1 || md5 -q "$file_path" 2>/dev/null || echo "unknown")
    fi
    
    # 追跡記録
    echo "$timestamp,$action,\"$file_path\",$task_id,$size,$checksum" >> "$FILE_TRACKING"
    echo "$timestamp,$action,\"$file_path\",$task_id,$size,$checksum" >> "$TEMP_TRACKING"
    
    # 詳細JSON記録
    cat >> "$DETAIL_LOG" <<EOF
{"timestamp":"$timestamp","action":"file_change","file_action":"$action","file_path":"$file_path","task_id":"$task_id","size":$size,"checksum":"$checksum","session_id":"$$"}
EOF
    
    log_info "ファイル変更記録: $action - $file_path"
}

# クリーンアップ実行・記録
perform_cleanup() {
    local area="$1"
    local timestamp=$(get_timestamp)
    local task_id=$(grep -o '"task_id":"[^"]*"' "$SESSION_STATE" 2>/dev/null | cut -d'"' -f4 || echo "cleanup")
    local cleanup_count=0
    
    log_info "クリーンアップ開始: $area"
    
    case "$area" in
        "temp_files")
            # 一時ファイル削除
            find . -name "*.tmp" -o -name "*.temp" -o -name "*.swp" -o -name "*~" | while read file; do
                if [ -f "$file" ]; then
                    rm "$file"
                    echo "$timestamp,delete,\"$file\",$task_id,temp_file_cleanup" >> "$CLEANUP_LOG"
                    cleanup_count=$((cleanup_count + 1))
                    log_info "削除: $file"
                fi
            done
            ;;
        "node_modules")
            # node_modules 再構築
            if [ -d "node_modules" ]; then
                rm -rf node_modules
                echo "$timestamp,delete,\"node_modules\",$task_id,node_modules_cleanup" >> "$CLEANUP_LOG"
                log_info "削除: node_modules"
                npm install
                log_success "npm install完了"
            fi
            ;;
        "build_cache")
            # ビルドキャッシュクリア
            for dir in ".next" "dist" "build" ".cache"; do
                if [ -d "$dir" ]; then
                    rm -rf "$dir"
                    echo "$timestamp,delete,\"$dir\",$task_id,build_cache_cleanup" >> "$CLEANUP_LOG"
                    log_info "削除: $dir"
                fi
            done
            ;;
        "logs")
            # 古いログファイル削除
            find . -name "*.log" -mtime +7 | while read file; do
                if [ -f "$file" ]; then
                    rm "$file"
                    echo "$timestamp,delete,\"$file\",$task_id,old_log_cleanup" >> "$CLEANUP_LOG"
                    log_info "削除: $file"
                fi
            done
            ;;
        *)
            log_warning "未対応のクリーンアップエリア: $area"
            ;;
    esac
    
    log_success "クリーンアップ完了: $area"
}

# 作業完了記録
finish_task() {
    local task_id="$1"
    local result="$2"
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    local git_info=$(get_git_info)
    local user="Claude Code"
    
    if [ -z "$task_id" ] || [ -z "$result" ]; then
        log_error "引数不足: task_id と result が必要です"
        show_usage
        exit 1
    fi
    
    # 作業時間計算
    local start_time=$(grep -o '"start_time":"[^"]*"' "$SESSION_STATE" 2>/dev/null | cut -d'"' -f4 || echo "unknown")
    local duration="unknown"
    if [ "$start_time" != "unknown" ]; then
        local start_epoch=$(date -d "$start_time" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S" "$start_time" +%s 2>/dev/null || echo "0")
        local end_epoch=$(date +%s)
        local diff=$((end_epoch - start_epoch))
        duration="${diff}秒"
    fi
    
    # ファイル変更集計
    local files_changed=0
    local files_created=0
    local files_deleted=0
    if [ -f "$TEMP_TRACKING" ]; then
        files_created=$(grep -c ",create," "$TEMP_TRACKING" 2>/dev/null || echo "0")
        files_changed=$(grep -c ",modify," "$TEMP_TRACKING" 2>/dev/null || echo "0")
        files_deleted=$(grep -c ",delete," "$TEMP_TRACKING" 2>/dev/null || echo "0")
        
        # メインの追跡ファイルに統合
        cat "$TEMP_TRACKING" >> "$FILE_TRACKING"
        rm -f "$TEMP_TRACKING"
    fi
    
    # セッション状態完了
    cat > "$SESSION_STATE" <<EOF
{
  "task_id": "$task_id",
  "status": "completed",
  "start_time": "$start_time",
  "end_time": "$timestamp",
  "duration": "$duration",
  "result": "$result",
  "environment": "$environment",
  "git_info": "$git_info",
  "worker": "$user",
  "files_stats": {
    "created": $files_created,
    "modified": $files_changed,
    "deleted": $files_deleted
  }
}
EOF
    
    # CSV記録
    echo "$timestamp,$user,$result,$task_id,$environment,強化ログシステム,$task_id実装,completed,作業完了(${duration})" >> "$MAIN_CSV"
    
    # 詳細JSON記録
    cat >> "$DETAIL_LOG" <<EOF
{"timestamp":"$timestamp","action":"finish_task","task_id":"$task_id","result":"$result","duration":"$duration","environment":"$environment","git_info":"$git_info","worker":"$user","files_created":$files_created,"files_modified":$files_changed,"files_deleted":$files_deleted,"session_id":"$$"}
EOF
    
    log_success "作業完了記録: $task_id"
    log_info "結果: $result"
    log_info "作業時間: $duration"
    log_info "ファイル変更: 作成$files_created 変更$files_changed 削除$files_deleted"
    
    if [ "$files_created" -gt 0 ] || [ "$files_changed" -gt 0 ]; then
        log_warning "PROJECT_MANAGEMENT.md更新推奨: $task_id を完了に変更"
    fi
}

# レポート生成
generate_report() {
    local period="$1"
    local timestamp=$(get_timestamp)
    
    log_info "レポート生成中: $period"
    
    case "$period" in
        "today")
            local today=$(date '+%Y-%m-%d')
            log_info "今日の作業サマリー ($today):"
            grep "^$today" "$MAIN_CSV" | cut -d',' -f2,3,4,8 | sort -u
            ;;
        "week")
            local week_ago=$(date -d '7 days ago' '+%Y-%m-%d' 2>/dev/null || date -j -v-7d '+%Y-%m-%d' 2>/dev/null)
            log_info "過去1週間の作業サマリー ($week_ago以降):"
            awk -F',' -v date="$week_ago" '$1 >= date {print $2","$3","$4","$8}' "$MAIN_CSV" | sort -u
            ;;
        "files")
            log_info "ファイル変更追跡サマリー:"
            if [ -f "$FILE_TRACKING" ]; then
                awk -F',' '{print $2}' "$FILE_TRACKING" | sort | uniq -c | sort -nr
            else
                log_warning "ファイル追跡データがありません"
            fi
            ;;
        *)
            log_error "未対応のレポート期間: $period"
            echo "対応期間: today, week, files"
            exit 1
            ;;
    esac
}

# メイン処理
main() {
    local action="$1"
    shift
    
    # ディレクトリ確認・作成
    mkdir -p "$LOG_DIR"
    
    # CSV ヘッダー作成
    if [ ! -f "$MAIN_CSV" ]; then
        echo "日時,作業者,作業内容,対象ファイル,環境,方法,目的,ステータス,備考" > "$MAIN_CSV"
    fi
    
    if [ ! -f "$FILE_TRACKING" ]; then
        echo "timestamp,action,file_path,task_id,size_bytes,checksum" > "$FILE_TRACKING"
    fi
    
    if [ ! -f "$CLEANUP_LOG" ]; then
        echo "timestamp,action,target,task_id,cleanup_type" > "$CLEANUP_LOG"
    fi
    
    case "$action" in
        "start")
            start_task "$@"
            ;;
        "update")
            update_task "$@"
            ;;
        "file-change")
            track_file_change "$@"
            ;;
        "cleanup")
            perform_cleanup "$@"
            ;;
        "finish")
            finish_task "$@"
            ;;
        "report")
            generate_report "$@"
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# 実行
main "$@"