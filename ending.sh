#!/bin/bash
# ============================================================
# ending.sh — Dev Ending Script
# Responsibilities:
#   1. Update tasks.md (show current progress)
#   2. Archive the change if everything is complete
#   3. Write handover document (HANDOVER.md) for next dev
#   4. Push code to GitHub
# ============================================================

set -e

echo "=========================================="
echo "  智慧停車位預測系統 (DD-LSTM)"
echo "  Dev Ending"
echo "=========================================="
echo ""

# Find latest change
LATEST_CHANGE=""
if [ -d "openspec/changes" ]; then
    LATEST_CHANGE=$(ls -td openspec/changes/*/ 2>/dev/null | head -1 | xargs -I {} basename {})
fi

if [ -z "$LATEST_CHANGE" ]; then
    echo "⚠️  No active changes found. Nothing to wrap up."
    exit 0
fi

echo "📦 Wrapping up change: $LATEST_CHANGE"
echo ""

# ──────────────────────────────────────
# 1. Update tasks.md — show current progress
# ──────────────────────────────────────
echo "[1/4] Checking tasks.md progress..."
TASKS_FILE="openspec/changes/$LATEST_CHANGE/tasks.md"
TOTAL=0
DONE=0
TODO=0

if [ -f "$TASKS_FILE" ]; then
    TOTAL=$(grep -c '^\- \[' "$TASKS_FILE" 2>/dev/null | tr -d '\r' || echo "0")
    DONE=$(grep -c '^\- \[x\]' "$TASKS_FILE" 2>/dev/null | tr -d '\r' || echo "0")
    TODO=$(grep -c '^\- \[ \]' "$TASKS_FILE" 2>/dev/null | tr -d '\r' || echo "0")
    echo "  Tasks: $DONE/$TOTAL complete, $TODO remaining"
else
    echo "  ⚠️  tasks.md not found"
fi
echo ""

# ──────────────────────────────────────
# 2. Archive the change if everything is complete
# ──────────────────────────────────────
echo "[2/4] Checking if change can be archived..."

# Validate first
openspec validate "$LATEST_CHANGE" 2>/dev/null || echo "  ⚠️  Validation warnings detected"

if [ "$TODO" -eq 0 ] 2>/dev/null && [ "$TOTAL" -gt 0 ] 2>/dev/null; then
    echo "  ✅ All $TOTAL tasks complete. Archiving change..."
    openspec archive "$LATEST_CHANGE" --yes 2>/dev/null || echo "  ⚠️  Archive had warnings (may need manual review)"
    ARCHIVED=true
    echo "  ✅ Change archived successfully"
else
    echo "  ℹ️  $TODO tasks remaining. Change NOT archived."
    echo "  → Complete remaining tasks before archiving."
    ARCHIVED=false
fi
echo ""

# ──────────────────────────────────────
# 3. Write handover document (HANDOVER.md)
# ──────────────────────────────────────
echo "[3/4] Writing handover document..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Calculate next change number
CURRENT_NUM=$(echo "$LATEST_CHANGE" | grep -oE '[0-9]+' | head -1)
if [ -n "$CURRENT_NUM" ]; then
    NEXT_NUM=$(printf "%02d" $((10#$CURRENT_NUM + 1)))
else
    NEXT_NUM="02"
fi

cat > HANDOVER.md << EOF
# Handover Document

**Last Updated**: $TIMESTAMP
**Last Change**: \`$LATEST_CHANGE\`
**Archived**: $ARCHIVED

## Current Status

- **Change**: \`$LATEST_CHANGE\`
- **Schema**: spec-driven
- **Tasks Progress**: $DONE/$TOTAL complete
- **Remaining**: $TODO tasks

## What Was Completed

$(grep '^\- \[x\]' "$TASKS_FILE" 2>/dev/null | tail -10 || echo "- (see tasks.md for details)")

## What Still Needs to Be Done

$(if [ "$TODO" -eq 0 ] 2>/dev/null; then echo "- All tasks are complete!"; else grep '^\- \[ \]' "$TASKS_FILE" 2>/dev/null || echo "- (none)"; fi)

## Next Actions for New Developer

1. Run \`bash startup.sh\` to pull latest code and read this document
2. $(if [ "$ARCHIVED" = true ]; then echo "Start a new change: \`openspec new change \"${NEXT_NUM}-next-feature\"\`"; else echo "Continue implementing: \`/opsx:apply\`"; fi)
3. When done, run \`bash ending.sh\` to wrap up

## Notes

- Change naming convention: \`NN-description\` (e.g., \`${NEXT_NUM}-next-feature\`)
- Next change number should be: **${NEXT_NUM}-**
- Run \`openspec list\` to see all changes
- Run \`openspec status --change <name>\` to check progress
EOF

echo "  ✅ HANDOVER.md written"
echo ""

# ──────────────────────────────────────
# 4. Push code to GitHub
# ──────────────────────────────────────
echo "[4/4] Pushing to GitHub..."
git add -A
git commit -m "chore: dev ending - wrap up $LATEST_CHANGE ($(date '+%Y-%m-%d %H:%M'))" 2>/dev/null || echo "  ℹ️  No new changes to commit"
git push origin main 2>/dev/null || echo "  ⚠️  Push failed (check remote)"
echo "  ✅ Code pushed to GitHub"
echo ""

echo "=========================================="
echo "  ✅ Dev ending complete!"
echo "  HANDOVER.md updated, code pushed"
if [ "$ARCHIVED" = true ]; then
    echo "  Change archived. Next change: ${NEXT_NUM}-..."
fi
echo "=========================================="
