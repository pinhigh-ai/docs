---
sidebar_position: 4
title: Infrastructure from Code
---

# Infrastructure from Code

Fairway uses an **Infrastructure-from-Code (IFC)** approach: your application code *is* the infrastructure definition. Instead of writing separate IaC templates, Fairway infers the resources your app needs and provisions them automatically.

## How IFC differs from IaC

Traditional Infrastructure-as-Code (IaC) tools — Terraform, CloudFormation, Pulumi — require you to maintain a separate layer of configuration that describes your infrastructure. That means two codebases to keep in sync: your application code and your infrastructure definitions.

With IFC, there is no separate layer. When you write this:

```python
from fairway import WebApp, Service, Datastore

app = WebApp("my-app")

api = Service("api")
api.route("GET", "/items")
api.route("POST", "/items")

items = Datastore("items", partition_key="id")

app.add(api)
app.add(items)
```

…you've defined both your application *and* its infrastructure. The SDK inspects your resource definitions and builds a manifest describing exactly what needs to be provisioned. No YAML, no HCL, no JSON templates.

## The grep test

A core Fairway principle: **no cloud-provider nouns should appear in your application code**. You won't find "Lambda", "DynamoDB", "API Gateway", or any AWS-specific term in a Fairway app definition. If you can grep your codebase for cloud provider names and get zero hits, you pass the grep test.

This means your app is portable. Fairway maps your abstract resources to concrete cloud infrastructure behind the scenes — today that's AWS, but your code doesn't know or care.

## How the SDK embodies IFC

The Fairway SDKs are the primary interface for IFC. Here's how the model works:

### 1. You declare resources

```typescript
import { WebApp, Service, Datastore } from '@pinhigh/fairway-sdk';

const app = new WebApp('todo-api');

const api = new Service('api');
api.route('GET', '/todos');
api.route('POST', '/todos');
api.route('GET', '/todos/:id');

const todos = new Datastore('todos', { partitionKey: 'id' });

app.add(api);
app.add(todos);
```

### 2. The SDK infers infrastructure

When you call `app.manifest()` or `app.deploy()`, the SDK walks your resource tree and produces a manifest — a complete description of the infrastructure your app needs:

- A `Service` with routes → API gateway + compute
- A `Datastore` with a partition key → managed data table with scaling

### 3. Fairway provisions it

The control plane receives the manifest and maps each abstract resource to cloud primitives. It handles provisioning, networking, permissions, scaling, and monitoring.

### 4. You iterate

Change your code, redeploy. Fairway diffs the new manifest against the current state and applies only the changes — add a route, add a datastore, remove a service. No manual resource cleanup.

## What IFC gives you

| Benefit | How |
|---------|-----|
| **Single source of truth** | Your app code defines both behavior and infrastructure |
| **No drift** | Infrastructure always matches what your code declares |
| **No cloud lock-in** | Abstract resources, not provider-specific primitives |
| **Safe deploys** | `client.plan()` previews changes before applying them |
| **Automatic cleanup** | Remove a resource from code → Fairway removes it from infra |

## Supported resource types

| SDK class | What Fairway provisions |
|-----------|------------------------|
| `WebApp` | Application container with routing and DNS |
| `Service` | HTTP API — compute, API gateway, auto-scaling |
| `Datastore` | Managed data table — storage, indexes, backups |

## Anti-bill-anxiety: caps by default

Fairway provisions resources with cost caps enabled by default. Scaling is automatic, but bounded — your app throttles rather than running up an unbounded bill. You can raise limits explicitly, but the safe default protects you from surprises.

## Next steps

- **[Quickstart →](/docs/getting-started/quickstart)** — See IFC in action in under 5 minutes.
- **[Apps →](/docs/concepts/apps)** — How apps are structured and managed.
- **[Python SDK →](/docs/sdk/python)** / **[JavaScript SDK →](/docs/sdk/javascript)** — Full SDK references.
