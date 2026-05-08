#!/usr/bin/env bash
# scripts/railway.sh
#
# Provision, configure, deploy, and operate the DNH Hapur app on Railway
# from the terminal. Idempotent — every subcommand is safe to re-run.
#
# Usage:
#   ./scripts/railway.sh provision       # init project + Postgres + web service + vars
#   ./scripts/railway.sh vars            # (re-)sync env vars on the web service
#   ./scripts/railway.sh deploy [msg]    # build + deploy from current directory
#   ./scripts/railway.sh logs [N]        # last N lines (default 200) of web logs
#   ./scripts/railway.sh tail            # stream live web logs
#   ./scripts/railway.sh build-logs      # last build logs
#   ./scripts/railway.sh status          # what's linked, what's deployed
#   ./scripts/railway.sh domain          # mint a railway.app domain on :3000
#   ./scripts/railway.sh open            # open project in the browser
#   ./scripts/railway.sh up              # provision (if needed) + deploy + logs
#
# Environment overrides:
#   PROJECT_NAME       default: dnh-hapur
#   WEB_SERVICE        default: web
#   DB_SERVICE         default: Postgres
#   PUBLIC_SITE_URL    default: http://localhost:3000  (replace post-domain)
#   CONTACT_TO_EMAIL   default: enquiry@dnhhapur.com
#   PAYLOAD_SECRET     default: openssl rand -base64 32
#   RESEND_API_KEY     optional, only set when exported
#   PLAUSIBLE_DOMAIN   optional, only set when exported

set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-dnh-hapur}"
WEB_SERVICE="${WEB_SERVICE:-web}"
DB_SERVICE="${DB_SERVICE:-Postgres}"
PUBLIC_SITE_URL="${PUBLIC_SITE_URL:-http://localhost:3000}"
CONTACT_TO_EMAIL="${CONTACT_TO_EMAIL:-enquiry@dnhhapur.com}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

c_info(){ printf '\033[36m%s\033[0m\n' "$*"; }
c_ok(){   printf '\033[32m%s\033[0m\n' "$*"; }
c_warn(){ printf '\033[33m%s\033[0m\n' "$*" >&2; }
c_err(){  printf '\033[31m%s\033[0m\n' "$*" >&2; }

require_cli(){
  if ! command -v railway >/dev/null 2>&1; then
    c_err "railway CLI not found."
    c_err "  brew install railway     # macOS"
    c_err "  npm i -g @railway/cli    # cross-platform"
    exit 1
  fi
  if ! railway whoami --json >/dev/null 2>&1; then
    c_err "not logged in. Run: railway login"
    exit 1
  fi
  command -v python3 >/dev/null 2>&1 || { c_err "python3 required for JSON parsing"; exit 1; }
}

is_linked(){
  railway status --json 2>/dev/null \
    | python3 -c 'import json,sys
try:
  d=json.load(sys.stdin)
  sys.exit(0 if d.get("name") or d.get("project") else 1)
except Exception:
  sys.exit(1)'
}

linked_project_name(){
  railway status --json 2>/dev/null \
    | python3 -c 'import json,sys
d=json.load(sys.stdin)
print(d.get("name") or (d.get("project") or {}).get("name") or "")'
}

# Returns 0 if a service with the given name exists in the linked project.
service_exists(){
  local name="$1"
  railway status --json 2>/dev/null \
    | python3 -c 'import json,sys
n=sys.argv[1].lower()
try:
  d=json.load(sys.stdin)
except Exception:
  sys.exit(1)
svcs=[]
for edge in (d.get("services",{}) or {}).get("edges",[]) or []:
  node=edge.get("node",{})
  if node.get("name"): svcs.append(node["name"])
for s in d.get("services",[]) if isinstance(d.get("services"),list) else []:
  if isinstance(s,dict) and s.get("name"): svcs.append(s["name"])
sys.exit(0 if any(s.lower()==n for s in svcs) else 1)' "$name"
}

cmd_provision(){
  require_cli

  if is_linked; then
    c_info "[provision] already linked → $(linked_project_name)"
  else
    c_info "[provision] creating project '$PROJECT_NAME'"
    railway init --name "$PROJECT_NAME"
  fi

  if service_exists "$DB_SERVICE"; then
    c_info "[provision] '$DB_SERVICE' already present"
  else
    c_info "[provision] adding managed Postgres as '$DB_SERVICE'"
    railway add --database postgres --service "$DB_SERVICE"
  fi

  if service_exists "$WEB_SERVICE"; then
    c_info "[provision] '$WEB_SERVICE' service already present"
  else
    c_info "[provision] creating empty web service '$WEB_SERVICE'"
    railway add --service "$WEB_SERVICE"
  fi

  c_info "[provision] linking cwd to '$WEB_SERVICE'"
  railway link --service "$WEB_SERVICE" >/dev/null 2>&1 || true

  cmd_vars

  c_ok   "[provision] done."
  c_info "       next: ./scripts/railway.sh deploy"
}

cmd_vars(){
  require_cli
  is_linked || { c_err "no linked project. Run: ./scripts/railway.sh provision"; exit 1; }

  local secret="${PAYLOAD_SECRET:-}"
  if [[ -z "$secret" ]]; then
    secret="$(openssl rand -base64 32)"
  fi

  local pairs=(
    "NEXT_PUBLIC_SITE_URL=$PUBLIC_SITE_URL"
    "CONTACT_TO_EMAIL=$CONTACT_TO_EMAIL"
    "PAYLOAD_SECRET=$secret"
    "DATABASE_URI=\${{ ${DB_SERVICE}.DATABASE_URL }}"
  )
  [[ -n "${RESEND_API_KEY:-}"   ]] && pairs+=( "RESEND_API_KEY=$RESEND_API_KEY" )
  [[ -n "${PLAUSIBLE_DOMAIN:-}" ]] && pairs+=( "NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$PLAUSIBLE_DOMAIN" )

  c_info "[vars] writing $(printf '%s\n' "${pairs[@]}" | wc -l | tr -d ' ') variables to '$WEB_SERVICE'"
  railway variable set --service "$WEB_SERVICE" --skip-deploys "${pairs[@]}" >/dev/null
  c_ok   "[vars] done. PAYLOAD_SECRET ${PAYLOAD_SECRET:+(from env)}${PAYLOAD_SECRET:-(generated)}"
}

cmd_deploy(){
  require_cli
  is_linked || { c_err "no linked project. Run: ./scripts/railway.sh provision"; exit 1; }
  service_exists "$WEB_SERVICE" \
    || { c_err "service '$WEB_SERVICE' not found. Run: ./scripts/railway.sh provision"; exit 1; }

  local msg="${1:-deploy from cli at $(date -u +'%Y-%m-%dT%H:%M:%SZ')}"
  c_info "[deploy] uploading $(pwd) → $WEB_SERVICE"
  railway up --detach --service "$WEB_SERVICE" -m "$msg"
  c_ok   "[deploy] queued. Tail with: ./scripts/railway.sh tail"
}

cmd_logs(){
  require_cli
  local n="${1:-200}"
  railway logs --service "$WEB_SERVICE" --lines "$n"
}

cmd_tail(){
  require_cli
  c_info "[tail] streaming '$WEB_SERVICE' logs (Ctrl-C to stop)"
  railway logs --service "$WEB_SERVICE"
}

cmd_build_logs(){
  require_cli
  railway logs --service "$WEB_SERVICE" --build --lines 400
}

cmd_status(){
  require_cli
  c_info "[status] context"
  railway status || c_warn "       (no linked project — run: ./scripts/railway.sh provision)"
  echo
  if is_linked; then
    c_info "[status] services"
    railway service list 2>/dev/null || railway service status --all 2>/dev/null || true
  fi
}

cmd_domain(){
  require_cli
  service_exists "$WEB_SERVICE" \
    || { c_err "service '$WEB_SERVICE' not found. Run: ./scripts/railway.sh provision"; exit 1; }
  c_info "[domain] minting railway.app domain on :3000"
  railway domain --service "$WEB_SERVICE" --port 3000
  c_warn "       remember: also set NEXT_PUBLIC_SITE_URL to the new URL → ./scripts/railway.sh vars (with PUBLIC_SITE_URL=https://...)"
}

cmd_open(){
  require_cli
  railway open
}

cmd_up(){
  cmd_provision
  cmd_deploy "${1:-initial deploy}"
  cmd_tail
}

cmd_help(){
  sed -n '/^# Usage:/,/^# *PLAUSIBLE_DOMAIN/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

main(){
  local sub="${1:-help}"; shift || true
  case "$sub" in
    provision)   cmd_provision  "$@" ;;
    vars)        cmd_vars       "$@" ;;
    deploy)      cmd_deploy     "$@" ;;
    logs)        cmd_logs       "$@" ;;
    tail)        cmd_tail       "$@" ;;
    build-logs)  cmd_build_logs "$@" ;;
    status)      cmd_status     "$@" ;;
    domain)      cmd_domain     "$@" ;;
    open)        cmd_open       "$@" ;;
    up)          cmd_up         "$@" ;;
    -h|--help|help) cmd_help ;;
    *) c_err "unknown subcommand: $sub"; cmd_help; exit 1 ;;
  esac
}

main "$@"
