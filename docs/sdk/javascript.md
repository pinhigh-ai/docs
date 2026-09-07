---
sidebar_position: 2
title: JavaScript SDK
---

# JavaScript SDK

The official JavaScript/TypeScript client for the Fairway platform. Works in Node.js 18+, Deno, and edge runtimes. Full TypeScript support with complete type definitions.

## Installation

```bash
npm install @pinhigh/fairway-sdk
```

Or with other package managers:

```bash
yarn add @pinhigh/fairway-sdk
pnpm add @pinhigh/fairway-sdk
```

## Quick start

```typescript
import { WebApp, Service, Datastore, FairwayClient, TokenAuth } from '@pinhigh/fairway-sdk';

// 1. Define your app
const app = new WebApp('my-app');

const api = new Service('api');
api.route('GET', '/hello');
api.route('POST', '/items');

const items = new Datastore('items', { partitionKey: 'id' });

app.add(api);
app.add(items);

// 2. Connect to Fairway
const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new TokenAuth('your-token'),
});

// 3. Deploy
await app.deploy(client);
```

Fairway inspects your resource definitions, infers the infrastructure, and provisions everything automatically.

## Resource classes

### WebApp

The top-level container for your application.

```typescript
import { WebApp } from '@pinhigh/fairway-sdk';

const app = new WebApp('my-app');
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Unique application name (lowercase, hyphens allowed) |

**Methods**

| Method | Returns | Description |
|--------|---------|-------------|
| `app.add(resource)` | `void` | Add a Service or Datastore to the app |
| `app.deploy(client)` | `Promise<DeployResult>` | Deploy the app to Fairway |
| `app.manifest()` | `Manifest` | Return the inferred infrastructure manifest |
| `app.validate()` | `void` | Validate configuration locally (throws on problems) |

```typescript
const app = new WebApp('my-app');
app.add(apiService);
app.add(dataStore);

// Inspect what will be provisioned
const manifest = app.manifest();
console.log(JSON.stringify(manifest, null, 2));

// Validate before deploying
app.validate(); // throws ValidationError on problems
await app.deploy(client);
```

### Service

An API service with HTTP routes. Fairway provisions compute and API gateway automatically.

```typescript
import { Service } from '@pinhigh/fairway-sdk';

const api = new Service('api');
api.route('GET', '/hello');
api.route('POST', '/items');
api.route('GET', '/items/:id');
api.route('PUT', '/items/:id');
api.route('DELETE', '/items/:id');
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Service name (unique within the app) |

**Methods**

| Method | Returns | Description |
|--------|---------|-------------|
| `service.route(method, path)` | `void` | Register an HTTP route |
| `service.routes()` | `Route[]` | List all registered routes |

Route paths support path parameters with `:param` syntax.

### Datastore

A managed data table with automatic scaling and backup.

```typescript
import { Datastore } from '@pinhigh/fairway-sdk';

const items = new Datastore('items', { partitionKey: 'id' });
const users = new Datastore('users', { partitionKey: 'email', sortKey: 'createdAt' });
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Datastore name (unique within the app) |
| `options.partitionKey` | `string` | Primary key field name |
| `options.sortKey` | `string` *(optional)* | Sort key field name for composite keys |

**Methods**

| Method | Returns | Description |
|--------|---------|-------------|
| `datastore.addIndex(name, options)` | `void` | Add a secondary index |

```typescript
const orders = new Datastore('orders', {
  partitionKey: 'customerId',
  sortKey: 'orderDate',
});
orders.addIndex('by-status', { partitionKey: 'status', sortKey: 'orderDate' });
```

## FairwayClient

The client handles all communication with the Fairway control plane.

```typescript
import { FairwayClient, TokenAuth } from '@pinhigh/fairway-sdk';

const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new TokenAuth('your-token'),
});
```

**Constructor options**

| Option | Type | Description |
|--------|------|-------------|
| `baseUrl` | `string` | Fairway API base URL |
| `auth` | `AuthProvider` | Authentication provider |

### App management

```typescript
// Create an app
await client.createApp({ name: 'my-app' });

// List all apps
const apps = await client.listApps();
for (const app of apps) {
  console.log(app.name, app.status);
}

// Get app details
const app = await client.getApp('my-app');

// Delete an app
await client.deleteApp('my-app');
```

### Deployments

```typescript
// Deploy (typically called via app.deploy(), but available directly)
await client.deploy('my-app', manifest);

// Preview what will change before deploying
const plan = await client.plan('my-app', manifest);
console.log(plan.changes);

// List deployment history
const deploys = await client.listDeploys('my-app');
for (const d of deploys) {
  console.log(d.id, d.status, d.createdAt);
}

// Get deployment details
const deploy = await client.getDeploy('my-app', 'dep_abc123');

// Rollback to a previous deployment
await client.rollback('my-app', 'dep_abc123');
```

### Logs

```typescript
// Get application logs
const logs = await client.getLogs('my-app');
for (const entry of logs) {
  console.log(entry.timestamp, entry.message);
}
```

### Token management

```typescript
// Create a new API token
const token = await client.createToken({ name: 'ci-deploy' });
console.log(token.token); // only shown once

// List tokens
const tokens = await client.listTokens();
for (const t of tokens) {
  console.log(t.name, t.createdAt);
}

// Revoke a token
await client.revokeToken('tok_abc123');
```

## Authentication

### TokenAuth

Pass a token string directly. Good for scripts, CI/CD, and quick prototyping.

```typescript
import { TokenAuth } from '@pinhigh/fairway-sdk';

const auth = new TokenAuth('fwy_your_api_token_here');
const client = new FairwayClient({ baseUrl: 'https://api.fairway.dev', auth });
```

### EnvAuth

Read the token from an environment variable. Defaults to `FAIRWAY_TOKEN`.

```typescript
import { EnvAuth } from '@pinhigh/fairway-sdk';

// Uses FAIRWAY_TOKEN by default
const auth = new EnvAuth();

// Or specify a custom variable
const auth = new EnvAuth('MY_FAIRWAY_TOKEN');

const client = new FairwayClient({ baseUrl: 'https://api.fairway.dev', auth });
```

### Custom auth providers

Implement the `AuthProvider` interface:

```typescript
import { AuthProvider, FairwayClient } from '@pinhigh/fairway-sdk';

class VaultAuth implements AuthProvider {
  constructor(private vaultPath: string) {}

  async getToken(): Promise<string> {
    // Fetch token from your vault
    return await vaultClient.read(this.vaultPath);
  }
}

const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new VaultAuth('secret/fairway'),
});
```

## Error handling

The SDK throws typed errors for different failure modes:

```typescript
import { FairwayClient, TokenAuth } from '@pinhigh/fairway-sdk';
import { FairwayError, ValidationError, APIError } from '@pinhigh/fairway-sdk/errors';

const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new TokenAuth('your-token'),
});

try {
  await app.deploy(client);
} catch (err) {
  if (err instanceof ValidationError) {
    // Local validation failed before any API call
    console.error('Invalid configuration:', err.message);
    for (const issue of err.issues) {
      console.error(`  - ${issue}`);
    }
  } else if (err instanceof APIError) {
    // The Fairway API returned an error
    console.error(`API error ${err.statusCode}: ${err.message}`);
  } else if (err instanceof FairwayError) {
    // Base class for all SDK errors
    console.error('Fairway error:', err.message);
  }
}
```

**Error hierarchy**

| Error class | When |
|-------------|------|
| `FairwayError` | Base class for all SDK errors |
| `ValidationError` | App configuration is invalid (caught before API call) |
| `APIError` | Fairway API returned an HTTP error (4xx/5xx) |

`APIError` includes `statusCode`, `message`, and `details` properties.

## TypeScript types reference

The SDK exports all types used across the API:

```typescript
import type {
  // Resources
  WebApp,
  Service,
  Datastore,
  Route,

  // Client
  FairwayClient,
  FairwayClientOptions,

  // Auth
  AuthProvider,
  TokenAuth,
  EnvAuth,

  // Responses
  App,
  DeployResult,
  DeployPlan,
  DeployInfo,
  LogEntry,
  TokenInfo,

  // Manifest
  Manifest,
  ResourceDefinition,

  // Datastore options
  DatastoreOptions,
  IndexOptions,
} from '@pinhigh/fairway-sdk';
```

### Key interfaces

```typescript
interface App {
  name: string;
  status: 'active' | 'deploying' | 'failed' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

interface DeployResult {
  id: string;
  appName: string;
  status: 'success' | 'failed' | 'rolling_back';
  resources: ResourceDefinition[];
  createdAt: string;
}

interface DeployPlan {
  create: ResourceDefinition[];
  update: ResourceDefinition[];
  delete: ResourceDefinition[];
  changes: string[];
}

interface Manifest {
  app: string;
  resources: ResourceDefinition[];
}

interface ResourceDefinition {
  type: 'service' | 'datastore';
  name: string;
  config: Record<string, unknown>;
}

interface DatastoreOptions {
  partitionKey: string;
  sortKey?: string;
}

interface IndexOptions {
  partitionKey: string;
  sortKey?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  service?: string;
}

interface TokenInfo {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface AuthProvider {
  getToken(): string | Promise<string>;
}
```

## Full example

```typescript
import {
  WebApp, Service, Datastore, FairwayClient, EnvAuth,
} from '@pinhigh/fairway-sdk';
import { ValidationError, APIError } from '@pinhigh/fairway-sdk/errors';

// Define the app
const app = new WebApp('todo-api');

const api = new Service('api');
api.route('GET', '/todos');
api.route('POST', '/todos');
api.route('GET', '/todos/:id');
api.route('PUT', '/todos/:id');
api.route('DELETE', '/todos/:id');

const todos = new Datastore('todos', { partitionKey: 'id' });

app.add(api);
app.add(todos);

// Connect and deploy
const client = new FairwayClient({
  baseUrl: 'https://api.fairway.dev',
  auth: new EnvAuth(),
});

try {
  app.validate();
  const plan = await client.plan('todo-api', app.manifest());
  console.log(`Plan: +${plan.create.length} ~${plan.update.length} -${plan.delete.length}`);
  await app.deploy(client);
  console.log('Deployed successfully!');
} catch (err) {
  if (err instanceof ValidationError) {
    console.error('Validation failed:', err.message);
  } else if (err instanceof APIError) {
    console.error(`Deploy failed: ${err.statusCode} — ${err.message}`);
  }
}
```
