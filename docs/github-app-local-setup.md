# GitHub App local setup

Lintel’s GitHub App workflow is a local-development foundation for automated pull-request ingestion and analysis.

It does not add OAuth, user accounts, GitHub comments, merge blocking, or a production queue. Runtime records are stored in `.lintel-data/`, which is ignored by Git and intended only for local MVP testing.

## Environment

Add these values to `.env.local`:

```env
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
```

Use placeholder-free real values only in local environment files. Do not commit them.

Private keys may be stored with escaped newlines:

```env
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
```

## Development GitHub App settings

Create a GitHub App for local testing and configure:

- Webhook URL: your public HTTPS tunnel URL ending in `/api/github-app/webhook`
- Webhook secret: the same value as `GITHUB_WEBHOOK_SECRET`
- Repository permissions:
  - Contents: read
  - Pull requests: read
- Subscribe to events:
  - Installation
  - Installation repositories
  - Pull request

For local testing, use an HTTPS tunnel such as ngrok or Cloudflare Tunnel to forward to your local Next.js server.

## What happens on webhook delivery

For verified webhook deliveries, Lintel:

1. Validates `X-Hub-Signature-256` before parsing JSON.
2. Normalises only the minimal event envelope.
3. Deduplicates by `X-GitHub-Delivery`.
4. Stores safe processing state in `.lintel-data/github-app-store.json`.
5. Uses a short-lived installation token server-side.
6. Fetches pull-request metadata and diff.
7. Runs the existing deterministic readiness generator.
8. Stores the completed report for later display/comment delivery work.

Raw webhook payloads, installation tokens and raw diffs are not persisted.

## Local MVP limitation

The `.lintel-data` store is a single-process local file store. It is not a production database, distributed queue, audit log, or multi-instance persistence layer.
