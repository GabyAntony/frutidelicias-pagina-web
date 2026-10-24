#!/usr/bin/env bash
#
# Arranque de producción para Replit: backend (FastAPI) + frontend (Next.js).
#
#   bash ./start.sh
#
# El frontend (puerto 3000) es el único proceso público. Hace de proxy hacia
# el backend con /backend/*, así que las cookies de sesión son "same-origin".
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# La URL que usa el proxy de Next.js para hablar con el API.
export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:${BACKEND_PORT}}"
# Ruta absoluta de la base de datos: sobrevive reinicios en el disco de Replit.
export DATABASE_URL="${DATABASE_URL:-sqlite:///${ROOT}/backend/data/fruti.db}"
export PYTHONUNBUFFERED=1

cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
./.venv/bin/pip install --quiet --upgrade pip
./.venv/bin/pip install --quiet -r requirements.txt

./.venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port "${BACKEND_PORT}" &
BACKEND_PID=$!

FRONTEND_PID=""

cleanup() {
  [ -n "${FRONTEND_PID}" ] && kill "${FRONTEND_PID}" 2>/dev/null || true
  kill "${BACKEND_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Espera a que el API responda antes de levantar el frontend.
for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT}/api/health" > /dev/null; then
    break
  fi
  sleep 0.5
done

cd "$ROOT/frontend"
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi
npm run build

npx next start --hostname 0.0.0.0 --port "${FRONTEND_PORT}" &
FRONTEND_PID=$!
wait "${FRONTEND_PID}"
