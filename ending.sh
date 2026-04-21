#!/bin/bash
# ============================================================
# ending.sh — 營運自動化：結束腳本
# 功能：全面驗證、撰寫交接資訊、推送至遠端
# ============================================================

set -e

echo "=========================================="
echo "  智慧停車位預測系統 (DD-LSTM)"
echo "  Ending Script"
echo "=========================================="
echo ""

# 1. 全面驗證
echo "[1/4] 執行 OpenSpec 驗證..."
LATEST_CHANGE=$(ls -td openspec/changes/*/ 2>/dev/null | head -1 | xargs -I {} basename {})
if [ -n "$LATEST_CHANGE" ]; then
    echo "驗證變更: $LATEST_CHANGE"
    openspec validate "$LATEST_CHANGE" 2>/dev/null || echo "⚠️  驗證有警告，請檢查"
    echo ""
    openspec status --change "$LATEST_CHANGE" 2>/dev/null || true
else
    echo "⚠️  未找到任何變更"
fi
echo ""

# 2. 驗證 tasks.md 合規性
echo "[2/4] 檢查 tasks.md 合規性..."
if [ -n "$LATEST_CHANGE" ]; then
    TASKS_FILE="openspec/changes/$LATEST_CHANGE/tasks.md"
    if [ -f "$TASKS_FILE" ]; then
        TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null || echo "0")
        DONE=$(grep -c '^\- \[x\]' "$TASKS_FILE" 2>/dev/null || echo "0")
        TODO=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || echo "0")
        echo "Tasks 狀態: $DONE/$TOTAL 完成, $TODO 待完成"
    else
        echo "⚠️  tasks.md 不存在"
    fi
fi
echo ""

# 3. 撰寫交接資訊
echo "[3/4] 撰寫交接紀錄..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
cat > HANDOVER.md << EOF
# 交接紀錄

**最後更新**: $TIMESTAMP
**最新變更**: $LATEST_CHANGE

## 目前狀態
- OpenSpec Change: \`$LATEST_CHANGE\`
- Tasks 進度: $DONE/$TOTAL 完成

## 待處理事項
$(grep '^\- \[ \]' "openspec/changes/$LATEST_CHANGE/tasks.md" 2>/dev/null | head -10 || echo "- 無待處理任務")

## 備註
- 使用 \`startup.sh\` 開始新的工作階段
- 使用 \`/opsx:apply\` 繼續實作任務
- 下一輪變更請使用 \`change-02-*\` 命名
EOF
echo "✅ 交接紀錄已寫入 HANDOVER.md"
echo ""

# 4. 推送至遠端
echo "[4/4] 推送至 GitHub..."
git add -A
git commit -m "chore: auto-commit via ending.sh - $(date '+%Y-%m-%d %H:%M')" || echo "無新變更需要提交"
git push origin main
echo "✅ 已推送至遠端"
echo ""

echo "=========================================="
echo "  ✅ 結束流程完成！"
echo "  交接紀錄已更新，程式碼已推送"
echo "=========================================="
