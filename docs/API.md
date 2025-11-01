# API Documentation

API endpoint reference for Automet.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://automet.app/api`

---

## Authentication

All API routes (except webhooks and health) require authentication.

### Headers

```http
Authorization: Bearer <supabase_access_token>
```

Get the access token from Supabase Auth:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

---

## Health Check

### `GET /api/health`

Check API and database connectivity.

**Authentication:** None required

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

**Status Codes:**
- `200` - Service healthy
- `503` - Service unavailable

---

## Jobs API

### `GET /api/v1/jobs`

List jobs for authenticated user's organization.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `scheduled`, `in_progress`, `completed`, `cancelled` |
| `assignee_id` | uuid | Filter by assigned user |
| `client_id` | uuid | Filter by client |
| `limit` | integer | Max results (default: 50, max: 100) |
| `offset` | integer | Pagination offset |

**Example Request:**
```http
GET /api/v1/jobs?status=in_progress&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Fire extinguisher annual maintenance",
      "description": "Check pressure, seals, and refill if needed",
      "status": "in_progress",
      "priority": "high",
      "scheduled_at": "2025-11-05T09:00:00.000Z",
      "client": {
        "id": "...",
        "name": "ABC Manufacturing Ltd"
      },
      "site": {
        "id": "...",
        "name": "Factory Building A",
        "address": "123 Industrial Area, Mumbai"
      },
      "assignee": {
        "id": "...",
        "email": "tech1@automet.dev",
        "role": "technician"
      },
      "created_at": "2025-10-30T14:20:00.000Z"
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (not in org)
- `500` - Server error

---

### `POST /api/v1/jobs`

Create a new job.

**Authentication:** Required (role: `owner` or `coordinator`)

**Request Body:**
```json
{
  "client_id": "uuid",
  "site_id": "uuid",
  "asset_id": "uuid (optional)",
  "title": "string (required)",
  "description": "string (optional)",
  "status": "scheduled|in_progress",
  "priority": "low|medium|high|urgent",
  "scheduled_at": "ISO 8601 date (optional)",
  "assignee_id": "uuid (optional)"
}
```

**Validation:**
- `title`: 1-200 characters
- `description`: max 2000 characters
- Email must be verified
- Subscription usage limits enforced (free plan: 50 jobs/month)

**Example Request:**
```http
POST /api/v1/jobs
Content-Type: application/json
Authorization: Bearer <token>

{
  "client_id": "...",
  "site_id": "...",
  "title": "Quarterly HVAC servicing",
  "priority": "medium",
  "scheduled_at": "2025-11-10T10:00:00.000Z",
  "assignee_id": "..."
}
```

**Response:**
```json
{
  "job": {
    "id": "...",
    "title": "Quarterly HVAC servicing",
    "status": "scheduled",
    "created_at": "2025-11-01T10:45:00.000Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Email not verified or usage limit exceeded
- `500` - Server error

---

### `PATCH /api/v1/jobs/:id`

Update a job (status, assignee, etc.).

**Authentication:** Required

**Permissions:**
- `owner`, `coordinator`: Can update any field
- `technician`: Can only update assigned jobs (status, notes)

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Started work at 10:30 AM"
}
```

**Response:**
```json
{
  "job": { /* updated job object */ }
}
```

---

## Inventory API

### `GET /api/v1/inventory`

List inventory items for org.

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `low_stock` | boolean | Filter items below reorder level |
| `serialized` | boolean | Filter serialized items |

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "name": "Fire Extinguisher Refill (CO2)",
      "sku": "FE-CO2-5KG",
      "quantity": 25,
      "unit": "piece",
      "reorder_level": 10,
      "is_serialized": false
    }
  ]
}
```

---

### `POST /api/v1/inventory/issue`

Issue inventory to a technician or site.

**Authentication:** Required (role: `owner` or `coordinator`)

**Request Body:**
```json
{
  "item_id": "uuid",
  "issued_to_user": "uuid (optional)",
  "issued_to_site": "uuid (optional)",
  "quantity": 5,
  "notes": "For job #1234"
}
```

**Validation:**
- Must specify either `issued_to_user` or `issued_to_site`
- Quantity must be available in stock
- Creates audit log entry

**Response:**
```json
{
  "issuance": {
    "id": "...",
    "item_id": "...",
    "quantity": 5,
    "issued_at": "2025-11-01T11:00:00.000Z"
  },
  "remaining_stock": 20
}
```

**Status Codes:**
- `201` - Issued successfully
- `400` - Insufficient stock
- `403` - Permission denied

---

## Seed API

### `POST /api/seed/run`

Run seed scripts to populate database with demo data.

**Authentication:** Service role key required

**Headers:**
```http
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

**Response:**
```json
{
  "message": "Seeds completed successfully",
  "summary": {
    "organizations": 1,
    "users": 4,
    "clients": 3,
    "sites": 8,
    "assets": 15,
    "jobs": 20,
    "inventory_items": 10
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid service key)
- `500` - Seed script failed

---

## Webhooks

### `POST /api/webhooks/razorpay`

Razorpay webhook handler.

**Authentication:** Signature verification (not token-based)

**Headers:**
```http
Content-Type: application/json
X-Razorpay-Signature: <hmac_sha256_signature>
```

**Supported Events:**
- `payment.captured`
- `payment.failed`
- `subscription.activated`
- `subscription.cancelled`
- `subscription.charged`

**Example Payload (payment.captured):**
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxxxx",
        "amount": 99900,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_xxxxx",
        "created_at": 1698825600
      }
    }
  }
}
```

**Response:**
```json
{
  "status": "processed"
}
```

**Status Codes:**
- `200` - Webhook processed
- `400` - Invalid signature
- `500` - Processing error

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email verification required",
    "details": {
      "field": "email_confirmed",
      "value": false
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `USAGE_LIMIT_EXCEEDED` | 403 | Subscription limit reached |
| `EMAIL_NOT_VERIFIED` | 403 | Email verification required |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

**Current limits (subject to change):**
- Free plan: 100 requests/minute
- Pro plan: 1000 requests/minute

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698826200
```

**429 Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 60 seconds."
  }
}
```

---

## Pagination

List endpoints support cursor-based pagination:

**Request:**
```http
GET /api/v1/jobs?limit=20&offset=40
```

**Response includes:**
```json
{
  "jobs": [ /* ... */ ],
  "total": 150,
  "limit": 20,
  "offset": 40,
  "has_more": true
}
```

---

## Future Endpoints (V2)

- `POST /api/v1/jobs/:id/media` - Upload job photos/videos
- `GET /api/v1/reports/monthly` - Generate usage reports
- `POST /api/v1/clients` - CRUD for clients
- `POST /api/v1/sites` - CRUD for sites
- `GET /api/v1/billing/invoices` - List invoices
- `POST /api/v1/inventory/return` - Return issued items

---

## SDK Example (TypeScript)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Authenticate
await supabase.auth.signInWithPassword({
  email: 'admin@automet.dev',
  password: 'password',
});

// Fetch jobs
const { data: jobs, error } = await supabase
  .from('jobs')
  .select('*, client:clients(*), site:sites(*)')
  .eq('status', 'in_progress')
  .limit(10);

// Create job
const { data: newJob, error } = await supabase
  .from('jobs')
  .insert({
    title: 'HVAC Maintenance',
    client_id: '...',
    site_id: '...',
    status: 'scheduled',
  })
  .select()
  .single();
```

---

For more details, see the [Architecture Documentation](./ARCHITECTURE.md).
