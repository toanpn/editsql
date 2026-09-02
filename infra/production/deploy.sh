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
# protocol.version=0 is not a style choice. On this box git's v2 negotiation
# against github.com fails with "expected flush after ref listing" and then
# falls back to prompting for a username, which in a non-interactive deploy
# reads as a permission error on a repo that is in fact public. curl reaches
# the same endpoint fine and v0 works, so the fault is in v2 over this host's
# network path. Pinning it here rather than in the repo's local config keeps
# the script working even if /srv/editsql is ever re-cloned by hand.
git -c protocol.version=0 fetch --quiet origin main
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

echo "### reclaiming layers orphaned by this build"
docker image prune -f >/dev/null
df -h /

echo "### done: $(git log -1 --format='%h %s')"
