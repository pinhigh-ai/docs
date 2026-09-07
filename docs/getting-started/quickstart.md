---
sidebar_position: 1
title: Quickstart
---

# Quickstart

Get up and running with Fairway in under five minutes. Define your app, connect to the platform, and deploy — all from code.

## 1. Install the SDK

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="python" label="Python">

```bash
pip install fairway-sdk
```

</TabItem>
<TabItem value="javascript" label="JavaScript / TypeScript">

```bash
npm install @pinhigh/fairway-sdk
```

</TabItem>
</Tabs>

## 2. Define your app

<Tabs>
<TabItem value="python" label="Python">

```python
from fairway import WebApp, Service, Datastore

app = WebApp("my-app")

api = Service("api")
api.route("GET", "/hello")
api.route("POST", "/items")

items = Datastore("items", partition_key="id")

app.add(api)
app.add(items)
```

</TabItem>
<TabItem value="javascript" label="JavaScript / TypeScript">

```typescript
import { WebApp, Service, Datastore } from '@pinhigh/fairway-sdk';

const app = new WebApp('my-app');

const api = new Service('api');
api.route('GET', '/hello');
api.route('POST', '/items');

const items = new Datastore('items', { partitionKey: 'id' });

app.add(api);
app.add(items);
```

</TabItem>
</Tabs>

That's your entire infrastructure definition. No YAML, no templates, no console clicks. Fairway infers what you need from your code.

## 3. Deploy

<Tabs>
<TabItem value="python" label="Python">

```python
from fairway import FairwayClient, TokenAuth

client = FairwayClient("https://api.fairway.dev", auth=TokenAuth("your-token"))
app.deploy(client=client)
```

</TabItem>
<TabItem value="javascript" label="JavaScript / TypeScript">

```typescript
import { FairwayClient, TokenAuth } from '@pinhigh/fairway-sdk';

const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new TokenAuth('your-token'),
});

await app.deploy(client);
```

</TabItem>
</Tabs>

Fairway provisions the API service and datastore, wires them together, and gives you a live endpoint.

## What just happened?

1. **You defined resources** — a `Service` with routes and a `Datastore` with a partition key.
2. **The SDK built a manifest** — describing the infrastructure your app needs.
3. **Fairway provisioned everything** — compute, API gateway, data table, scaling, and monitoring.

No Dockerfiles. No Terraform. No CloudFormation. Your code *is* the infrastructure definition.

## Next steps

- **[Python SDK →](/docs/sdk/python)** — Full reference: all resource classes, client methods, auth providers, and error handling.
- **[JavaScript SDK →](/docs/sdk/javascript)** — Full reference with TypeScript types.
- **[Infrastructure from Code →](/docs/concepts/infrastructure-from-code)** — Understand the model behind the magic.
- **[Apps →](/docs/concepts/apps)** — Learn how Fairway apps are structured and managed.
