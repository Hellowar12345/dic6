#!/bin/bash
# ============================================================
# startup.sh — 營運自動化：啟動腳本
# 功能：拉取最新程式碼、閱讀交接資訊、顯示提示
# ============================================================

set -e

echo "=========================================="
echo "  智慧停車位預測系統 (DD-LSTM)"
echo "  Startup Script"
echo "=========================================="
echo ""

# 1. 拉取最新程式碼
echo "[1/3] 拉取最新程式碼..."
git pull origin main
echo "✅ 程式碼已更新"
echo ""

# 2. 閱讀交接資訊
echo "[2/3] 閱讀交接資訊..."
if [ -f "HANDOVER.md" ]; then
    echo "--- 交接紀錄 ---"
    cat HANDOVER.md
    echo "--- 交接紀錄結束 ---"
else
    echo "⚠️  尚無交接紀錄 (HANDOVER.md)"
fi
echo ""

# 3. 顯示 OpenSpec 狀態提示
echo "[3/3] OpenSpec 變更狀態..."
CHANGES=$(openspec list --changes 2>/dev/null || echo "無法讀取")
echo "$CHANGES"
echo ""

# 顯示最新的 change 狀態
LATEST_CHANGE=$(ls -td openspec/changes/*/ 2>/dev/null | head -1 | xargs -I {} basename {})
if [ -n "$LATEST_CHANGE" ]; then
    echo "最新變更: $LATEST_CHANGE"
    openspec status --change "$LATEST_CHANGE" 2>/dev/null || true
fi
echo ""

echo "=========================================="
echo "  ✅ 啟動完成！可以開始工作"
echo "  提示: 執行 /opsx:apply 開始實作任務"
echo "=========================================="
