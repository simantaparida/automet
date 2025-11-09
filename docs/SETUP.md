# Complete Setup Guide

This guide will walk you through setting up Automet locally for development.

## Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** 10.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase CLI** (optional, for local migrations)
  ```bash
  npm install -g supabase
  ```

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Automet
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Supabase client, Razorpay SDK, testing libraries, etc.

## Step 3: Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

You'll need to fill in the following variables. Follow the linked guides for each service:

### Required Variables

| Variable                    | Description                                  | Setup Guide                                   |
| --------------------------- | -------------------------------------------- | --------------------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL                    | [Supabase Setup](./SUPABASE_SETUP.md)         |
| `SUPABASE_ANON_KEY`         | Supabase anonymous/public key                | [Supabase Setup](./SUPABASE_SETUP.md)         |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only)      | [Supabase Setup](./SUPABASE_SETUP.md)         |
| `GOOGLE_CLIENT_ID`          | Google OAuth Client ID                       | [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) |
| `GOOGLE_CLIENT_SECRET`      | Google OAuth Client Secret                   | [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) |
| `RZ_KEY_ID`                 | Razorpay Key ID (test mode)                  | [Razorpay Setup](./RAZORPAY_SETUP.md)         |
| `RZ_KEY_SECRET`             | Razorpay Key Secret (test mode)              | [Razorpay Setup](./RAZORPAY_SETUP.md)         |
| `RZ_WEBHOOK_SECRET`         | Razorpay Webhook Secret                      | [Razorpay Setup](./RAZORPAY_SETUP.md)         |
| `NEXT_PUBLIC_APP_URL`       | Your app URL (http://localhost:3000 for dev) | N/A                                           |

### Optional Variables

| Variable       | Description                                         |
| -------------- | --------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string (for direct DB access) |
| `SENTRY_DSN`   | Sentry error tracking DSN                           |

## Step 4: Set Up External Services

Follow these guides in order:

1. **[Supabase Setup](./SUPABASE_SETUP.md)** - Create dev and test projects
2. **[Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)** - Configure OAuth provider
3. **[Razorpay Setup](./RAZORPAY_SETUP.md)** - Set up payment gateway

Each guide will provide you with the necessary API keys and configuration values.

## Step 5: Run Database Migrations

Once Supabase is configured, run the migrations to set up your database schema:

```bash
./scripts/migrate.sh
```

This will:

- Create all necessary tables (organizations, users, jobs, inventory, etc.)
- Set up triggers and functions
- Apply Row Level Security (RLS) policies

## Step 6: Seed Demo Data

Populate the database with sample data to explore features:

```bash
./scripts/seed.sh
```

This creates:

- Demo organization "Sharma Services"
- 4 users (1 owner, 1 coordinator, 2 technicians)
- 3 clients with 8 sites and 15 assets
- 20 jobs in various states
- 10 inventory items
- Subscription plan assignments

**Demo Credentials:**

- Email: `admin@automet.dev`
- Password: Set during first-time Supabase Auth setup

## Step 7: Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 8: Verify Setup

Check that everything is working:

1. **Health Check API:**

   ```bash
   curl http://localhost:3000/api/health
   ```

   Should return: `{"status": "ok", "database": "connected"}`

2. **Run Tests:**

   ```bash
   npm test
   ```

   All tests should pass.

3. **Open the App:**
   - Visit http://localhost:3000
   - Try signing in with Google OAuth
   - Explore demo jobs and inventory

## Troubleshooting

### "Cannot connect to database"

- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is active (not paused)
- Ensure you're not hitting rate limits on free tier

### "Invalid API key"

- Double-check all environment variables in `.env.local`
- Ensure no extra spaces or quotes around values
- Verify keys match the Supabase project (dev vs. test)

### "Migration failed"

- Check Supabase SQL Editor for existing tables (might need reset)
- Run `./scripts/reset-db.sh` to start fresh (DESTRUCTIVE)
- Check migration logs for specific SQL errors

### "Google OAuth not working"

- Verify redirect URIs match in Google Console
- Check that Google provider is enabled in Supabase Auth settings
- Clear browser cookies and try again

### "Razorpay webhook signature mismatch"

- Ensure `RZ_WEBHOOK_SECRET` matches the one in Razorpay dashboard
- For local testing, use ngrok to expose localhost
- Check webhook payload format matches expected schema

## Development Workflow

```bash
# Start dev server
npm run dev

# Run linting
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Check types
npm run typecheck

# Run tests in watch mode
npm test

# Run E2E tests
npm run test:e2e

# Format code
npm run prettier

# Create new migration
# (manually create file: migrations/YYYYMMDD_NNN_description.sql)

# Run new migration
./scripts/migrate.sh

# Rollback last migration
./scripts/rollback.sh
```

## Next Steps

- Read the [API Documentation](./API.md) to understand available endpoints
- Review the [Architecture Overview](./ARCHITECTURE.md) to understand system design
- Check the [Migrations Guide](./MIGRATIONS.md) for database schema management

## Getting Help

- Check existing documentation in `docs/`
- Review code comments and inline JSDoc
- Open an issue in the repository
- Contact the development team

---

**Happy coding! 🚀**
