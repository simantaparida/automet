# GitHub Repository Setup Guide

**Repository**: [simantaparida/automet](https://github.com/simantaparida/automet)
**Status**: Public
**Last Updated**: November 4, 2025

This guide walks through configuring your GitHub repository with branch protection, security features, and CI/CD environments.

---

## Table of Contents

1. [General Settings](#1-general-settings)
2. [Branch Configuration](#2-branch-configuration)
3. [Branch Protection Rules](#3-branch-protection-rules)
4. [Security Features](#4-security-features)
5. [GitHub Environments](#5-github-environments)
6. [Secrets & Variables](#6-secrets--variables)
7. [Configuration Checklist](#7-configuration-checklist)
8. [Testing Your Setup](#8-testing-your-setup)

---

## 1. General Settings

### Repository Basics

Navigate to **Settings** → **General**

#### Description & Topics
- **Description**: "Field service management platform for Indian AMC vendors - Next.js, TypeScript, Supabase"
- **Topics**: Add relevant tags:
  ```
  nextjs, typescript, supabase, field-service, saas, pwa, tailwindcss,
  facility-management, amc-software, indian-market
  ```

#### Features
Enable these features:
- ✅ Issues (for bug tracking and feature requests)
- ✅ Discussions (optional - for community Q&A)
- ❌ Projects (not needed yet)
- ❌ Wiki (use README/docs instead)
- ❌ Sponsorships (not needed)

#### Pull Requests
Configure PR settings:
- ✅ **Allow squash merging** (recommended)
  - Set default commit message to: "Pull request title"
  - Keeps history clean
- ❌ Allow merge commits (disable for clean history)
- ❌ Allow rebase merging (disable to avoid confusion)
- ✅ **Automatically delete head branches** (keeps repo clean)
- ✅ **Allow auto-merge** (for Dependabot PRs)

---

## 2. Branch Configuration

### Set Default Branch

Navigate to **Settings** → **General** → **Default branch**

1. Click "Switch default branch"
2. Select `develop`
3. Click "Update"
4. Confirm the change

**Why `develop`?**
- New PRs default to `develop` branch
- `main` stays clean for production releases
- Follows Git Flow methodology

---

## 3. Branch Protection Rules

Navigate to **Settings** → **Branches** → **Add branch protection rule**

### Rule 1: Protect `main` Branch

**Branch name pattern**: `main`

Enable these rules:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional, needs CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add checks when you set up CI/CD (e.g., "build", "test")

- ✅ **Require conversation resolution before merging**
  - All PR comments must be resolved

- ✅ **Require linear history**
  - Prevents merge commits, enforces squash or rebase

- ✅ **Do not allow bypassing the above settings**
  - Even admins must follow rules (recommended for discipline)

- ✅ **Restrict who can push to matching branches**
  - Leave empty (no one can push directly)

- ✅ **Allow force pushes**: ❌ (disabled)
- ✅ **Allow deletions**: ❌ (disabled)

Click **Create** to save.

---

### Rule 2: Protect `develop` Branch

**Branch name pattern**: `develop`

Enable these rules (slightly more relaxed than `main`):
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require conversation resolution before merging**

- ✅ **Require linear history**

- ✅ **Allow force pushes**: ❌ (disabled)
- ✅ **Allow deletions**: ❌ (disabled)

Click **Create** to save.

---

## 4. Security Features

Navigate to **Settings** → **Code security and analysis**

### Recommended Settings

#### Dependency graph
- ✅ **Enable** (should be enabled by default for public repos)
- Allows GitHub to track dependencies

#### Dependabot alerts
- ✅ **Enable**
- Notifies you of security vulnerabilities in dependencies
- Configure notifications: Settings → Notifications → Dependabot alerts

#### Dependabot security updates
- ✅ **Enable**
- Automatically creates PRs to fix vulnerable dependencies
- PRs will target `develop` branch

#### Dependabot version updates (Optional)
- ⏳ **Configure later** (needs `.github/dependabot.yml`)
- Automatically creates PRs for dependency updates
- Can be noisy, recommend enabling after initial setup

#### Code scanning (Optional)
- ⏳ **Configure later** with GitHub Actions
- Scans code for security vulnerabilities
- Recommended: Set up CodeQL analysis

#### Secret scanning
- ✅ **Enable** (should be enabled by default for public repos)
- Prevents committing secrets (API keys, tokens)
- Push protection enabled by default

---

## 5. GitHub Environments

Environments allow you to configure deployment targets with protection rules and secrets.

Navigate to **Settings** → **Environments**

### Environment 1: `staging`

1. Click **New environment**
2. Name: `staging`
3. Configure:
   - ✅ **Required reviewers**: Leave empty (auto-deploy on merge to `develop`)
   - ✅ **Wait timer**: 0 minutes (no delay)
   - ✅ **Deployment branches**: `develop` only
4. Click **Save protection rules**

**Purpose**:
- Linked to `develop` branch
- Auto-deploys when PRs merge to `develop`
- Used for testing before production

---

### Environment 2: `production`

1. Click **New environment**
2. Name: `production`
3. Configure:
   - ✅ **Required reviewers**: Add yourself
   - ✅ **Wait timer**: 0 minutes
   - ✅ **Deployment branches**: `main` only
4. Click **Save protection rules**

**Purpose**:
- Linked to `main` branch
- Requires manual approval before deployment
- Used for live customer-facing application

---

## 6. Secrets & Variables

Secrets are encrypted and used in GitHub Actions. Variables are plain text.

Navigate to **Settings** → **Secrets and variables** → **Actions**

### Repository Secrets (Shared Across Environments)

Click **New repository secret** for each:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token | `sbp_xxx...` |

### Environment-Specific Secrets

#### Staging Environment Secrets

Navigate to **Environments** → `staging` → **Add secret**

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev Supabase project URL | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev Supabase anon key | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev Supabase service key | Supabase dashboard → Settings → API |
| `RAZORPAY_KEY_ID` | Razorpay test key | Razorpay dashboard (test mode) |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret | Razorpay dashboard (test mode) |

#### Production Environment Secrets (When Ready)

Navigate to **Environments** → `production` → **Add secret**

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Prod Supabase project URL | Production Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Prod Supabase anon key | Production Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod Supabase service key | Production Supabase dashboard |
| `RAZORPAY_KEY_ID` | Razorpay live key | Razorpay dashboard (live mode) |
| `RAZORPAY_KEY_SECRET` | Razorpay live secret | Razorpay dashboard (live mode) |

### Environment Variables (Optional)

For non-sensitive configuration, use **Variables** instead of secrets:
- `NEXT_PUBLIC_APP_URL`: "https://staging.automet.app" or "https://automet.app"
- `ENVIRONMENT`: "staging" or "production"

---

## 7. Configuration Checklist

Use this checklist to ensure everything is set up correctly:

### Repository Basics
- [ ] Description and topics added
- [ ] Issues enabled
- [ ] PR settings configured (squash merge, auto-delete branches)
- [ ] Default branch set to `develop`

### Branch Protection
- [ ] `main` branch protected (requires PR + 1 approval)
- [ ] `develop` branch protected (requires PR + 1 approval)
- [ ] Direct pushes blocked to both branches
- [ ] Force pushes disabled
- [ ] Branch deletions disabled
- [ ] Conversation resolution required

### Security
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled
- [ ] Secret scanning enabled

### Environments
- [ ] `staging` environment created (linked to `develop`)
- [ ] `production` environment created (linked to `main`, requires approval)
- [ ] Staging secrets added
- [ ] Production secrets added (when ready)

### Optional (For Later)
- [ ] CI/CD workflow added (`.github/workflows/ci.yml`)
- [ ] CodeQL code scanning enabled
- [ ] Dependabot version updates configured
- [ ] CODEOWNERS file created
- [ ] Social preview image added (Settings → General)

---

## 8. Testing Your Setup

### Test 1: Verify Branch Protection on `main`

1. Try to push directly to `main`:
   ```bash
   git checkout main
   git commit --allow-empty -m "test: verify branch protection"
   git push origin main
   ```

2. **Expected Result**: Push should be rejected with:
   ```
   remote: error: GH006: Protected branch update failed
   ```

3. If successful, branch protection is working! ✅

---

### Test 2: Verify PR Workflow

1. Create a feature branch:
   ```bash
   git checkout develop
   git checkout -b feature/test-pr-flow
   ```

2. Make a small change and commit:
   ```bash
   echo "# Test PR" >> TEST.md
   git add TEST.md
   git commit -m "test: verify PR workflow"
   ```

3. Push the branch:
   ```bash
   git push -u origin feature/test-pr-flow
   ```

4. Open a PR on GitHub:
   - Go to repository → **Pull requests** → **New pull request**
   - Base: `develop` ← Compare: `feature/test-pr-flow`
   - Click **Create pull request**

5. **Expected Result**:
   - PR requires 1 approval
   - "Squash and merge" button is available
   - Cannot merge until approved

6. Approve and merge the PR (you can approve your own PR for testing)

7. **Verify**:
   - Branch `feature/test-pr-flow` is automatically deleted
   - Commit appears in `develop` with squashed message

8. Clean up:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/test-pr-flow
   git push origin :feature/test-pr-flow  # if not auto-deleted
   rm TEST.md
   git add TEST.md
   git commit -m "chore: remove test file"
   git push origin develop
   ```

---

### Test 3: Verify Dependabot Alerts

1. Navigate to **Security** → **Dependabot alerts**
2. If no alerts appear, your dependencies are secure! ✅
3. If alerts appear, Dependabot will create PRs to fix them

---

## Next Steps

### Immediate Tasks
1. Complete this configuration checklist
2. Test branch protection and PR workflow
3. Add staging environment secrets
4. Update documentation with your findings

### Future Enhancements
1. **CI/CD Pipeline**: Create `.github/workflows/ci.yml` for automated tests
2. **Deployment Workflow**: Create `.github/workflows/deploy.yml` for Vercel/other platform
3. **Code Scanning**: Enable CodeQL analysis
4. **CODEOWNERS**: Create `.github/CODEOWNERS` for automatic review assignments
5. **Issue Templates**: Create `.github/ISSUE_TEMPLATE/` for bug reports and features
6. **PR Template**: Create `.github/PULL_REQUEST_TEMPLATE.md` for consistent PRs

---

## Troubleshooting

### Problem: Can't enable branch protection
**Solution**: Ensure repository is public. Branch protection is free on public repos.

### Problem: Branch protection not enforcing
**Solution**:
1. Check that you're pushing to the protected branch
2. Verify rules are saved (Settings → Branches)
3. Ensure "Allow bypassing" is disabled

### Problem: Dependabot PRs not appearing
**Solution**:
1. Ensure Dependabot alerts are enabled
2. Check Security → Dependabot alerts for vulnerabilities
3. If no vulnerabilities, no PRs will be created

### Problem: Can't set default branch to `develop`
**Solution**: Ensure `develop` branch exists on remote:
```bash
git checkout develop
git push -u origin develop
```

---

## Resources

- **GitHub Docs - Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **GitHub Docs - Environments**: https://docs.github.com/en/actions/deployment/targeting-different-environments
- **GitHub Docs - Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Supabase Branching Guide**: https://supabase.com/docs/guides/cli/managing-environments

---

**End of Guide**
*Last updated: November 4, 2025*
