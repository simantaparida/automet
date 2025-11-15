# Changelog

All notable changes to Automet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-11-15

### 🎉 Major Changes

#### Merged Login/Welcome Architecture
- **BREAKING**: Removed separate `/login` page
- Merged login functionality into `/onboarding/welcome`
- Welcome page now serves as both landing and login page
- 2-column layout on desktop (hero content + login form)
- Fully responsive mobile layout

#### Design System Overhaul
- Replaced blue branding (#2563eb) with orange (#EF7722)
- New gradient system for backgrounds and CTAs
- Consistent spacing and typography system
- Enhanced shadows and border styles
- Modern animations and transitions

### ✨ Added

#### Pages & Components
- Merged login/welcome page with 2-column layout
- Enhanced signup page with password visibility toggles
- Responsive breakpoints for all auth pages
- Decorative background elements (radial gradients)
- Password show/hide toggles on all password fields

#### Documentation
- `DESIGN_SYSTEM.md` - Complete UI/UX guidelines
- `AUTHENTICATION_FLOW.md` - Detailed auth flow documentation
- `QUICK_REFERENCE.md` - Fast lookup guide for developers
- `CHANGELOG.md` - Version history

#### Features
- Slide-in animations for welcome page
- Improved form validation
- Better error messaging
- Auto-redirect logic for logged-in users
- Query parameter support for messages

### 🔄 Changed

#### Authentication Flow
- Login now happens on `/onboarding/welcome` instead of `/login`
- All redirects updated to use welcome page
- Error messages redirect to welcome with context
- Sign-out redirects to welcome page

#### Styling
- **Buttons**: Blue → Orange gradient with hover effects
- **Backgrounds**: Gray (#f5f5f5) → Orange gradient
- **Cards**: Enhanced shadows and borders
- **Inputs**: Focus states now use orange
- **Links**: Blue → Orange with hover underline

#### Components Updated
- `pages/onboarding/welcome.tsx` - Complete rewrite (541 lines)
- `pages/signup.tsx` - Enhanced with new design (756 lines)
- `pages/onboarding/company.tsx` - Updated styling
- `pages/onboarding/complete.tsx` - Updated styling
- `pages/onboarding/customer.tsx` - Updated styling
- `pages/onboarding/job.tsx` - Updated styling
- `pages/onboarding/team.tsx` - Updated styling
- `src/components/BottomNav.tsx` - Updated colors
- `src/components/Sidebar.tsx` - Updated colors

### 🗑️ Removed

- ❌ `/pages/login.tsx` - Deleted (functionality merged into welcome page)
- ❌ All references to `/login` path
- ❌ Old blue color scheme (#2563eb)
- ❌ Gray backgrounds (#f5f5f5)

### 🐛 Fixed

- Redirect loops on auth pages
- Inconsistent styling across onboarding flow
- Mobile responsiveness issues
- Password field UX (added visibility toggles)
- Error handling for existing accounts

### 📚 Documentation

All new documentation follows the new architecture:
- Design system with copy-paste ready code
- Complete auth flow diagrams
- Component specifications
- Responsive patterns
- Troubleshooting guides

### 🔧 Technical Details

#### Breaking Changes
```tsx
// OLD - No longer works
router.push('/login');

// NEW - Use this instead
router.push('/onboarding/welcome');
```

#### Migration Guide
If you have code referencing `/login`:
1. Replace `/login` with `/onboarding/welcome`
2. Update any blue colors (#2563eb) to orange (#EF7722)
3. Replace flat colors with gradients for CTAs
4. Use new background gradient for auth pages

---

## [1.0.0] - 2025-11-13

### Initial Release

#### Features
- Complete onboarding flow
- Separate login and signup pages
- Company profile setup
- Team invitations
- Customer management
- Job creation
- Dashboard with organization check

#### Authentication
- Email/password authentication
- Google OAuth
- Protected routes
- Session management

#### Design
- Blue color scheme
- Basic responsive layout
- Standard form styles

---

## Version History Summary

- **v2.0.0** (Nov 15, 2025) - Merged login/welcome, orange branding, design system
- **v1.0.0** (Nov 13, 2025) - Initial release with separate login page

---

## Upgrade Guide

### From v1.0 to v2.0

#### Code Changes Required

1. **Update all `/login` references:**
   ```tsx
   // Find and replace
   '/login' → '/onboarding/welcome'
   ```

2. **Update color references:**
   ```tsx
   // Find and replace
   '#2563eb' → '#EF7722'
   'backgroundColor: "#2563eb"' → 'background: "linear-gradient(135deg, #EF7722 0%, #ff8833 100%)"'
   ```

3. **Update background colors:**
   ```tsx
   // Find and replace
   'backgroundColor: "#f5f5f5"' → 'background: "linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)"'
   ```

4. **Add hover effects to buttons:**
   ```tsx
   // Add these handlers to all CTA buttons
   onMouseEnter={(e) => {
     e.currentTarget.style.transform = 'translateY(-1px)';
     e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
   }}
   onMouseLeave={(e) => {
     e.currentTarget.style.transform = 'translateY(0)';
     e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
   }}
   ```

#### Testing Checklist

After upgrading:
- [ ] Clear `.next` cache and restart dev server
- [ ] Test login flow from landing page
- [ ] Test signup flow
- [ ] Test password visibility toggles
- [ ] Test OAuth login
- [ ] Test all onboarding steps
- [ ] Verify responsive layouts (mobile/desktop)
- [ ] Check all redirects work correctly
- [ ] Verify no broken `/login` references

---

## Future Roadmap

### v2.1.0 (Planned)
- Email verification flow improvements
- Password reset functionality
- Remember me option
- Social login (Facebook, LinkedIn)

### v2.2.0 (Planned)
- Multi-factor authentication
- SSO support
- Advanced session management
- Biometric authentication (mobile)

---

**For detailed documentation, see:**
- `/docs/DESIGN_SYSTEM.md`
- `/docs/AUTHENTICATION_FLOW.md`
- `/docs/QUICK_REFERENCE.md`

