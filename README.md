# Fairway Platform — Documentation

This website is built using [Docusaurus](https://docusaurus.io/) and deployed to [Cloudflare Pages](https://pages.cloudflare.com/) at **docs.pinhigh.ai**.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

Starts a local development server with hot reload.

## Build

```bash
npm run build
```

Generates static content into the `build` directory.

## CI/CD Pipeline

This repo uses GitHub Actions for continuous integration and deployment:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** (`.github/workflows/ci.yml`) | Push to `main`, PRs to `main` | Build validation, uploads build artifact |
| **Deploy** (`.github/workflows/deploy.yml`) | Push to `main`, PRs to `main` | Deploys to Cloudflare Pages (`fairway-docs` project) |

- **Production** deploys happen automatically on push to `main`.
- **Preview** deploys are created for pull requests, providing a unique preview URL.

### Required Secrets

Set these in the repo's GitHub Settings → Secrets:

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID
