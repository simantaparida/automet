# Automet - Field Job & Asset Tracker

A mobile-first Progressive Web App (PWA) for Indian AMC vendors to manage field jobs, track assets, and streamline operations.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd Automet

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Follow setup guides in docs/ to configure:
# - Supabase (dev + test projects)
# - Google OAuth
# - Razorpay

# Run migrations and seeds
./scripts/migrate.sh
./scripts/seed.sh

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete environment setup
- **[Supabase Setup](docs/SUPABASE_SETUP.md)** - Database and auth configuration
- **[Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)** - OAuth provider configuration
- **[Razorpay Setup](docs/RAZORPAY_SETUP.md)** - Payment gateway setup
- **[Migrations Guide](docs/MIGRATIONS.md)** - Database migrations and rollback
- **[API Documentation](docs/API.md)** - API endpoint reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design overview

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth + Email)
- **Payments**: Razorpay
- **Storage**: Supabase Storage
- **Hosting**: Vercel
- **Testing**: Jest, Playwright
- **PWA**: next-pwa, Service Workers

## 🗂️ Project Structure

```
/Automet
├── docs/              # Documentation
├── migrations/        # Database migrations (timestamped SQL)
├── seeds/             # Demo data scripts
├── scripts/           # Dev/deployment scripts
├── src/
│   ├── lib/          # Supabase clients, utilities, validations
│   └── types/        # TypeScript type definitions
├── pages/
│   └── api/          # API routes
├── tests/            # Jest and Playwright tests
└── public/           # Static assets, PWA manifest
```

## 🧪 Testing

```bash
# Run unit and integration tests
npm test

# Run tests in CI mode with coverage
npm run test:ci

# Run E2E tests
npm run test:e2e
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Service role key never exposed to client
- Email verification required for critical actions
- Webhook signature verification (Razorpay)
- Signed upload URLs for storage (10-min TTL)
- Environment variables managed via Vercel/GitHub Secrets

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
npm run migrate      # Run database migrations
npm run seed         # Run seed scripts
npm run reset-db     # Reset database (destructive)
```

## 🌍 Environment Variables

See [.env.example](.env.example) for required environment variables.

**Never commit `.env.local` to git!**

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and add tests
3. Run linting and tests: `npm run lint && npm test`
4. Commit with conventional commits: `feat: add new feature`
5. Push and create a Pull Request

## 📄 License

Proprietary - All rights reserved

## 🙋 Support

For issues and questions, contact the development team or open an issue in the repository.

---

**Built with ❤️ for Indian AMC vendors**
