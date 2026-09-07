# Fairway Platform — Documentation

This website is built using [Docusaurus](https://docusaurus.io/) and deployed to **S3 + CloudFront** at **docs.pinhigh.ai**.

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

## Infrastructure

The site is hosted on AWS using CloudFormation (`infra/template.yaml`):

- **S3** — private bucket for static assets (no public access)
- **CloudFront** — CDN with Origin Access Control (OAC) to S3
- **ACM** — TLS certificate for `docs.pinhigh.ai` (provisioned separately in us-east-1)

Stack name: `fairway-docs-dev`

## CI/CD Pipeline

This repo uses GitHub Actions for continuous integration and deployment:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** (`.github/workflows/ci.yml`) | Push to `main`, PRs to `main` | Build validation, uploads build artifact |
| **Deploy** (`.github/workflows/deploy.yml`) | Push to `main` | Deploys CloudFormation stack, syncs build to S3, invalidates CloudFront |

Production deploys happen automatically on push to `main`.

### Required Secrets

Set these in the repo's GitHub Settings → Secrets:

- `AWS_CD_ROLE_ARN` — IAM role ARN for GitHub OIDC (org-level secret)
- `ACM_CERT_ARN` — ACM certificate ARN for `docs.pinhigh.ai` in us-east-1
