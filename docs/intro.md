---
sidebar_position: 1
title: Welcome to Fairway
slug: /intro
---

# Welcome to Fairway

Fairway is the application platform by Pin High Systems that lets you build, deploy, and manage AI-powered applications with minimal infrastructure overhead. Whether you're shipping a prototype or scaling to production, Fairway handles the complexity so you can focus on your product.

## What you'll find here

- **[Getting Started](/docs/getting-started/quickstart)** — Install the SDK, define your first app, and deploy it in minutes.
- **[Concepts](/docs/concepts/apps)** — Understand the building blocks: apps, deployments, sandboxes, and infrastructure-from-code.
- **[API Reference](/docs/api/overview)** — Full REST API documentation for programmatic access.
- **[SDKs](/docs/sdk/python)** — Python and JavaScript client libraries for defining and deploying apps from code. Install `fairway-sdk` (Python) or `@pinhigh/fairway-sdk` (JavaScript) and go.
- **[MCP](/docs/mcp/overview)** — Model Context Protocol server for AI-agent integrations.

## Define, deploy, done

With the Fairway SDK, your infrastructure lives in your application code — no YAML, no templates, no separate tooling:

```python
from fairway import WebApp, Service, Datastore, FairwayClient, TokenAuth

app = WebApp("my-app")
app.add(Service("api"))
app.add(Datastore("items", partition_key="id"))

client = FairwayClient("https://api.fairway.dev", auth=TokenAuth("your-token"))
app.deploy(client=client)
```

Ready to dive in? Head to the [Quickstart](/docs/getting-started/quickstart).
