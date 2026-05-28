#!/usr/bin/env bash
set -euo pipefail

# Resolve symlinks to find the real install location
SOURCE="${BASH_SOURCE[0]}"
while [[ -L "$SOURCE" ]]; do
  DIR="$(cd "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd "$(dirname "$SOURCE")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Banner
banner() {
  echo ""
  echo -e "${MAGENTA}${BOLD}  ⚡ TORO${NC} ${DIM}— Israel's Fastest AI Real Estate Platform${NC}"
  echo -e "${DIM}  ─────────────────────────────────────────────${NC}"
  echo ""
}

# ============================================================
# toro hunt [URL]
# ============================================================
cmd_hunt() {
  local url="${1:-}"
  if [[ -z "$url" ]]; then
    echo -e "${RED}✗ Usage: toro hunt <url>${NC}"
    echo "  Paste a Yad2, Facebook, or Madlan URL"
    exit 1
  fi

  banner
  echo -e "${CYAN}${BOLD}[Scout]${NC} Hunting property from: ${DIM}${url}${NC}"
  echo ""

  # Run the hunt pipeline via tsx
  cd "$ROOT_DIR"
  npx tsx bin/hunt.ts "$url"
}

# ============================================================
# toro status
# ============================================================
cmd_status() {
  banner
  echo -e "${CYAN}${BOLD}[Status]${NC} Fetching latest issues from Linear..."
  echo ""

  cd "$ROOT_DIR"
  npx tsx bin/status.ts
}

# ============================================================
# toro dev
# ============================================================
cmd_dev() {
  banner
  echo -e "${GREEN}${BOLD}[Dev]${NC} Starting all services..."
  echo ""
  cd "$ROOT_DIR"
  pnpm dev
}

# ============================================================
# toro check
# ============================================================
cmd_check() {
  banner
  echo -e "${BLUE}${BOLD}[Check]${NC} Running monorepo type-check..."
  echo ""
  cd "$ROOT_DIR"
  pnpm run check-types
}

# ============================================================
# toro deploy
# ============================================================
cmd_deploy() {
  banner
  echo -e "${MAGENTA}${BOLD}[Deploy]${NC} Committing, pushing, and syncing..."
  echo ""
  cd "$ROOT_DIR"
  pnpm run deploy
}

# ============================================================
# toro audit-push
# ============================================================
cmd_audit_push() {
  banner
  echo -e "${CYAN}${BOLD}[Audit]${NC} Merging reports and pushing to Linear..."
  echo ""

  cd "$ROOT_DIR"
  npx tsx scripts/upload-audit.ts
}

# ============================================================
# Router
# ============================================================
cmd="${1:-help}"
shift || true

case "$cmd" in
  hunt)        cmd_hunt "$@" ;;
  status)      cmd_status ;;
  audit-push)  cmd_audit_push ;;
  dev)         cmd_dev ;;
  check)       cmd_check ;;
  deploy)      cmd_deploy ;;
  help|--help|-h)
    banner
    echo -e "  ${BOLD}Commands:${NC}"
    echo -e "    ${GREEN}hunt ${DIM}<url>${NC}     Scout a property URL → AI Swarm → Linear"
    echo -e "    ${GREEN}status${NC}          Show latest Linear issues"
    echo -e "    ${GREEN}audit-push${NC}      Merge audit reports → push to Linear"
    echo -e "    ${GREEN}dev${NC}             Start all dev servers"
    echo -e "    ${GREEN}check${NC}           Run monorepo type-check"
    echo -e "    ${GREEN}deploy${NC}          Commit, push, and sync to Linear"
    echo ""
    ;;
  *)
    echo -e "${RED}✗ Unknown command: ${cmd}${NC}"
    echo "  Run 'toro help' for usage"
    exit 1
    ;;
esac
