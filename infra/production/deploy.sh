#!/usr/bin/env bash
# Redeploy litesql.online from origin/main. Runs as root on the origin box:
#   /srv/deploy-editsql.sh
#
# The box is shared with sautruyen, which owns port 3000 and most of the disk.
# Both of those constraints shape this script: we publish on 3100, and we treat
# free space as a precondition rather than discovering it halfway through a
# build that then leaves a half-written layer behind.
set -euo pipefail

REPO=/srv/editsql
IMAGE=editsql:latest
CONTAINER=editsql
PORT=3100
MIN_FREE_MB=3072

cd "$REPO"

echo "### disk precondition"
free_mb=$(df --output=avail -m / | tail -1 | tr -d ' ')
echo "free on /: ${free_mb}MB (need ${MIN_FREE_MB}MB)"
if [ "$free_mb" -lt "$MIN_FREE_MB" ]; then
  echo "not enough disk to build safely — reclaiming first" >&2
  docker image prune -f
  free_mb=$(df --output=avail -m / | tail -1 | tr -d ' ')
  if [ "$free_mb" -lt "$MIN_FREE_MB" ]; then
    echo "still only ${free_mb}MB free — deploy ABORTED before touching the running site" >&2
    exit 1
  fi
fi

echo "### fetching origin/main"
# Two separate problems are being worked around here, both of which surface as
# the same misleading message: git asking for a username on a public repo.
#
# protocol.version=0 — this host cannot negotiate git's v2 against github.com.
# It fails with "expected flush after ref listing" and then falls back to
# asking for credentials. curl reaches the identical endpoint fine, so the
# fault is in v2 over this host's network path. Pinned here rather than in the
# repo's local config so the script survives a manual re-clone.
#
# The retries — even on v0, a fetch occasionally comes back needing auth and
# then succeeds moments later, which is what anonymous rate limiting from a
# shared VPS address looks like. Without retries a throttled minute fails a
# deploy that has nothing wrong with it. Switching origin to an authenticated
# SSH deploy key removes the cause; see README.md.
fetched=0
for attempt in 1 2 3 4 5; do
  if git -c protocol.version=0 fetch --quiet origin main 2>/tmp/editsql-fetch.err; then
    fetched=1
    break
  fi
  echo "fetch attempt ${attempt} failed: $(head -1 /tmp/editsql-fetch.err)" >&2
  sleep $((attempt * 5))
done
if [ "$fetched" != "1" ]; then
  echo "could not fetch origin/main after 5 attempts — deploy ABORTED, site untouched" >&2
  exit 1
fi
git reset --hard --quiet origin/main
echo "now at: $(git log -1 --oneline)"

echo "### build"
# Built before anything is stopped: a failing build leaves the currently
# serving container untouched and the site stays up.
docker build -t "$IMAGE" .

echo "### swap container"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
# 127.0.0.1 on purpose. A container published to 0.0.0.0 writes its own DNAT
# rule ahead of ufw's chain and silently exposes the port to the internet;
# binding the loopback is the part that actually holds. Caddy is the only way in.
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p "127.0.0.1:${PORT}:3000" \
  -e NODE_ENV=production \
  "$IMAGE" >/dev/null

echo "### health check"
# CI reports this script's exit status as the deploy result. Without this the
# job goes green whenever docker *started* the container, which it does even
# when the process crashes on boot and restarts forever.
for i in $(seq 1 45); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${PORT}/" || echo 000)
  if [ "$code" = "200" ]; then
    echo "app answering 200 after ${i}s"
    break
  fi
  if [ "$i" = "45" ]; then
    echo "app never answered 200 (last: $code) — deploy FAILED" >&2
    docker logs --tail 50 "$CONTAINER" >&2 || true
    exit 1
  fi
  sleep 1
done

echo "### reclaiming space"
# Two different caches, and only pruning the first is why this box crept from
# 92% to 95% full on the very first deploy. `image prune` drops images the new
# build superseded; the buildkit cache is separate and grew to 2.5GB on its
# own. Capping it at 1GB keeps the npm-install layer warm — the expensive one,
# and the one that only changes when package-lock.json does — while refusing to
# let intermediate layers accumulate on a filesystem shared with sautruyen's
# 52GB of data.
docker image prune -f >/dev/null
docker builder prune -f --max-used-space 1GB >/dev/null
df -h /

echo "### done: $(git log -1 --format='%h %s')"
