# 🔒 Security Checklist - Before Every Commit

## ⚠️ CRITICAL: Check Before Committing

### 1. **Never Commit Secrets**
- [ ] No API keys (JWT tokens, service keys, etc.)
- [ ] No database passwords or connection strings
- [ ] No admin secrets or authentication tokens
- [ ] No private keys or certificates

### 2. **Scan Files for Secrets**
Before committing, check for:
- [ ] JWT tokens (pattern: `eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`)
- [ ] Database URLs with passwords (`postgresql://.*:.*@`)
- [ ] API keys (look for `_KEY=`, `_SECRET=`, `_TOKEN=`)
- [ ] Service role keys (`SUPABASE_SERVICE_ROLE_KEY=`)
- [ ] Connection strings with credentials

### 3. **Documentation Files**
- [ ] Use placeholders (e.g., `YOUR_PROJECT_ID`, `your-api-key-here`)
- [ ] Reference secure sources (e.g., "Get from Supabase Dashboard")
- [ ] Never hardcode actual credentials in docs

### 4. **Environment Files**
- [ ] `.env*` files are in `.gitignore`
- [ ] `.env.local`, `.env.staging`, `.env.production` are ignored
- [ ] No `.env` files committed

### 5. **Code Files**
- [ ] No hardcoded credentials in source code
- [ ] All secrets come from environment variables
- [ ] No credentials in comments or strings

---

## 🛡️ Recommended Tools

### Pre-commit Hook (Optional but Recommended)
```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
git clone https://github.com/awslabs/git-secrets.git

# Configure
git secrets --register-aws
git secrets --install
```

### Manual Scan Before Commit
```bash
# Check for common secret patterns
grep -r "eyJ[A-Za-z0-9_-]*\." . --exclude-dir=node_modules
grep -r "postgresql://.*:.*@" . --exclude-dir=node_modules
grep -r "_KEY=" . --exclude-dir=node_modules | grep -v "NEXT_PUBLIC"
grep -r "_SECRET=" . --exclude-dir=node_modules | grep -v "NEXT_PUBLIC"
```

---

## 🚨 If You Accidentally Commit Secrets

1. **Immediately rotate all exposed credentials**
2. **Remove from Git history** (if possible)
3. **Consider repository compromised** - rotate everything
4. **Review access logs** in services (Supabase, etc.)

---

## ✅ Safe Patterns

✅ **Good:**
```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
# Get from Supabase Dashboard → Settings → API
```

❌ **Bad:**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password123@db.xxx.supabase.co:5432/postgres
```

---

**Remember: When in doubt, use a placeholder or ask!**

