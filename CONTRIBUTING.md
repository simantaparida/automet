# Contributing to Automet

Thank you for your interest in contributing to Automet! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

### Expected Behavior

- Be respectful and considerate
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **Supabase Account**: For database access (free tier is sufficient)

### Initial Setup

1. **Fork the repository**
   - Go to https://github.com/simantaparida/automet
   - Click "Fork" button in top right

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/automet.git
   cd automet
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/simantaparida/automet.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

6. **Run database migrations**
   ```bash
   chmod +x scripts/*.sh
   ./scripts/migrate.sh
   ./scripts/seed.sh  # Optional: Load demo data
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

Visit http://localhost:3000 to see the app running.

---

## Development Workflow

### Branch Strategy

We use **Git Flow** methodology:

- `main` - Production-ready code
- `develop` - Integration branch (default)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

1. **Sync with upstream**
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** (see [Pull Request Process](#pull-request-process))

---

## Coding Standards

### TypeScript

- **Strict mode enabled**: All code must be properly typed
- **No `any` types**: Use proper types or `unknown` if necessary
- **Interfaces over types**: Prefer `interface` for object shapes

### React Components

- **Functional components only**: No class components
- **Props interface**: Define props interface before component
- **Hooks**: Use React hooks (useState, useEffect, etc.)
- **No 'use client' directive**: We use Pages Router, not App Router

### File Naming

- **Components**: PascalCase (e.g., `ROICalculator.tsx`)
- **Utilities**: camelCase (e.g., `roiCalculator.ts`)
- **Pages**: lowercase/kebab-case (Next.js convention)

### Import Order

```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { supabase } from '@/lib/supabase';

// 3. Local components
import { Navigation } from '@/components/Navigation';

// 4. Types
import type { ROIInputs } from '@/lib/roiCalculator';

// 5. Styles (if any)
import styles from './Component.module.css';
```

### Path Aliases

Use `@/` prefix for imports:
```typescript
import { supabase } from '@/lib/supabase';  // ✅
import { supabase } from '../lib/supabase'; // ❌
```

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Trailing commas**: Required for multiline

Run the linter to check your code:
```bash
npm run lint
```

---

## Commit Guidelines

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <short description>

<optional body>

<optional footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config)
- `perf`: Performance improvements

### Examples

```bash
feat: add ROI calculator with plan-driven sliders
fix: resolve continuous reload issue in dev server
docs: update setup instructions in README
chore: update dependencies to latest versions
refactor: extract validation logic to separate file
```

### Scope (Optional)

```bash
feat(auth): add Google OAuth integration
fix(api): handle null values in job assignments
docs(readme): add contribution guidelines
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream develop**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature-name
   git rebase develop  # or merge develop into your branch
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Run linter**
   ```bash
   npm run lint
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

### Creating a Pull Request

1. **Push your branch** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**
   - Go to https://github.com/simantaparida/automet
   - Click "Pull requests" → "New pull request"
   - Select base: `develop` ← compare: `your-username:feature/your-feature-name`

3. **Fill out PR template**
   - **Title**: Clear, concise description (e.g., "Add ROI calculator component")
   - **Description**: What changed and why
   - **Screenshots**: For UI changes
   - **Testing**: How you tested the changes
   - **Related Issues**: Link to issues (e.g., "Closes #123")

4. **Request review**
   - PRs require 1 approval before merging
   - Address any feedback from reviewers
   - Resolve all conversations

### PR Requirements

- ✅ All tests pass
- ✅ Linter passes with no errors
- ✅ Build succeeds
- ✅ No merge conflicts with `develop`
- ✅ At least 1 approval
- ✅ All conversations resolved

### After Merge

- Your feature branch will be automatically deleted
- Sync your local repository:
  ```bash
  git checkout develop
  git pull upstream develop
  git branch -d feature/your-feature-name
  ```

---

## Reporting Bugs

### Before Reporting

1. **Search existing issues**: Check if bug is already reported
2. **Try latest version**: Update to latest `develop` branch
3. **Minimal reproduction**: Create minimal example that reproduces bug

### Bug Report Template

Open an issue with:

**Title**: Clear, descriptive title (e.g., "ROI calculator crashes with negative values")

**Description**:
- What happened?
- What did you expect to happen?
- Steps to reproduce
- Environment (OS, browser, Node version)
- Screenshots or error messages

**Example**:
```markdown
## Bug Description
ROI calculator crashes when entering negative values in the "Jobs per Month" field.

## Steps to Reproduce
1. Go to landing page
2. Scroll to ROI calculator
3. Select "Free Plan"
4. Enter "-5" in "Jobs per Month" field
5. See error in console

## Expected Behavior
Should validate input and show error message, not crash.

## Environment
- OS: macOS 13.4
- Browser: Chrome 120
- Node: 18.17.0

## Screenshots
[Attach screenshot of error]
```

---

## Suggesting Features

### Feature Request Template

Open an issue with:

**Title**: Clear feature description (e.g., "Add export to Excel functionality")

**Description**:
- **Problem**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches you considered
- **Priority**: How important is this? (Low/Medium/High)

**Example**:
```markdown
## Feature Request: Export Reports to Excel

### Problem
Users need to export job completion reports for offline analysis and sharing with clients who don't have system access.

### Proposed Solution
Add "Export to Excel" button on reports page that generates .xlsx file with:
- Job details (ID, title, client, site)
- Technician assignments
- Completion status and dates
- Notes and attachments

### Alternatives Considered
1. PDF export (less flexible for data analysis)
2. CSV export (no formatting, less user-friendly)

### Priority
Medium - Nice to have for improved UX
```

---

## Database Migrations

### Creating a Migration

1. **Create migration files**
   ```bash
   # Up migration (apply changes)
   touch migrations/012_your_migration_name.sql

   # Down migration (rollback changes)
   touch migrations/012_your_migration_name.down.sql
   ```

2. **Write SQL**
   - Up migration: Create tables, add columns, etc.
   - Down migration: Undo the changes (drop tables, remove columns)

3. **Test migration**
   ```bash
   ./scripts/migrate.sh         # Apply migration
   ./scripts/rollback.sh        # Test rollback
   ./scripts/migrate.sh         # Reapply
   ```

4. **Update PROJECT_CONTEXT.md** with schema changes

### Migration Guidelines

- **Numbered sequentially**: 001, 002, 003, etc.
- **Idempotent**: Can be run multiple times safely
- **Reversible**: Always include `.down.sql` file
- **Documented**: Add comments explaining complex changes

---

## Questions or Help?

- **Documentation**: Check [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and [docs/](docs/) folder
- **Issues**: Open a GitHub issue with "question" label
- **Email**: Contact project maintainer (check GitHub profile)

---

## License

By contributing to Automet, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Automet!** 🎉
