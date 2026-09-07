---
sidebar_position: 1
title: What is a Fairway App
---

# What is a Fairway App

A Fairway App is the top-level unit of deployment on the platform. It encapsulates your application code, configuration, and infrastructure requirements into a single, portable artifact.

## Defining an app with the SDK

Every app starts with a `WebApp` — the container that holds your services and data stores. You add resources to it, and Fairway figures out the infrastructure.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```python
from fairway import WebApp, Service, Datastore

app = WebApp("my-app")

# Add an API service with routes
api = Service("api")
api.route("GET", "/items")
api.route("POST", "/items")
app.add(api)

# Add a data store
items = Datastore("items", partition_key="id")
app.add(items)
```

</TabItem>
<TabItem value="javascript" label="JavaScript / TypeScript">

```typescript
import { WebApp, Service, Datastore } from '@pinhigh/fairway-sdk';

const app = new WebApp('my-app');

// Add an API service with routes
const api = new Service('api');
api.route('GET', '/items');
api.route('POST', '/items');
app.add(api);

// Add a data store
const items = new Datastore('items', { partitionKey: 'id' });
app.add(items);
```

</TabItem>
</Tabs>

## App structure

A Fairway app is composed of **resources** — the building blocks that describe what your application needs:

| Resource | What it provides |
|----------|-----------------|
| **Service** | HTTP API with routes — Fairway provisions compute and an API gateway |
| **Datastore** | Managed data table with automatic scaling and backup |

Resources are declarative: you say *what* you need, not *how* to provision it. Fairway handles the rest.

## Manifest

When you call `app.manifest()`, the SDK produces a JSON manifest describing every resource in the app. This manifest is what gets sent to the Fairway control plane during deployment.

```python
manifest = app.manifest()
# {
#   "app": "my-app",
#   "resources": [
#     {"type": "service", "name": "api", "routes": [...]},
#     {"type": "datastore", "name": "items", "partition_key": "id"}
#   ]
# }
```

You never write the manifest by hand — the SDK generates it from your resource definitions.

## App lifecycle

| Stage | What happens |
|-------|-------------|
| **Define** | Create a `WebApp`, add resources in code |
| **Validate** | `app.validate()` checks for configuration errors locally |
| **Plan** | `client.plan()` previews what infrastructure changes will be made |
| **Deploy** | `app.deploy(client)` sends the manifest and provisions resources |
| **Monitor** | `client.getLogs()` retrieves application logs |
| **Rollback** | `client.rollback()` reverts to a previous deployment |

## Next steps

- **[Infrastructure from Code →](/docs/concepts/infrastructure-from-code)** — Understand why your code *is* the infrastructure definition.
- **[Python SDK →](/docs/sdk/python)** — Full resource and client reference.
- **[JavaScript SDK →](/docs/sdk/javascript)** — Full reference with TypeScript types.
