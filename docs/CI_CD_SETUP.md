# CI/CD Pipeline Setup Guide

This document describes the comprehensive CI/CD pipeline setup for the Automet project.

## Overview

The CI/CD pipeline consists of multiple workflows that ensure code quality, security, and automated deployments:

1. **CI Pipeline** - Continuous Integration checks
2. **Security Scanning** - CodeQL analysis and dependency scanning
3. **PR Checks** - Pull request quality checks
4. **Staging Deployment** - Automated deployment to staging environment
5. **Production Deployment** - Manual/automated deployment to production
6. **Dependabot Auto-merge** - Automated dependency updates

---

## Workflow Details

### 1. CI Pipeline (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs (run in parallel):**

#### Lint & Format

- Runs ESLint
- Checks code formatting with Prettier
- Timeout: 10 minutes

#### Type Check

- Runs TypeScript compiler in check mode
- Timeout: 10 minutes

#### Build

- Builds the Next.js application
- Uploads build artifacts
- Timeout: 15 minutes

#### Unit Tests

- Runs Jest tests with coverage
- Uploads coverage reports to Codecov (if configured)
- Timeout: 15 minutes

#### E2E Tests

- Runs Playwright end-to-end tests
- Uploads test reports and screenshots
- Timeout: 30 minutes

#### CI Summary

- Final job that depends on all other jobs
- Fails if any job fails
- Provides overall CI status

**Features:**

- ✅ Parallel execution for faster feedback
- ✅ Automatic cancellation of in-progress runs
- ✅ Caching for npm dependencies
- ✅ Artifact uploads for test results and build outputs

---

### 2. Security Scanning (`security.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Weekly schedule (Monday 00:00 UTC)
- Manual workflow dispatch

**Jobs:**

#### CodeQL Analysis

- Scans JavaScript and TypeScript code
- Uses security and quality queries
- Generates SARIF reports
- Timeout: 60 minutes

#### Dependency Review

- Reviews dependencies in pull requests
- Checks for known vulnerabilities
- Validates license compliance
- Timeout: 10 minutes

#### NPM Audit

- Runs `npm audit` for vulnerability scanning
- Uploads audit reports as artifacts
- Timeout: 10 minutes

**Features:**

- ✅ Automated security scanning
- ✅ License compliance checking
- ✅ Vulnerability detection

---

### 3. PR Checks (`pr-checks.yml`)

**Triggers:**

- Pull requests (opened, synchronized, reopened, ready for review)

**Checks:**

- Semantic PR title validation
- Large file detection (>10MB)
- Sensitive data detection
- package.json validation
- TODO/FIXME comment detection

**Features:**

- ✅ Enforces PR quality standards
- ✅ Prevents accidental commits of sensitive data
- ✅ Validates PR titles follow conventions

---

### 4. Staging Deployment (`deploy-staging.yml`)

**Triggers:**

- Push to `develop` branch
- Manual workflow dispatch

**Steps:**

1. Type check
2. Build application
3. Run smoke tests
4. Deploy to Vercel (preview/staging)
5. Comment deployment URL on PR

**Features:**

- ✅ Automatic deployment on merge to `develop`
- ✅ Pre-deployment validation
- ✅ PR comments with deployment URLs

---

### 5. Production Deployment (`deploy-production.yml`)

**Triggers:**

- Push to `main` branch
- Manual workflow dispatch

**Steps:**

1. Pre-deployment checks (lint, typecheck, build, tests)
2. Build application
3. Deploy to Vercel (production)
4. Run post-deployment smoke tests
5. Create GitHub release

**Features:**

- ✅ Requires environment approval (GitHub Environments)
- ✅ Pre-deployment validation
- ✅ Automatic release creation
- ✅ Production environment protection

---

### 6. Dependabot Auto-merge (`dependabot-auto-merge.yml`)

**Triggers:**

- Dependabot pull requests

**Features:**

- ✅ Waits for CI to pass
- ✅ Automatically merges Dependabot PRs
- ✅ Only for Dependabot-generated PRs

---

## Required Secrets

### Repository Secrets

Add these in **Settings → Secrets and variables → Actions → Repository secrets**:

| Secret Name                     | Description              | Required For   |
| ------------------------------- | ------------------------ | -------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL     | CI, Deployment |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key   | CI, Deployment |
| `VERCEL_TOKEN`                  | Vercel API token         | Deployment     |
| `VERCEL_ORG_ID`                 | Vercel organization ID   | Deployment     |
| `VERCEL_PROJECT_ID`             | Vercel project ID        | Deployment     |
| `CODECOV_TOKEN`                 | Codecov token (optional) | Test coverage  |

### Environment Secrets

Add these in **Settings → Environments → staging/production → Secrets**:

#### Staging Environment

- `NEXT_PUBLIC_SUPABASE_URL` (staging Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (staging)
- `NEXT_PUBLIC_APP_URL` (staging URL)

#### Production Environment

- `NEXT_PUBLIC_SUPABASE_URL` (production Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- `NEXT_PUBLIC_APP_URL` (production URL)

---

## Configuration

### 1. Enable GitHub Environments

1. Go to **Settings → Environments**
2. Create `staging` environment:
   - Add required reviewers (optional)
   - Set deployment branch: `develop`
   - Add environment secrets
3. Create `production` environment:
   - Add required reviewers (recommended)
   - Set deployment branch: `main`
   - Add environment secrets

### 2. Configure Branch Protection

1. Go to **Settings → Branches**
2. For `main` branch:
   - Require status checks: `CI / CI Summary`, `Security Scanning / CodeQL Analysis`
   - Require branches to be up to date
   - Require pull request reviews
3. For `develop` branch:
   - Require status checks: `CI / CI Summary`
   - Require branches to be up to date
   - Require pull request reviews

### 3. Enable Dependabot

1. Go to **Settings → Code security and analysis**
2. Enable **Dependabot alerts**
3. Enable **Dependabot security updates**
4. The `.github/dependabot.yml` file is already configured

### 4. Configure Codecov (Optional)

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the upload token
4. Add as `CODECOV_TOKEN` secret

---

## Workflow Status Badges

Add these badges to your README:

```markdown
![CI](https://github.com/simantaparida/automet/workflows/CI/badge.svg)
![Security Scanning](https://github.com/simantaparida/automet/workflows/Security%20Scanning/badge.svg)
```

---

## Best Practices

### For Developers

1. **Always run checks locally before pushing:**

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   npm run test:ci
   ```

2. **Follow semantic commit messages:**
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `chore:` for maintenance

3. **Keep PRs focused:**
   - One feature/bug fix per PR
   - Keep PR size reasonable (<500 lines ideally)

4. **Write tests:**
   - Unit tests for business logic
   - E2E tests for critical user flows

5. **Review CI failures:**
   - Check the Actions tab for detailed error messages
   - Fix issues before requesting reviews

### For Maintainers

1. **Monitor security alerts:**
   - Review CodeQL findings
   - Address dependency vulnerabilities
   - Review Dependabot PRs

2. **Review deployment logs:**
   - Check staging deployments
   - Verify production deployments
   - Monitor post-deployment checks

3. **Update workflows as needed:**
   - Keep actions updated
   - Adjust timeouts if builds are slow
   - Add new checks as needed

---

## Troubleshooting

### CI Job Fails

1. **Check the failed job logs:**
   - Go to Actions tab
   - Click on the failed workflow run
   - Review the failed job logs

2. **Common issues:**
   - Type errors: Run `npm run typecheck` locally
   - Lint errors: Run `npm run lint` locally
   - Test failures: Run `npm run test:ci` locally
   - Build failures: Check for missing environment variables

### Deployment Fails

1. **Check Vercel configuration:**
   - Verify `VERCEL_TOKEN` is valid
   - Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
   - Ensure environment variables are set

2. **Check environment secrets:**
   - Verify all required secrets are set
   - Check secret values are correct
   - Ensure environment is configured

### Security Scanning Issues

1. **CodeQL findings:**
   - Review the Security tab
   - Address high/critical severity issues
   - Review and dismiss false positives

2. **Dependency vulnerabilities:**
   - Review Dependabot alerts
   - Update dependencies via Dependabot PRs
   - Test updates in staging before production

---

## Performance Optimization

### Caching

- **npm dependencies:** Automatically cached via `actions/setup-node`
- **Build artifacts:** Cached for 7 days
- **Test results:** Cached for 30 days

### Parallel Execution

- All CI jobs run in parallel for faster feedback
- Average CI time: ~10-15 minutes (depending on E2E tests)

### Optimization Tips

1. **Use build caching:**
   - Next.js build cache is automatically used
   - Consider caching `.next` directory if needed

2. **Optimize E2E tests:**
   - Run only critical E2E tests in CI
   - Use test sharding for large test suites

3. **Reduce test timeouts:**
   - Optimize slow tests
   - Use test parallelization

---

## Future Enhancements

- [ ] Add performance testing
- [ ] Add Lighthouse CI for performance audits
- [ ] Add visual regression testing
- [ ] Add database migration testing
- [ ] Add integration with monitoring tools
- [ ] Add Slack/Discord notifications
- [ ] Add deployment rollback automation

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [CodeQL Documentation](https://codeql.github.com/docs)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

---

**Last Updated:** November 2025
