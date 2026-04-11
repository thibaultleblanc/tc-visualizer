#!/usr/bin/env bash
set -euo pipefail

echo "[1/2] Execution du script tc dans le conteneur"
docker run --rm -t \
  --cap-add=NET_ADMIN \
  -v "$(pwd):/work" \
  -w /work \
  alpine:latest \
  sh -lc '
    set -e

    apk add --no-cache iproute2 bash >/dev/null

    bash /work/example_tc_config.sh

    echo
    echo "=== tc qdisc show ==="
    tc -s qdisc show dev itf1 || true
    tc -s qdisc show dev itf2 || true
    tc -s qdisc show dev itf3 || true

    echo
    echo "=== tc class show ==="
    tc class show dev itf1 || true
    tc class show dev itf2 || true
    tc class show dev itf3 || true

    echo
    echo "=== tc filter show ==="
    tc filter show dev itf1 parent 10: || true
    tc filter show dev itf2 parent 20: || true
    tc filter show dev itf3 parent 30: || true
  '

echo "[2/2] OK"
