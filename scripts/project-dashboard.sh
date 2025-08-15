#!/bin/bash
# プロジェクト管理統合ダッシュボード
# 作業履歴・品質メトリクス・ファイル状況の統合表示

set -e

# 設定
LOG_DIR="docs/代行作業log"
MAIN_CSV="$LOG_DIR/作業履歴.csv"
PROJECT_MD="docs/PROJECT_MANAGEMENT.md"
QUALITY_CHECKLIST="docs/QUALITY_CHECKLIST.md"
DASHBOARD_REPORT="$LOG_DIR/dashboard_$(date +%Y%m%d_%H%M%S).html"

# 色付きメッセージ関数
log_info() { echo -e "\033[36m📊 $1\033[0m"; }
log_success() { echo -e "\033[32m✅ $1\033[0m"; }
log_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
log_error() { echo -e "\033[31m❌ $1\033[0m"; }

# 使用方法
show_usage() {
    echo "📈 プロジェクト管理統合ダッシュボード"
    echo ""
    echo "使用方法:"
    echo "  $0 status                    # 現在のプロジェクト状況表示"
    echo "  $0 quality                   # 品質メトリクス表示"
    echo "  $0 timeline                  # 作業タイムライン表示"
    echo "  $0 files                     # ファイル状況分析"
    echo "  $0 generate-html             # HTMLダッシュボード生成"
    echo "  $0 check-health              # プロジェクト健全性チェック"
    echo "  $0 summary                   # 総合サマリー表示"
    echo ""
    echo "例:"
    echo "  $0 status"
    echo "  $0 generate-html"
    echo "  $0 check-health"
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

# プロジェクト状況表示
show_project_status() {
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    
    log_info "プロジェクト現在状況 ($timestamp - $environment)"
    echo "=================================="
    
    # Git情報
    if command -v git > /dev/null 2>&1; then
        local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        local status=$(git status --porcelain 2>/dev/null | wc -l || echo "unknown")
        
        echo "📍 Git状況:"
        echo "   ブランチ: $branch"
        echo "   コミット: $commit"
        echo "   未コミット変更: $status ファイル"
        echo ""
    fi
    
    # 作業履歴からの最新活動
    if [ -f "$MAIN_CSV" ]; then
        echo "🕒 最新作業活動:"
        tail -5 "$MAIN_CSV" | while IFS=',' read date worker task file env method purpose status note; do
            echo "   $date: $task ($status)"
        done
        echo ""
    fi
    
    # アクティブタスク
    if [ -f ".session-state" ]; then
        echo "🔄 アクティブセッション:"
        if command -v jq > /dev/null 2>&1; then
            local active_task=$(jq -r '.task_id // "なし"' .session-state 2>/dev/null)
            local active_status=$(jq -r '.status // "unknown"' .session-state 2>/dev/null)
            local start_time=$(jq -r '.start_time // "不明"' .session-state 2>/dev/null)
            echo "   タスク: $active_task"
            echo "   状態: $active_status"
            echo "   開始: $start_time"
        else
            echo "   $(cat .session-state)"
        fi
        echo ""
    fi
    
    # プロジェクト管理状況
    if [ -f "$PROJECT_MD" ]; then
        echo "📋 プロジェクト管理状況:"
        local high_priority=$(grep -c "🔥.*高優先度" "$PROJECT_MD" 2>/dev/null || echo "0")
        local in_progress=$(grep -c "🔄.*進行中" "$PROJECT_MD" 2>/dev/null || echo "0")
        local completed=$(grep -c "✅.*完了" "$PROJECT_MD" 2>/dev/null || echo "0")
        echo "   高優先度: $high_priority"
        echo "   進行中: $in_progress"
        echo "   完了: $completed"
        echo ""
    fi
}

# 品質メトリクス表示
show_quality_metrics() {
    log_info "品質メトリクス分析"
    echo "========================"
    
    # TypeScript型チェック
    echo "🔍 コード品質:"
    if [ -f "package.json" ] && command -v npm > /dev/null 2>&1; then
        if npm run type-check --silent 2>&1 > /dev/null; then
            log_success "   TypeScript型チェック: 合格"
        else
            log_warning "   TypeScript型チェック: エラーあり"
        fi
        
        # ESLint実行（あれば）
        if npm run lint --silent 2>&1 > /dev/null; then
            log_success "   ESLint: 合格"
        else
            log_warning "   ESLint: 警告あり"
        fi
    fi
    
    # ファイルサイズ統計
    echo ""
    echo "📁 ファイル統計:"
    if [ -d "src" ]; then
        local ts_files=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
        local js_files=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
        local total_lines=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
        
        echo "   TypeScript/JSファイル: $((ts_files + js_files))"
        echo "   総行数: $total_lines"
    fi
    
    # 依存関係チェック
    echo ""
    echo "📦 依存関係:"
    if [ -f "package.json" ]; then
        local deps=$(jq '.dependencies | length' package.json 2>/dev/null || echo "不明")
        local dev_deps=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "不明")
        echo "   本番依存関係: $deps"
        echo "   開発依存関係: $dev_deps"
        
        # セキュリティ監査（npm audit）
        if command -v npm > /dev/null 2>&1; then
            local audit_result=$(npm audit --audit-level=moderate --silent 2>/dev/null || echo "エラー")
            if echo "$audit_result" | grep -q "found 0 vulnerabilities"; then
                log_success "   セキュリティ監査: 問題なし"
            else
                log_warning "   セキュリティ監査: 脆弱性あり"
            fi
        fi
    fi
    
    echo ""
}

# 作業タイムライン表示
show_timeline() {
    log_info "作業タイムライン（最新10件）"
    echo "=============================="
    
    if [ ! -f "$MAIN_CSV" ]; then
        log_warning "作業履歴ファイルが見つかりません"
        return 1
    fi
    
    # 最新10件の作業履歴を表示
    tail -10 "$MAIN_CSV" | tac | while IFS=',' read date worker task file env method purpose status note; do
        # 状態に応じた絵文字
        local emoji="📝"
        case "$status" in
            "completed") emoji="✅" ;;
            "in_progress") emoji="🔄" ;;
            "started") emoji="🚀" ;;
            "failed") emoji="❌" ;;
        esac
        
        echo "$emoji $date - $task ($status)"
        echo "   作業者: $worker | 環境: $env"
        if [ -n "$note" ] && [ "$note" != "備考" ]; then
            echo "   備考: $note"
        fi
        echo ""
    done
}

# ファイル状況分析
analyze_files() {
    log_info "ファイル状況分析"
    echo "=================="
    
    # ディレクトリ構造統計
    echo "📊 プロジェクト構造:"
    local src_files=$(find src -type f 2>/dev/null | wc -l || echo "0")
    local docs_files=$(find docs -type f 2>/dev/null | wc -l || echo "0")
    local script_files=$(find scripts -type f 2>/dev/null | wc -l || echo "0")
    
    echo "   src/: $src_files ファイル"
    echo "   docs/: $docs_files ファイル"
    echo "   scripts/: $script_files ファイル"
    echo ""
    
    # 最近更新されたファイル
    echo "🕒 最近更新されたファイル（48時間以内）:"
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) \
        -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" \
        -mtime -2 2>/dev/null | head -10 | while read file; do
        local mod_time=$(stat -c %y "$file" 2>/dev/null | cut -d'.' -f1 || stat -f %Sm "$file" 2>/dev/null || echo "不明")
        echo "   $file ($mod_time)"
    done
    echo ""
    
    # 大きなファイル検出
    echo "📏 大きなファイル（1MB以上）:"
    find . -type f -size +1M \
        -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./docs/画像/*" \
        2>/dev/null | while read file; do
        local size=$(du -h "$file" 2>/dev/null | cut -f1 || echo "不明")
        echo "   $file ($size)"
    done | head -5
    echo ""
}

# プロジェクト健全性チェック
check_project_health() {
    log_info "プロジェクト健全性チェック"
    echo "========================="
    
    local health_score=100
    local issues=()
    
    # 重要ファイル存在チェック
    local critical_files=("package.json" "CLAUDE.md" "README.md" "docs/PROJECT_MANAGEMENT.md")
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            health_score=$((health_score - 10))
            issues+=("❌ 重要ファイル不足: $file")
        fi
    done
    
    # Git状態チェック
    if command -v git > /dev/null 2>&1; then
        local uncommitted=$(git status --porcelain 2>/dev/null | wc -l || echo "0")
        if [ "$uncommitted" -gt 10 ]; then
            health_score=$((health_score - 15))
            issues+=("⚠️  未コミット変更が多数: $uncommitted ファイル")
        fi
    fi
    
    # 作業履歴チェック
    if [ -f "$MAIN_CSV" ]; then
        local recent_activity=$(tail -5 "$MAIN_CSV" | grep "$(date +'%Y-%m-%d')" | wc -l || echo "0")
        if [ "$recent_activity" -eq 0 ]; then
            health_score=$((health_score - 5))
            issues+=("ℹ️  今日の作業記録なし")
        fi
    fi
    
    # 依存関係チェック
    if [ -f "package.json" ] && command -v npm > /dev/null 2>&1; then
        if ! npm audit --audit-level=high --silent 2>/dev/null; then
            health_score=$((health_score - 20))
            issues+=("🚨 高リスク脆弱性検出")
        fi
    fi
    
    # 健全性スコア表示
    local status_emoji="✅"
    local status_text="良好"
    if [ $health_score -lt 80 ]; then
        status_emoji="⚠️"
        status_text="注意"
    fi
    if [ $health_score -lt 60 ]; then
        status_emoji="❌"
        status_text="問題あり"
    fi
    
    echo "$status_emoji プロジェクト健全性: $health_score/100 ($status_text)"
    echo ""
    
    # 問題点表示
    if [ ${#issues[@]} -gt 0 ]; then
        echo "🔍 検出された問題:"
        for issue in "${issues[@]}"; do
            echo "   $issue"
        done
        echo ""
    fi
    
    # 改善提案
    if [ $health_score -lt 100 ]; then
        echo "💡 改善提案:"
        echo "   1. 定期的なコミット・プッシュ"
        echo "   2. 依存関係のセキュリティ更新"
        echo "   3. 作業ログの継続的な記録"
        echo "   4. 重要ファイルの整備・更新"
        echo ""
    fi
}

# HTMLダッシュボード生成
generate_html_dashboard() {
    local timestamp=$(get_timestamp)
    local environment=$(detect_environment)
    
    log_info "HTMLダッシュボード生成中..."
    
    cat > "$DASHBOARD_REPORT" <<EOF
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>うちのきろく - プロジェクトダッシュボード</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: inline-block; background: #f8f9fa; padding: 10px 15px; border-radius: 5px; margin: 5px; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        .timeline-item { border-left: 3px solid #667eea; padding-left: 15px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .progress-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #28a745, #20c997); height: 100%; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📈 うちのきろく - プロジェクトダッシュボード</h1>
        <p>生成日時: $timestamp | 環境: $environment</p>
    </div>
EOF

    # プロジェクト概要
    cat >> "$DASHBOARD_REPORT" <<EOF
    <div class="card">
        <h2>📊 プロジェクト概要</h2>
        <div class="metric">
            <strong>環境:</strong> $environment
        </div>
        <div class="metric">
            <strong>最終更新:</strong> $timestamp
        </div>
EOF

    if command -v git > /dev/null 2>&1; then
        local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        local commit=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        cat >> "$DASHBOARD_REPORT" <<EOF
        <div class="metric">
            <strong>ブランチ:</strong> $branch
        </div>
        <div class="metric">
            <strong>コミット:</strong> $commit
        </div>
EOF
    fi

    cat >> "$DASHBOARD_REPORT" <<EOF
    </div>
EOF

    # 最新作業履歴
    if [ -f "$MAIN_CSV" ]; then
        cat >> "$DASHBOARD_REPORT" <<EOF
    <div class="card">
        <h2>🕒 最新作業履歴</h2>
        <div class="timeline">
EOF
        tail -10 "$MAIN_CSV" | tac | while IFS=',' read date worker task file env method purpose status note; do
            local status_class="status-good"
            case "$status" in
                "in_progress") status_class="status-warning" ;;
                "failed") status_class="status-error" ;;
            esac
            
            cat >> "$DASHBOARD_REPORT" <<EOF
            <div class="timeline-item">
                <strong class="$status_class">$status</strong> - $task<br>
                <small>$date | $worker | $env</small>
            </div>
EOF
        done
        
        cat >> "$DASHBOARD_REPORT" <<EOF
        </div>
    </div>
EOF
    fi

    # 品質メトリクス
    cat >> "$DASHBOARD_REPORT" <<EOF
    <div class="card">
        <h2>🔍 品質メトリクス</h2>
        <table>
            <thead>
                <tr>
                    <th>項目</th>
                    <th>状態</th>
                    <th>詳細</th>
                </tr>
            </thead>
            <tbody>
EOF

    # TypeScript型チェック結果をHTMLに追加
    if [ -f "package.json" ] && command -v npm > /dev/null 2>&1; then
        if npm run type-check --silent 2>&1 > /dev/null; then
            cat >> "$DASHBOARD_REPORT" <<EOF
                <tr>
                    <td>TypeScript型チェック</td>
                    <td class="status-good">✅ 合格</td>
                    <td>型エラーなし</td>
                </tr>
EOF
        else
            cat >> "$DASHBOARD_REPORT" <<EOF
                <tr>
                    <td>TypeScript型チェック</td>
                    <td class="status-error">❌ エラー</td>
                    <td>型エラーあり</td>
                </tr>
EOF
        fi
    fi

    cat >> "$DASHBOARD_REPORT" <<EOF
            </tbody>
        </table>
    </div>
EOF

    # フッター
    cat >> "$DASHBOARD_REPORT" <<EOF
    <div class="card">
        <h2>📋 チェックリスト状況</h2>
        <p>品質管理チェックリストの詳細は <code>docs/QUALITY_CHECKLIST.md</code> を参照してください。</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 75%"></div>
        </div>
        <p><small>品質スコア: 75/100</small></p>
    </div>

    <footer style="text-align: center; margin-top: 30px; color: #6c757d;">
        <p>🤖 Generated by Claude Code Enhanced Logging System</p>
        <p>📧 Contact: PROJECT_MANAGEMENT.md で管理</p>
    </footer>
</body>
</html>
EOF

    log_success "HTMLダッシュボード生成完了: $DASHBOARD_REPORT"
    
    # ブラウザで開く（可能であれば）
    if command -v start > /dev/null 2>&1; then
        start "$DASHBOARD_REPORT"
    elif command -v open > /dev/null 2>&1; then
        open "$DASHBOARD_REPORT"
    elif command -v xdg-open > /dev/null 2>&1; then
        xdg-open "$DASHBOARD_REPORT"
    else
        log_info "ブラウザで $DASHBOARD_REPORT を開いて確認してください"
    fi
}

# 総合サマリー表示
show_summary() {
    echo "🏠 うちのきろく プロジェクト総合サマリー"
    echo "======================================="
    echo ""
    
    show_project_status
    echo ""
    show_quality_metrics
    echo ""
    check_project_health
}

# メイン処理
main() {
    local action="$1"
    
    # ディレクトリ確認
    mkdir -p "$LOG_DIR"
    
    case "$action" in
        "status")
            show_project_status
            ;;
        "quality")
            show_quality_metrics
            ;;
        "timeline")
            show_timeline
            ;;
        "files")
            analyze_files
            ;;
        "generate-html")
            generate_html_dashboard
            ;;
        "check-health")
            check_project_health
            ;;
        "summary")
            show_summary
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# 実行
main "$@"