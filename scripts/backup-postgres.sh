#!/usr/bin/env bash
# scripts/backup-postgres.sh
#
# Snapshot the Payload Postgres database. Designed to run from cron on the
# Railway environment, or from a maintainer's laptop against any
# DATABASE_URI. Writes a gzip-compressed pg_dump to a target directory and
# keeps the last N=14 by default.
#
# Usage:
#   DATABASE_URI=postgres://... ./scripts/backup-postgres.sh /var/backups/dnh
#
# Requirements: postgresql-client (`pg_dump`), GNU date, gzip.

set -euo pipefail

target_dir="${1:-./backups}"
keep="${BACKUP_KEEP:-14}"

if [[ -z "${DATABASE_URI:-}" ]]; then
  echo "DATABASE_URI is required." >&2
  exit 1
fi

mkdir -p "$target_dir"
stamp="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
out_file="$target_dir/dnh-$stamp.sql.gz"

echo "[backup] dumping to $out_file"
pg_dump --no-owner --no-privileges --clean --if-exists --quote-all-identifiers \
  "$DATABASE_URI" | gzip --best > "$out_file"

echo "[backup] pruning to last $keep"
ls -1t "$target_dir"/dnh-*.sql.gz 2>/dev/null \
  | tail -n +"$((keep + 1))" \
  | xargs -r rm -- || true

echo "[backup] done."
