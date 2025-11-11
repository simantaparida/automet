# 🗺️ Automet Product Roadmap

**Last Updated**: November 11, 2025
**Current Version**: v0.1.0 (Production)
**Next Release**: v0.2.0 (Planned: December 2025)

---

## 🎯 Vision

Build the #1 field service management platform for Indian AMC vendors, helping them:
- Reduce admin time by 50%
- Recover 5% lost revenue through better tracking
- Improve cash flow by 5% with faster invoicing
- Serve 10,000+ technicians across India by 2026

---

## 📊 Release History

### ✅ v0.1.0 - Landing Page & Marketing (November 2025)

**Status**: 🟢 Live in Production

**What's Included**:
- Landing page with hero, features, pricing
- Blog system with SEO optimization
- Contact form & waitlist
- ROI Calculator
- Admin portal (password protected)
- Vercel Analytics & Speed Insights

**Achievement**: Foundation for customer acquisition

---

## 🚀 Planned Releases

### 📦 v0.2.0 - Authentication & Core App (December 2025)

**Status**: 🟡 In Planning

**Primary Goal**: Make app functional for first pilot customer

**Key Features**:
- Google OAuth + Email/Password authentication
- Organization onboarding flow
- Functional dashboard with real data
- Clients, Sites, Assets, Jobs CRUD (fully functional)
- Role-based access control (Owner/Coordinator/Technician)
- Multi-tenant data isolation (RLS enforced)
- Mobile-responsive UI

**Target Users**: 1 pilot customer

**Timeline**: 5-6 weeks

**Success Metric**: 1 customer successfully using the app

---

### 📦 v0.3.0 - Mobile PWA & Offline Support (Q1 2026)

**Status**: ⚪ Planned

**Primary Goal**: Enable technicians to work offline in the field

**Key Features**:
- Offline-first architecture
- Service worker for background sync
- Job data caching
- Photo upload queue (offline → sync when online)
- Install prompts (Add to Home Screen)
- Push notifications for job assignments
- Check-in/Check-out with GPS

**Target Users**: 3-5 pilot customers with field technicians

**Timeline**: 4-5 weeks

**Success Metric**: Technicians can complete jobs without internet

---

### 📦 v0.4.0 - Payments & Subscriptions (Q1 2026)

**Status**: ⚪ Planned

**Primary Goal**: Launch paid plans and enable revenue

**Key Features**:
- Razorpay integration
- Subscription management (Free → Pro upgrade)
- Usage tracking and limits enforcement
- Billing customer portal
- Payment webhooks
- Invoicing (generate PDFs)
- Free trial (14 days)

**Target Users**: 10-20 paying customers

**Timeline**: 3-4 weeks

**Success Metric**: $5,000 MRR

---

### 📦 v0.5.0 - Advanced Features & Automation (Q2 2026)

**Status**: ⚪ Planned

**Primary Goal**: Add features that differentiate from competitors

**Key Features**:
- Preventive maintenance scheduling (AMC automation)
- Contract management (track AMC renewals)
- Reports & analytics dashboard
- Bulk job creation from CSV
- WhatsApp notifications (via Gupshup/Twilio)
- PDF report generation (job completion certificates)
- Recurring jobs (weekly/monthly)
- Technician performance tracking

**Target Users**: 50+ paying customers

**Timeline**: 6-8 weeks

**Success Metric**: 90% customer retention

---

### 📦 v0.6.0 - Team Collaboration & Communication (Q2 2026)

**Status**: ⚪ Planned

**Primary Goal**: Improve coordination between office and field

**Key Features**:
- In-app chat (team → technician)
- Job comments/activity feed
- @mentions and notifications
- File attachments (PDFs, images)
- Real-time job status updates
- Customer portal (clients can track jobs)
- Feedback/rating system

**Target Users**: 100+ paying customers

**Timeline**: 4-5 weeks

---

### 📦 v1.0.0 - Enterprise Ready (Q3 2026)

**Status**: ⚪ Planned

**Primary Goal**: Support large organizations (50-200 technicians)

**Key Features**:
- Multi-location support
- Branch/region hierarchy
- Advanced reporting (custom reports)
- API access for integrations
- Webhooks
- SSO (SAML) for enterprise customers
- White-labeling (custom branding)
- SLA tracking and alerts
- Audit logs
- Data export (backup)

**Target Users**: 5-10 enterprise customers

**Timeline**: 8-10 weeks

**Success Metric**: $50,000 MRR, 500+ organizations

---

## 🎨 Feature Backlog (Future Consideration)

### High Priority
- 📱 Native mobile apps (iOS/Android)
- 🗺️ Route optimization for technicians
- 📊 Business intelligence dashboard (Power BI style)
- 🔗 Tally/Zoho/QuickBooks integration
- 📞 Voice calling integration
- 🎓 Training mode for new technicians

### Medium Priority
- 🤖 AI-powered job assignment optimization
- 📈 Predictive maintenance (ML for failure prediction)
- 🌐 Multi-language support (Hindi, Tamil, etc.)
- 💬 Customer SMS campaigns
- 📧 Email marketing integration
- 🎁 Loyalty/rewards program for customers

### Low Priority
- 🛒 Spare parts marketplace
- 🎯 Lead management (CRM features)
- 📦 Vendor management
- 🚚 Logistics tracking
- 🏪 POS integration

---

## 🎯 2025-2026 Goals

### By End of 2025 (2 months)
- ✅ v0.1.0 launched (marketing site)
- 🎯 v0.2.0 launched (core app with auth)
- 🎯 1-3 pilot customers using the app
- 🎯 50+ waitlist signups

### By Q1 2026 (3 months)
- 🎯 v0.3.0 launched (offline PWA)
- 🎯 v0.4.0 launched (payments)
- 🎯 10-20 paying customers
- 🎯 $5,000 MRR
- 🎯 500+ jobs created in the system

### By Q2 2026 (3 months)
- 🎯 v0.5.0 launched (advanced features)
- 🎯 50-100 paying customers
- 🎯 $20,000 MRR
- 🎯 100+ technicians using daily

### By Q3 2026 (3 months)
- 🎯 v1.0.0 launched (enterprise ready)
- 🎯 200+ paying customers
- 🎯 $50,000 MRR
- 🎯 5-10 enterprise customers (50+ technicians each)

---

## 📈 Key Metrics to Track

### Product Metrics
- **Active Organizations**: Organizations using the app monthly
- **Daily Active Technicians**: Technicians checking in daily
- **Jobs Completed**: Total jobs marked complete
- **Photo Uploads**: Average photos per job
- **Offline Usage**: % of jobs completed offline
- **Feature Adoption**: % using inventory, AMC, etc.

### Business Metrics
- **MRR** (Monthly Recurring Revenue)
- **Churn Rate**: % customers canceling monthly
- **ARPU** (Average Revenue Per User)
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)
- **Conversion Rate**: Waitlist → Paid

### Technical Metrics
- **Page Load Time**: <3s for all pages
- **API Response Time**: <500ms for 95% of requests
- **Uptime**: >99.5%
- **Error Rate**: <1% of requests
- **Mobile App Score**: >90 on Lighthouse

---

## 🚧 Known Limitations & Trade-offs

### Current Architecture Decisions
- **Next.js Pages Router**: Will migrate to App Router in future for better performance
- **Simple password admin auth**: Will replace with proper RBAC in v0.2.0
- **Supabase Auth Helpers**: Deprecated, will migrate to @supabase/ssr
- **No native apps**: PWA only for now, native apps in v2.0+

### Intentional Simplifications (MVP)
- No customer portal (customers can't log in)
- No advanced reporting (basic analytics only)
- No integrations (Tally, Zoho, etc.)
- No WhatsApp notifications (email only)
- No multi-language support (English only)

These will be addressed in future releases.

---

## 🤝 Feedback & Prioritization

### How Features Are Prioritized

1. **Customer Requests**: What paying customers ask for
2. **Business Impact**: Features that drive revenue/retention
3. **Technical Debt**: Stability and performance
4. **Competitive Gaps**: Features competitors have
5. **Vision Alignment**: Long-term product strategy

### How to Request Features

- **Pilot Customers**: Email feedback directly
- **Paying Customers**: Support portal (future)
- **Waitlist**: Use contact form
- **GitHub**: Open feature request issue (public repo)

---

## 📅 Release Calendar

| Month | Version | Focus |
|-------|---------|-------|
| Nov 2025 | v0.1.0 | ✅ Landing & Marketing |
| Dec 2025 | v0.2.0 | 🎯 Auth & Core App |
| Jan 2026 | v0.3.0 | 🎯 Offline PWA |
| Feb 2026 | v0.4.0 | 🎯 Payments |
| Mar 2026 | v0.5.0 | 🎯 Advanced Features |
| Apr 2026 | v0.6.0 | 🎯 Collaboration |
| May 2026 | v1.0.0 | 🎯 Enterprise Ready |

---

## 🎉 Milestones

- [x] **Milestone 1**: Landing page live (Nov 2025)
- [ ] **Milestone 2**: First pilot customer onboarded (Dec 2025)
- [ ] **Milestone 3**: First paying customer (Feb 2026)
- [ ] **Milestone 4**: $5,000 MRR (Mar 2026)
- [ ] **Milestone 5**: 100 paying customers (May 2026)
- [ ] **Milestone 6**: $50,000 MRR (Q3 2026)
- [ ] **Milestone 7**: First enterprise customer (Q3 2026)

---

**Last Updated**: November 11, 2025
**Next Review**: End of v0.2.0 development
