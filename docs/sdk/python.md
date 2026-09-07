---
sidebar_position: 1
title: Python SDK
---

# Python SDK

The official Python client for the Fairway platform. Define your infrastructure in Python, deploy with a single call, and manage the full app lifecycle programmatically.

## Installation

```bash
pip install fairway-sdk
```

Requires Python 3.9+. The package has minimal dependencies and installs in seconds.

## Quick start

```python
from fairway import WebApp, Service, Datastore, FairwayClient, TokenAuth

# 1. Define your app
app = WebApp("my-app")

api = Service("api")
api.route("GET", "/hello")
api.route("POST", "/items")

items = Datastore("items", partition_key="id")

app.add(api)
app.add(items)

# 2. Connect to Fairway
client = FairwayClient("https://api.fairway.dev", auth=TokenAuth("your-token"))

# 3. Deploy
app.deploy(client=client)
```

That's it — Fairway inspects your code, infers the infrastructure, and provisions everything.

## Resource classes

### WebApp

The top-level container for your application. Every Fairway deployment starts with a `WebApp`.

```python
from fairway import WebApp

app = WebApp("my-app")
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `str` | Unique application name (lowercase, hyphens allowed) |

**Methods**

| Method | Description |
|--------|-------------|
| `app.add(resource)` | Add a Service or Datastore to the app |
| `app.deploy(client=client)` | Deploy the app to Fairway |
| `app.manifest()` | Return the inferred infrastructure manifest as a dict |
| `app.validate()` | Validate the app configuration locally before deploy |

```python
app = WebApp("my-app")
app.add(api_service)
app.add(data_store)

# Inspect what will be provisioned
manifest = app.manifest()
print(manifest)

# Validate before deploying
app.validate()  # raises ValidationError on problems
app.deploy(client=client)
```

### Service

An API service with HTTP routes. Fairway provisions the compute and API gateway automatically.

```python
from fairway import Service

api = Service("api")
api.route("GET", "/hello")
api.route("POST", "/items")
api.route("GET", "/items/{id}")
api.route("PUT", "/items/{id}")
api.route("DELETE", "/items/{id}")
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `str` | Service name (unique within the app) |

**Methods**

| Method | Description |
|--------|-------------|
| `service.route(method, path)` | Register an HTTP route |
| `service.routes()` | List all registered routes |

Route paths support path parameters with `{param}` syntax. Fairway generates the API gateway configuration from your route definitions.

### Datastore

A managed data table with automatic scaling and backup.

```python
from fairway import Datastore

items = Datastore("items", partition_key="id")
users = Datastore("users", partition_key="email", sort_key="created_at")
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `str` | Datastore name (unique within the app) |
| `partition_key` | `str` | Primary key field name |
| `sort_key` | `str` *(optional)* | Sort key field name for composite keys |

**Methods**

| Method | Description |
|--------|-------------|
| `datastore.add_index(name, partition_key, sort_key=None)` | Add a secondary index |

```python
orders = Datastore("orders", partition_key="customer_id", sort_key="order_date")
orders.add_index("by-status", partition_key="status", sort_key="order_date")
```

## FairwayClient

The client handles all communication with the Fairway control plane.

```python
from fairway import FairwayClient, TokenAuth

client = FairwayClient("https://api.fairway.dev", auth=TokenAuth("your-token"))
```

**Constructor**

| Parameter | Type | Description |
|-----------|------|-------------|
| `base_url` | `str` | Fairway API base URL |
| `auth` | `AuthProvider` | Authentication provider |

### App management

```python
# Create an app
client.createApp(name="my-app")

# List all apps
apps = client.listApps()
for app in apps:
    print(app["name"], app["status"])

# Get app details
app = client.getApp("my-app")

# Delete an app
client.deleteApp("my-app")
```

### Deployments

```python
# Deploy (typically called via app.deploy(), but available directly)
client.deploy(app_name="my-app", manifest=manifest)

# Preview what will change before deploying
plan = client.plan(app_name="my-app", manifest=manifest)
print(plan["changes"])

# List deployment history
deploys = client.listDeploys("my-app")
for d in deploys:
    print(d["id"], d["status"], d["created_at"])

# Get deployment details
deploy = client.getDeploy("my-app", deploy_id="dep_abc123")

# Rollback to a previous deployment
client.rollback("my-app", deploy_id="dep_abc123")
```

### Logs

```python
# Get application logs
logs = client.getLogs("my-app")
for entry in logs:
    print(entry["timestamp"], entry["message"])
```

### Token management

```python
# Create a new API token
token = client.createToken(name="ci-deploy")
print(token["token"])  # only shown once

# List tokens
tokens = client.listTokens()
for t in tokens:
    print(t["name"], t["created_at"])

# Revoke a token
client.revokeToken(token_id="tok_abc123")
```

## Authentication

### TokenAuth

Pass a token string directly. Good for scripts, CI/CD, and quick prototyping.

```python
from fairway import TokenAuth

auth = TokenAuth("fwy_your_api_token_here")
client = FairwayClient("https://api.fairway.dev", auth=auth)
```

### EnvAuth

Read the token from an environment variable. Defaults to `FAIRWAY_TOKEN` if no variable name is specified.

```python
from fairway import EnvAuth

# Uses FAIRWAY_TOKEN by default
auth = EnvAuth()

# Or specify a custom variable
auth = EnvAuth("MY_FAIRWAY_TOKEN")

client = FairwayClient("https://api.fairway.dev", auth=auth)
```

### Custom auth providers

Implement the `AuthProvider` protocol to build your own authentication:

```python
from fairway import AuthProvider

class VaultAuth(AuthProvider):
    def __init__(self, vault_path: str):
        self.vault_path = vault_path

    def get_token(self) -> str:
        # Fetch token from your vault
        return vault_client.read(self.vault_path)

client = FairwayClient("https://api.fairway.dev", auth=VaultAuth("secret/fairway"))
```

## Error handling

The SDK raises typed exceptions for different failure modes:

```python
from fairway import FairwayClient, TokenAuth
from fairway.errors import FairwayError, ValidationError, APIError

client = FairwayClient("https://api.fairway.dev", auth=TokenAuth("your-token"))

try:
    app.deploy(client=client)
except ValidationError as e:
    # Local validation failed before any API call
    print(f"Invalid configuration: {e.message}")
    for issue in e.issues:
        print(f"  - {issue}")
except APIError as e:
    # The Fairway API returned an error
    print(f"API error {e.status_code}: {e.message}")
except FairwayError as e:
    # Base class for all SDK errors
    print(f"Fairway error: {e}")
```

**Exception hierarchy**

| Exception | When |
|-----------|------|
| `FairwayError` | Base class for all SDK errors |
| `ValidationError` | App configuration is invalid (caught before API call) |
| `APIError` | Fairway API returned an HTTP error (4xx/5xx) |

`APIError` includes `status_code`, `message`, and `details` attributes for programmatic handling.

## Advanced usage

### Manifest inspection

Before deploying, inspect exactly what infrastructure Fairway will provision:

```python
app = WebApp("my-app")
app.add(Service("api"))
app.add(Datastore("items", partition_key="id"))

manifest = app.manifest()
print(manifest)
# {
#   "app": "my-app",
#   "resources": [
#     {"type": "service", "name": "api", "routes": [...]},
#     {"type": "datastore", "name": "items", "partition_key": "id"}
#   ]
# }
```

### Planning before deploy

Use `client.plan()` to preview changes without applying them — like a dry run:

```python
plan = client.plan(app_name="my-app", manifest=app.manifest())

print(f"Resources to create: {len(plan['create'])}")
print(f"Resources to update: {len(plan['update'])}")
print(f"Resources to delete: {len(plan['delete'])}")

# Review, then deploy
if input("Proceed? (y/n) ") == "y":
    app.deploy(client=client)
```

### Full example

```python
from fairway import WebApp, Service, Datastore, FairwayClient, EnvAuth
from fairway.errors import ValidationError, APIError

# Define the app
app = WebApp("todo-api")

api = Service("api")
api.route("GET", "/todos")
api.route("POST", "/todos")
api.route("GET", "/todos/{id}")
api.route("PUT", "/todos/{id}")
api.route("DELETE", "/todos/{id}")

todos = Datastore("todos", partition_key="id")

app.add(api)
app.add(todos)

# Connect and deploy
client = FairwayClient("https://api.fairway.dev", auth=EnvAuth())

try:
    app.validate()
    plan = client.plan(app_name="todo-api", manifest=app.manifest())
    print(f"Plan: +{len(plan['create'])} ~{len(plan['update'])} -{len(plan['delete'])}")
    app.deploy(client=client)
    print("Deployed successfully!")
except ValidationError as e:
    print(f"Validation failed: {e}")
except APIError as e:
    print(f"Deploy failed: {e.status_code} — {e.message}")
```
