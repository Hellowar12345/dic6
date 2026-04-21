#!/bin/bash
# ============================================================
# startup.sh — Dev Startup Script
# Responsibilities:
#   1. Pull code from GitHub
#   2. Read the handover document (HANDOVER.md)
#   3. Suggest the next actions
# ============================================================

set -e

echo "=========================================="
echo "  智慧停車位預測系統 (DD-LSTM)"
echo "  Dev Startup"
echo "=========================================="
echo ""

# ──────────────────────────────────────
# 1. Pull code from GitHub
# ──────────────────────────────────────
echo "[1/3] Pulling latest code from GitHub..."
git pull origin main 2>/dev/null || echo "⚠️  Git pull failed (offline or no remote)"
echo "✅ Code is up to date"
echo ""

# ──────────────────────────────────────
# 2. Read handover document
# ──────────────────────────────────────
echo "[2/3] Reading handover document..."
echo ""
if [ -f "HANDOVER.md" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat HANDOVER.md
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "ℹ️  No HANDOVER.md found. This may be the first session."
fi
echo ""

# ──────────────────────────────────────
# 3. Suggest next actions
# ──────────────────────────────────────
echo "[3/3] Analyzing project state & suggesting next actions..."
echo ""

# List all changes
echo "📋 Active changes:"
openspec list --changes 2>/dev/null || echo "  (none found)"
echo ""

# Find the latest change and show its status
LATEST_CHANGE=""
if [ -d "openspec/changes" ]; then
    LATEST_CHANGE=$(ls -td openspec/changes/*/ 2>/dev/null | head -1 | xargs -I {} basename {})
fi

if [ -n "$LATEST_CHANGE" ]; then
    echo "🔍 Latest change: $LATEST_CHANGE"
    openspec status --change "$LATEST_CHANGE" 2>/dev/null || true
    echo ""

    # Check tasks progress
    TASKS_FILE="openspec/changes/$LATEST_CHANGE/tasks.md"
    if [ -f "$TASKS_FILE" ]; then
        TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null || echo "0")
        DONE=$(grep -c '^\- \[x\]' "$TASKS_FILE" 2>/dev/null || echo "0")
        TODO=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || echo "0")

        echo "📊 Tasks: $DONE/$TOTAL complete, $TODO remaining"
        echo ""

        # Suggest next actions based on state
        echo "💡 Suggested next actions:"
        if [ "$TODO" -eq 0 ] 2>/dev/null; then
            echo "  → All tasks complete! Run: openspec archive $LATEST_CHANGE"
            echo "  → Or start a new change with the next NN- number"
        else
            echo "  → Continue implementing tasks: /opsx:apply"
            echo "  → View remaining tasks: openspec show $LATEST_CHANGE"
            # Show first 3 remaining tasks
            echo ""
            echo "  📌 Next pending tasks:"
            grep '^\- \[ \]' "$TASKS_FILE" 2>/dev/null | head -3 | while read -r line; do
                echo "     $line"
            done
        fi
    fi
else
    echo "💡 Suggested next actions:"
    echo "  → Create your first change: openspec new change \"01-your-feature-name\""
    echo "  → Or propose a change: /opsx:propose"
fi

echo ""
echo "=========================================="
echo "  ✅ Startup complete. Ready to work!"
echo "=========================================="
