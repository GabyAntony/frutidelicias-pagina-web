#!/usr/bin/env bash
#
# Arranque local de desarrollo: backend con recarga + frontend en modo dev.
#
#   bash ./dev.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT}}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///${ROOT}/backend/data/fruti.db}"
export PYTHONUNBUFFERED=1

cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  ./.venv/bin/pip install --quiet --upgrade pip
  ./.venv/bin/pip install --quiet -r requirements.txt
fi
./.venv/bin/python -m uvicorn main:app --reload --host 127.0.0.1 --port "${BACKEND_PORT}" &
BACKEND_PID=$!

FRONTEND_PID=""
cleanup() {
  [ -n "${FRONTEND_PID}" ] && kill "${FRONTEND_PID}" 2>/dev/null || true
  kill "${BACKEND_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT}/api/health" > /dev/null; then
    break
  fi
  sleep 0.5
done

cd "$ROOT/frontend"
[ -d node_modules ] || npm install --no-audit --no-fund
npm run dev -- --port "${FRONTEND_PORT}" &
FRONTEND_PID=$!
wait "${FRONTEND_PID}"
