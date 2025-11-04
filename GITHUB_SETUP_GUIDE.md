# GitHub Repository Setup Guide - Automet

**Repository**: https://github.com/simantaparida/automet
**Visibility**: Private
**Created**: November 3, 2025
**Branches**: `main` (production), `develop` (staging)

---

## Table of Contents
1. [General Settings](#1-general-settings)
2. [Branch Configuration](#2-branch-configuration)
3. [Rulesets Setup (Recommended)](#3-rulesets-setup-recommended)
4. [Collaborators & Teams](#4-collaborators--teams)
5. [GitHub Features](#5-github-features)
6. [Security Settings](#6-security-settings)
7. [Environments Setup](#7-environments-setup)
8. [Secrets & Variables](#8-secrets--variables)
9. [Webhooks & Integrations](#9-webhooks--integrations)

---

## 1. General Settings

### Access Settings Page
1. Go to: https://github.com/simantaparida/automet
2. Click **Settings** tab (top navigation)

### 1.1 Repository Details

**Location**: Settings → General (top section)

**Configure**:
- ✅ **Description**: `Field service management platform for Indian AMC vendors - Next.js + Supabase + TypeScript`
- ✅ **Website**: Leave blank for now (add when deployed)
- ✅ **Topics**: Add these tags (click "Add topics"):
  ```
  nextjs
  typescript
  supabase
  field-service-management
  saas
  pwa
  india
  facility-management
  ```

**Why topics matter**: They make your repo discoverable in GitHub search and help categorize your project.

---

### 1.2 Features

**Location**: Settings → General → Features section

**Enable**:
- ✅ **Wikis** - OFF (we use markdown docs in repo)
- ✅ **Issues** - ON (for bug tracking and feature requests)
- ✅ **Sponsorships** - OFF (not applicable)
- ✅ **Preserve this repository** - OFF (GitHub Archive Program - optional)
- ✅ **Discussions** - OFF for now (can enable later for Q&A)
- ✅ **Projects** - ON (for kanban board/project management)

**Screenshot location**: Scroll to "Features" section in General settings

---

### 1.3 Pull Requests

**Location**: Settings → General → Pull Requests section

**Configure**:
- ✅ **Allow merge commits** - ON
  - ✅ Default message: "Default to pull request title"
- ✅ **Allow squash merging** - ON (RECOMMENDED)
  - ✅ Default message: "Default to pull request title and description"
- ✅ **Allow rebase merging** - OFF (to avoid confusion)
- ✅ **Always suggest updating pull request branches** - ON
- ✅ **Allow auto-merge** - ON (useful for automated PRs)
- ✅ **Automatically delete head branches** - ON (keeps repo clean)

**Why squash merging**: Keeps `main` branch history clean with one commit per feature.

---

### 1.4 Default Branch

**Location**: Settings → General → Default branch section

**Current default**: `main` (we'll change this to `develop`)

**Steps to change**:
1. Click the ⇄ (switch icon) next to "main"
2. Select `develop` from dropdown
3. Click "Update"
4. Confirm with "I understand, update the default branch"

**Why set `develop` as default**:
- New PRs automatically target `develop` instead of `main`
- Prevents accidental direct commits to production
- Follows Git Flow best practices

---

## 2. Branch Configuration

### 2.1 View Branches

**Location**: Settings → Branches

You should see:
- `main` - Production branch
- `develop` - Staging/testing branch (soon to be default)

---

## 3. Rulesets Setup (Recommended)

**What are Rulesets?** Modern replacement for Branch Protection Rules with better features:
- ✅ Multiple rulesets can apply simultaneously (layered protection)
- ✅ More transparent (anyone with read access can view)
- ✅ Can be set to "Evaluate" mode before enforcing
- ✅ Better organization-wide governance
- ✅ Can target multiple branches with patterns

**Location**: Settings → Rules → Rulesets

---

### 3.1 Create Ruleset for Production (`main` branch)

**Click**: "New ruleset" → "New branch ruleset"

#### **Ruleset 1: Production Branch Protection**

**Name**: `production-branch-protection`

**Enforcement status**:
- Start with: **Evaluate** (test mode - logs violations but doesn't block)
- After testing 1 week: Switch to **Active** (enforces rules)

**Target branches**:
- Click "Add target"
- Select "Include by pattern"
- Pattern: `main`

**Branch Protections** (scroll down to rules section):

1. ✅ **Restrict deletions** - ON
   - Prevents accidental deletion of `main` branch

2. ✅ **Require a pull request before merging** - ON
   - ✅ Required approvals: `1`
   - ✅ Dismiss stale pull request approvals when new commits are pushed - ON
   - ✅ Require review from Code Owners - OFF (no CODEOWNERS file yet)
   - ✅ Require approval of the most recent reviewable push - ON

3. ✅ **Require status checks to pass** - ON (enable later when CI/CD is set up)
   - Status checks: (leave empty for now, add when GitHub Actions are configured)
   - ✅ Require branches to be up to date before merging - ON

4. ✅ **Block force pushes** - ON
   - Prevents `git push --force` which rewrites history

5. ✅ **Require linear history** - OFF (we allow merge commits)

6. ✅ **Require deployments to succeed** - OFF (enable when deployment is configured)

7. ✅ **Require signed commits** - OFF (optional security feature)

8. ✅ **Require conversation resolution before merging** - ON
   - All review comments must be resolved before merge

**Bypass list** (who can bypass these rules):
- ⚠️ **Repository admins** - You (simantaparida) can bypass in emergencies
- Click "Add bypass" → Select "Repository admin"

**Click**: "Create" to save ruleset

---

### 3.2 Create Ruleset for Staging (`develop` branch)

**Click**: "New ruleset" → "New branch ruleset"

#### **Ruleset 2: Staging Branch Protection**

**Name**: `staging-branch-protection`

**Enforcement status**: **Active** (can be less strict than production)

**Target branches**:
- Pattern: `develop`

**Branch Protections**:

1. ✅ **Restrict deletions** - ON

2. ✅ **Require a pull request before merging** - ON
   - ✅ Required approvals: `0` (optional review, not mandatory)
   - ✅ Dismiss stale pull request approvals - OFF
   - ✅ Require review from Code Owners - OFF

3. ✅ **Require status checks to pass** - OFF (faster development cycle)

4. ✅ **Block force pushes** - ON

5. ✅ **Require conversation resolution before merging** - ON

**Bypass list**: Repository admins

**Click**: "Create"

---

### 3.3 Create Ruleset for Feature Branches

**Click**: "New ruleset" → "New branch ruleset"

#### **Ruleset 3: Feature Branch Naming Convention**

**Name**: `feature-branch-conventions`

**Enforcement status**: **Evaluate** (advisory only)

**Target branches**:
- Pattern: `feature/*`
- Pattern: `bugfix/*`
- Pattern: `hotfix/*`

**Branch Protections**:

1. ✅ **Block force pushes** - OFF (developers need flexibility)

2. ✅ **Restrict deletions** - OFF (branches deleted after merge)

**Metadata restrictions** (optional):
- Can add rules like "branch name must match pattern"
- Leave empty for now

**Click**: "Create"

---

### 3.4 View Active Rulesets

After creating all 3 rulesets, you should see:

```
production-branch-protection  | Evaluate | main
staging-branch-protection     | Active   | develop
feature-branch-conventions    | Evaluate | feature/*, bugfix/*, hotfix/*
```

**Test the rules**:
1. Try to push directly to `main` → Should see warning (Evaluate mode)
2. Try to create a PR to `main` without review → Should see warning
3. After 1 week of testing, change `production-branch-protection` to **Active**

---

## 4. Collaborators & Teams

**Location**: Settings → Collaborators

### 4.1 Invite Collaborators (When Needed)

**Steps**:
1. Click "Add people"
2. Enter GitHub username or email
3. Select role:
   - **Admin** - Full control (for co-founders)
   - **Write** - Can push code, create branches (for developers)
   - **Read** - Can view code only (for stakeholders)

**Current**: Only you (simantaparida) as owner

---

## 5. GitHub Features

### 5.1 Enable GitHub Issues

**Location**: Settings → General → Features → Issues (should already be ON)

**Configure Issue Templates** (optional, do later):
- Create `.github/ISSUE_TEMPLATE/bug_report.md`
- Create `.github/ISSUE_TEMPLATE/feature_request.md`

### 5.2 Enable GitHub Projects

**Location**: Settings → General → Features → Projects (ON)

**Create a Project Board**:
1. Go to "Projects" tab in repo
2. Click "New project"
3. Template: "Board"
4. Name: "Automet Development"
5. Columns: "Backlog", "In Progress", "In Review", "Done"

---

## 6. Security Settings

**Location**: Settings → Security

### 6.1 Security & Analysis

**Enable these features**:

1. ✅ **Dependency graph** - ON (automatically enabled for public repos)
   - Shows package dependencies

2. ✅ **Dependabot alerts** - ON
   - Notifies you of vulnerable dependencies
   - Click "Enable" if not already on

3. ✅ **Dependabot security updates** - ON
   - Automatically creates PRs to update vulnerable dependencies

4. ✅ **Dependabot version updates** - OFF for now
   - Creates PRs for all dependency updates (can be noisy)
   - Enable later with a `dependabot.yml` config file

5. ✅ **Code scanning** - OFF (GitHub Advanced Security - paid feature)
   - Can enable with GitHub Actions later

6. ✅ **Secret scanning** - ON (automatically enabled for private repos)
   - Detects accidentally committed secrets (API keys, tokens)

---

### 6.2 Deploy Keys (For CI/CD Later)

**Location**: Settings → Deploy keys

**What**: SSH keys that give read-only or read-write access to this single repo

**When to use**: When setting up automated deployments (Vercel, AWS, etc.)

**For now**: Leave empty

---

## 7. Environments Setup

**Location**: Settings → Environments

**What are Environments?**: Named deployment targets with protection rules and secrets

**Create 2 Environments**:

### 7.1 Staging Environment

**Steps**:
1. Click "New environment"
2. Name: `staging`
3. Click "Configure environment"

**Protection rules**:
- ✅ **Required reviewers** - OFF (staging doesn't need approval)
- ✅ **Wait timer** - OFF
- ✅ **Deployment branches** - Selected branches only
  - Add branch: `develop`

**Environment secrets** (add these now or later):
- Click "Add secret"
  - Name: `NEXT_PUBLIC_SUPABASE_URL`
  - Value: Your dev Supabase project URL
- Add secret:
  - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Value: Your dev Supabase anon key
- Add secret:
  - Name: `SUPABASE_SERVICE_ROLE_KEY`
  - Value: Your dev Supabase service role key

**Click**: "Save protection rules"

---

### 7.2 Production Environment

**Steps**:
1. Click "New environment"
2. Name: `production`
3. Click "Configure environment"

**Protection rules**:
- ✅ **Required reviewers** - ON
  - Add yourself as reviewer
  - Requires manual approval before deployment
- ✅ **Wait timer** - OFF (or set to 5 minutes for safety)
- ✅ **Deployment branches** - Selected branches only
  - Add branch: `main`

**Environment secrets** (add when you create production Supabase project):
- `NEXT_PUBLIC_SUPABASE_URL` (production project)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- `SUPABASE_SERVICE_ROLE_KEY` (production)
- `RAZORPAY_KEY_ID` (live mode)
- `RAZORPAY_KEY_SECRET` (live mode)

**Click**: "Save protection rules"

---

## 8. Secrets & Variables

**Location**: Settings → Secrets and variables → Actions

### 8.1 Repository Secrets (Shared Across All Workflows)

**Click**: "New repository secret"

**Add these secrets** (for CI/CD when you set it up):

1. `SUPABASE_ACCESS_TOKEN`
   - Description: For running migrations in CI/CD
   - Get from: Supabase Dashboard → Project Settings → API

2. `VERCEL_TOKEN` (when deploying to Vercel)
   - Description: For automated deployments
   - Get from: Vercel → Settings → Tokens

**For now**: Can skip, add when needed for GitHub Actions

---

### 8.2 Repository Variables (Non-Sensitive Config)

**Click**: "Variables" tab → "New repository variable"

**Add these variables**:

1. `NODE_VERSION`
   - Value: `18` or `20` (whatever version you're using)
   - Used in: GitHub Actions workflows

2. `NEXT_PUBLIC_APP_URL`
   - Value: `https://automet.in` (when you have domain)
   - Used in: Email templates, OAuth redirects

**For now**: Can skip

---

## 9. Webhooks & Integrations

**Location**: Settings → Webhooks

### 9.1 Webhooks (For Future Integrations)

**What**: HTTP callbacks triggered by GitHub events (push, PR, etc.)

**Common use cases**:
- Trigger deployments on push
- Notify Slack of new PRs
- Update project management tools

**For now**: No webhooks needed (Vercel/Netlify will add their own when you connect)

---

### 9.2 GitHub Apps & Integrations

**Location**: Settings → Integrations → GitHub Apps

**Recommended apps to install later**:
1. **Vercel** - For automatic deployments
2. **CodeCov** - For test coverage reports
3. **Dependabot** - Already included in GitHub
4. **Slack** - For team notifications

**For now**: None needed

---

## 10. Repository Insights

**Location**: Insights tab (top navigation)

**Useful features**:
- **Pulse** - Activity summary (commits, PRs, issues)
- **Contributors** - Who contributed code
- **Traffic** - Views and clones (only visible to you)
- **Commits** - Commit history visualization
- **Code frequency** - Additions/deletions over time
- **Network** - Branch and fork visualization

---

## ✅ Configuration Checklist

Use this checklist to verify your setup:

### General Settings
- [ ] Description added
- [ ] Topics/tags added
- [ ] Issues enabled
- [ ] Projects enabled
- [ ] Wikis disabled
- [ ] Discussions disabled (for now)
- [ ] Default branch set to `develop`
- [ ] Auto-delete head branches enabled
- [ ] Squash merging enabled

### Rulesets
- [ ] Ruleset 1: `production-branch-protection` (main) - Evaluate mode
- [ ] Ruleset 2: `staging-branch-protection` (develop) - Active mode
- [ ] Ruleset 3: `feature-branch-conventions` (feature/*) - Evaluate mode

### Security
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled
- [ ] Secret scanning enabled

### Environments
- [ ] `staging` environment created (linked to `develop`)
- [ ] `production` environment created (linked to `main`)
- [ ] Production environment requires approval

### Branch Strategy
- [ ] `main` branch protected
- [ ] `develop` branch protected
- [ ] `develop` is default branch

---

## 📋 Testing Your Setup

### Test 1: Try to Push Directly to Main

```bash
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test: direct push to main"
git push origin main
```

**Expected**: Warning in "Evaluate" mode, blocked in "Active" mode

---

### Test 2: Create a Feature Branch & PR

```bash
git checkout develop
git pull origin develop
git checkout -b feature/test-pr
echo "# Test Feature" >> test.md
git add test.md
git commit -m "feat: test feature"
git push -u origin feature/test-pr
```

Then on GitHub:
1. Create PR: `feature/test-pr` → `develop`
2. Verify: No issues, can merge freely
3. Create PR: `develop` → `main`
4. Verify: Requires approval, conversation resolution

---

## 🚀 Next Steps After Configuration

1. **Week 1**: Monitor rulesets in "Evaluate" mode
   - Check "Insights" → "Rule insights" to see violations
   - Adjust rules if needed

2. **Week 2**: Switch `production-branch-protection` to "Active"

3. **Module 4**: Set up GitHub Actions for CI/CD
   - Create `.github/workflows/ci.yml`
   - Create `.github/workflows/deploy-staging.yml`
   - Create `.github/workflows/deploy-production.yml`

4. **Before Launch**: Create production Supabase project and add secrets

---

## 📚 Additional Resources

- **GitHub Rulesets Docs**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
- **Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- **Environments**: https://docs.github.com/en/actions/deployment/targeting-different-environments
- **Secrets Management**: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## 🎯 Summary

Your GitHub repository is now configured with:
- ✅ Modern Rulesets (not legacy branch protection)
- ✅ Two-environment setup (staging + production)
- ✅ Security features enabled
- ✅ Proper branch strategy (`main` ← `develop` ← `feature/*`)
- ✅ Code review requirements
- ✅ Clean git history with squash merging

**This setup supports**:
- Professional team collaboration
- Safe production deployments
- Automated CI/CD (when configured)
- Industry-standard Git Flow workflow

---

**Document Version**: 1.0
**Last Updated**: November 3, 2025
**Maintained By**: Simant Parida
