# Production — litesql.online

The site runs as a Docker container on the box that also serves sautruyen.
Sharing a host is the reason for most of the specifics below.

| | |
|---|---|
| Host | `185.202.236.176` (`root`) |
| Host key | `SHA256:MafPVCdc2RzSjQQd60RuWAaJzQutZ0Q+B1uYWHdItvM` |
| Checkout | `/srv/editsql` |
| Deploy script | `/srv/deploy-editsql.sh` (from `infra/production/deploy.sh`) |
| Container | `editsql`, published on `127.0.0.1:3100` |
| TLS / routing | Caddy, `/srv/stack/Caddyfile` |

## Why 3100

Port 3000 belongs to sautruyen's Next server. Nothing enforces this beyond the
two projects agreeing on it, so if a third app lands here, pick another port
rather than assuming 3100 is free.

## Why the container binds 127.0.0.1

`-p 127.0.0.1:3100:3000`, never `-p 3100:3000`. Docker writes its own DNAT rule
ahead of ufw's chain, so a container published to `0.0.0.0` is reachable from
the internet even though `ufw status` says the port is closed. Caddy is meant to
be the only way in.

## Disk

The box runs close to full — it was at 92% when this was set up, with the bulk
of it sautruyen's Postgres and MinIO volumes. `deploy.sh` refuses to start a
build with under 3GB free and prunes dangling images after each one. If a deploy
aborts on that check, the fix is to reclaim space, not to lower the threshold:
a build that runs the root filesystem to zero takes both sites down, not one.

## git protocol v2

This host cannot negotiate git's protocol v2 against github.com — the fetch
fails with `expected flush after ref listing` and then asks for a username,
which looks exactly like a permissions problem on a repo that is actually
public. `deploy.sh` pins `protocol.version=0`. Keep that flag on any manual
`git fetch` here too.

## The Caddyfile is shared

`/srv/stack/Caddyfile` serves both sites, so it is not owned by this repo. Its
tracked copy lives in the sautruyen repo at `infra/production/Caddyfile`; the
blocks belonging to litesql.online are mirrored here in `Caddyfile.snippet` so
changes to them are reviewable in this repo. Edit both, then:

```sh
docker exec -w /etc/caddy sautruyen-caddy caddy reload --config /etc/caddy/Caddyfile
```

## CI/CD

`ci.yml` builds every push and pull request. `deploy.yml` triggers on a
successful CI run on `main` (or manually via `workflow_dispatch`), SSHes in, and
then verifies the public URL over TLS — the part the on-box health check cannot
see.

The deploy key is pinned in `/root/.ssh/authorized_keys` with
`command="/srv/deploy-editsql.sh"`, so a stolen key can redeploy the current
`main` and nothing else. It cannot open a shell, forward a port, or run an
arbitrary command.

### Rotating the deploy key

```sh
ssh-keygen -t ed25519 -N '' -C 'github-actions-deploy@editsql' -f ./editsql_ci
# on the box: replace the matching line in /root/.ssh/authorized_keys, keeping
#   command="/srv/deploy-editsql.sh",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding
# then paste the private half into the repo secret DEPLOY_SSH_KEY
```

## Manual redeploy

```sh
ssh root@185.202.236.176 /srv/deploy-editsql.sh
```

## DNS

`litesql.online` is registered at Namecheap on BasicDNS. Both records point at
the box:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.202.236.176` |
| A | `www` | `185.202.236.176` |

`www` exists only so Caddy can 301 it to the apex; every canonical tag in
`src/app` names the apex.
