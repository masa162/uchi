#!/bin/bash
# セッション復旧スクリプト
# Windows環境でのターミナル切断・再起動対応

echo "🔄 セッション復旧システム - Windows環境対応"
echo "================================================"

# セッション状態確認
if [ -f ".session-state" ]; then
    echo "📋 前回のセッション状態:"
    echo "------------------------"
    cat .session-state
    echo ""
    
    echo "💾 最新の作業履歴（直近5件）:"
    echo "----------------------------"
    tail -5 docs/代行作業log/作業履歴.csv | while IFS=',' read -r datetime author content target env method purpose status note; do
        echo "🕐 $datetime"
        echo "👤 $author"
        echo "📝 $content"
        echo "🎯 $target"
        echo "📊 $status"
        echo "---"
    done
    
    echo "🔍 PROJECT_MANAGEMENT.md確認推奨項目:"
    echo "-------------------------------------"
    echo "1. 最新の進行中タスクを確認"
    echo "2. 前回セッションの続行または新規作業開始判断"
    echo "3. VPS上のアプリケーション状態確認"
    
    echo ""
    echo "🛠️ 推奨復旧手順:"
    echo "----------------"
    echo "1. CLAUDE.mdの開発憲法・原則を確認"
    echo "2. npm run dev でローカル環境起動"
    echo "3. SSH接続テスト: ssh -i \"docs/関連資料/conohaVPS/key-2025-08-03-13-24.pem\" root@160.251.136.92 \"echo 'VPS接続確認'\""
    echo "4. 前回作業の続行または新規作業開始"
    
else
    echo "❌ セッション情報が見つかりません"
    echo "🔄 新規セッション開始..."
    echo "$(date '+%Y-%m-%d %H:%M'): 新規セッション開始 - Windows環境" > .session-state
fi

echo ""
echo "📚 参考資料:"
echo "- CLAUDE.md: プロジェクト情報・開発規約"
echo "- PROJECT_MANAGEMENT.md: 進捗管理・優先度"
echo "- docs/WORKFLOW_IMPROVEMENT.md: 改善されたワークフロー"
echo ""
echo "✅ セッション復旧準備完了"