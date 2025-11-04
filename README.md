<div align="center">

# Automet

**Field Service Management Platform for Indian AMC Vendors**

A mobile-first Progressive Web App (PWA) to manage field jobs, track assets, and streamline operations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

## ✨ Features

- **Job Management**: Create, assign, and track field jobs with real-time updates
- **Asset Tracking**: Maintain inventory of client equipment with maintenance history
- **Technician Check-in/out**: GPS-based location tracking and time logging
- **Offline Support**: PWA capabilities for reliable offline operation
- **ROI Calculator**: Interactive calculator showing cost savings vs manual operations
- **Multi-tenant**: Organization-level data isolation with Row Level Security
- **Mobile-first**: Responsive design optimized for field technicians
- **Blog System**: Built-in content management for announcements and guides

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/simantaparida/automet.git
cd automet

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations and seed demo data
chmod +x scripts/*.sh
./scripts/migrate.sh
./scripts/seed.sh

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Demo Account

After running seeds, login with:
- **Email**: `owner@sharmaservices.com`
- **Password**: `sharma123`

This demo account includes sample data: clients, sites, assets, and jobs.

## 📚 Documentation

### For Developers
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Comprehensive project overview and development guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and workflow
- **[GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md)** - GitHub repository configuration

### Setup Guides (in `/docs`)
- **[01_setup_guide.md](docs/01_setup_guide.md)** - Complete environment setup
- **[02_supabase_setup.md](docs/02_supabase_setup.md)** - Database and auth configuration
- **[03_google_oauth_setup.md](docs/03_google_oauth_setup.md)** - OAuth provider configuration
- **[04_razorpay_setup.md](docs/04_razorpay_setup.md)** - Payment gateway setup
- **[05_migrations_guide.md](docs/05_migrations_guide.md)** - Database migrations and rollback
- **[06_api_endpoints.md](docs/06_api_endpoints.md)** - API endpoint reference
- **[07_architecture.md](docs/07_architecture.md)** - System design overview

## 🛠️ Tech Stack

- **Framework**: [Next.js 14.2](https://nextjs.org/) (Pages Router)
- **Language**: [TypeScript 5.1](https://www.typescriptlang.org/) (strict mode)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (Email/Password + OAuth ready)
- **Styling**: [Tailwind CSS 3.x](https://tailwindcss.com/)
- **PWA**: [next-pwa](https://github.com/shadowwalker/next-pwa)
- **Payments**: [Razorpay](https://razorpay.com/) (for Indian market)
- **Testing**: Jest (unit tests), Playwright (E2E)
- **Deployment**: Vercel (planned)

## 🗂️ Project Structure

```
automet/
├── .claude/                  # Claude Code configuration
├── components/               # React components
│   └── landing/             # Landing page sections
├── docs/                    # Setup and architecture guides
├── migrations/              # Database migrations (001-011)
├── pages/                   # Next.js pages (Pages Router)
│   ├── api/                # API routes
│   ├── auth/               # Auth pages (login, signup)
│   ├── blog/               # Blog system
│   └── [entities]/         # CRUD pages (clients, sites, assets, jobs)
├── scripts/                 # Development scripts (migrate, seed, etc.)
├── seeds/                   # Demo data SQL scripts
├── src/
│   ├── components/         # Shared UI components
│   ├── contexts/           # React contexts (Auth, etc.)
│   └── lib/                # Business logic and utilities
├── styles/                  # Global styles + Tailwind
├── tests/                   # Jest tests
├── CONTRIBUTING.md          # Contribution guidelines
├── GITHUB_SETUP_GUIDE.md   # GitHub configuration guide
├── LICENSE                  # MIT License
├── PROJECT_CONTEXT.md       # Comprehensive project documentation
└── README.md               # This file
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

### Database Security
- **Row Level Security (RLS)**: Multi-tenant data isolation at database level
- **Service Role Key**: Never exposed to client, only used in API routes
- **Organization Isolation**: Users can only access their organization's data

### Application Security
- **Email Verification**: Required for critical actions
- **Webhook Verification**: Razorpay webhook signature validation
- **Signed URLs**: Time-limited (10 min TTL) for file uploads
- **Environment Variables**: Secrets managed via `.env.local` (gitignored)

### Open Source Security
This repository is public, but:
- All API keys and credentials are in `.env.local` (not committed)
- Customer data is protected by RLS policies
- Code visibility helps identify security issues early
- Similar approach to successful open-source SaaS (Supabase, GitLab, Cal.com)

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

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Contribution Guide

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make changes** and add tests
4. **Run checks**: `npm run lint && npm test`
5. **Commit** with conventional commits: `feat: add new feature`
6. **Push** to your fork and create a **Pull Request**

### Development Workflow

- Branch: `main` (production) ← `develop` (staging) ← `feature/*` (development)
- All PRs require 1 approval before merging
- Squash merge for clean history
- Branches auto-delete after merge

See [GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md) for GitHub configuration details.

---

## 📄 License

[MIT License](LICENSE) - Open source and free to use.

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/simantaparida/automet/issues)
- **Questions**: Open a discussion or contact via GitHub

---

## 🌟 Roadmap

### Current (Module 3) - Landing Page & Pre-order
- ✅ Landing page with all sections
- ✅ ROI calculator with plan-driven sliders
- ✅ Blog system
- ✅ Authentication system
- ⏳ Pre-order payment integration (Razorpay)

### Next (Module 4) - Dashboard & Job Management
- Dashboard with real-time updates
- Job creation and assignment
- Technician mobile interface
- Photo capture and upload

### Future Modules
- **Module 5**: Mobile PWA (offline sync, GPS check-in)
- **Module 6**: Inventory management
- **Module 7**: Reporting and analytics
- **Module 8**: Billing and invoicing

See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for detailed roadmap.

---

<div align="center">

**Built with ❤️ for Indian AMC vendors**

[⬆ Back to Top](#automet)

</div>
