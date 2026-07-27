#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
set -a
source .env
set +a
./render-config.py
# Alertmanager runs as uid 65534 in the official image.
chown 65534:65534 rendered/alertmanager.yml
docker compose config >/dev/null
docker compose up -d
docker exec kalima-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml
curl --fail --silent http://127.0.0.1:19090/-/ready >/dev/null
curl --fail --silent http://127.0.0.1:19093/-/ready >/dev/null
