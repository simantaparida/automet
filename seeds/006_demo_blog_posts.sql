-- Seed: Demo blog posts for landing page
-- Created: 2025-11-03
-- Description: Sample blog posts for landing page blog section

BEGIN;

-- Insert blog posts (idempotent - only if they don't exist)
INSERT INTO blog_posts (id, slug, title, excerpt, content, author_name, category, tags, published, published_at, cover_image_url)
VALUES
  (
    '90000000-0000-0000-0000-000000000001',
    'welcome-to-automet',
    'Welcome to Automet - The Future of AMC Management',
    'Discover how Automet is transforming field service management for Indian AMC vendors with mobile-first technology.',
    E'# Welcome to Automet\n\n## Why We Built Automet\n\nAfter talking to hundreds of AMC vendors across India, we discovered a common problem: managing field operations is chaotic.\n\n### The Problems We Heard\n\n- **Paper-based tracking**: Job sheets get lost, damaged, or misplaced\n- **WhatsApp chaos**: Coordinating via WhatsApp groups leads to missed messages\n- **No visibility**: Business owners don''t know where technicians are\n- **Warranty tracking nightmares**: Missing AMC renewal dates costs money\n- **Inventory confusion**: Not knowing what''s in stock leads to emergency purchases\n\n### Our Solution\n\nAutomet is a **mobile-first Progressive Web App** built specifically for Indian AMC vendors. It works offline, syncs when online, and can be installed like a native app.\n\n**Key Features:**\n\n1. **Job Management** - Track every field job from assignment to completion\n2. **Real-time Location** - Know where your technicians are\n3. **Asset Tracking** - Never miss a warranty or AMC renewal\n4. **Inventory Management** - Real-time stock visibility\n5. **Client Database** - All customer info in one place\n6. **Works Offline** - Technicians can work without internet\n\n### Built for India\n\n- ₹ Rupee pricing, no hidden costs\n- Works on budget Android phones\n- Lightweight and fast even on 3G\n- Indian support team\n- Local payment methods (UPI, Cards, Net Banking)\n\n### What''s Next?\n\nWe''re launching in **February 2026**. Early adopters who book now for ₹499 get:\n\n- 6 months Pro plan FREE (worth ₹5,994)\n- Lifetime 30% discount\n- Priority support\n- Beta access 2 weeks before launch\n\n[Book Your Early Access →](/)\n\n---\n\n*Have questions? Email us at hello@automet.in*',
    'Automet Team',
    'product-updates',
    ARRAY['launch', 'product', 'amc'],
    TRUE,
    NOW() - INTERVAL '7 days',
    '/images/blog/welcome.jpg'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    '5-challenges-indian-amc-vendors-face',
    '5 Challenges Indian AMC Vendors Face (And How to Solve Them)',
    'From WhatsApp chaos to warranty tracking nightmares - here are the biggest problems AMC vendors face and practical solutions.',
    E'# 5 Challenges Indian AMC Vendors Face\n\n## Introduction\n\nRunning an AMC business in India comes with unique challenges. Based on interviews with 200+ AMC vendors, here are the top 5 problems and how to solve them.\n\n---\n\n## Challenge 1: Paper-Based Job Tracking\n\n### The Problem\nMost AMC vendors still use paper job sheets. These get:\n- Lost or damaged in the field\n- Illegible due to poor handwriting\n- Difficult to track and archive\n- Impossible to analyze for insights\n\n### The Solution\n**Go Digital with Mobile Forms**\n\n- Use a mobile app for job tracking\n- Capture photos, signatures digitally\n- Auto-sync to cloud for backup\n- Generate reports instantly\n\n---\n\n## Challenge 2: Technician Coordination Chaos\n\n### The Problem\nCoordinating technicians via WhatsApp groups leads to:\n- Messages getting lost in chat noise\n- Confusion about who''s assigned to what\n- No accountability or audit trail\n- Difficulty tracking work hours\n\n### The Solution\n**Structured Job Assignment System**\n\n- Assign jobs through a proper system\n- Real-time status updates\n- GPS tracking for location visibility\n- Check-in/check-out for time tracking\n\n---\n\n## Challenge 3: Missing Warranty & AMC Renewals\n\n### The Problem\nTracking warranty expiry dates manually means:\n- Missing renewal opportunities\n- Customers calling angry about expired AMCs\n- Lost revenue from renewals\n- Poor customer experience\n\n### The Solution\n**Automated Reminder System**\n\n- Digital asset database with warranty dates\n- Automatic reminders 30/15/7 days before expiry\n- One-click renewal quotes\n- Historical maintenance records\n\n---\n\n## Challenge 4: Inventory Visibility Issues\n\n### The Problem\nNot knowing what''s in stock leads to:\n- Emergency purchases at higher prices\n- Overstocking of slow-moving items\n- Technicians waiting for parts\n- Customer dissatisfaction due to delays\n\n### The Solution\n**Real-time Inventory Tracking**\n\n- Track stock in/out movements\n- Low stock alerts\n- Usage reports by item\n- Reorder level management\n\n---\n\n## Challenge 5: No Business Insights\n\n### The Problem\nWithout data, you can''t:\n- Identify your most profitable clients\n- Track technician productivity\n- Forecast revenue\n- Make data-driven decisions\n\n### The Solution\n**Analytics & Reporting**\n\n- Job completion dashboards\n- Revenue tracking by client\n- Technician performance metrics\n- Monthly/quarterly reports\n\n---\n\n## How Automet Helps\n\nAutomet solves all 5 challenges in one platform:\n\n✓ Digital job tracking with mobile app\n✓ Structured technician assignment\n✓ Automatic warranty/AMC reminders\n✓ Real-time inventory management\n✓ Built-in analytics & reports\n\n**Special Launch Offer**: Book early access for ₹499 and get 6 months Pro plan FREE.\n\n[Reserve Your Spot →](/)\n\n---\n\n*Questions? Reach out at hello@automet.in*',
    'Rajesh Kumar',
    'industry-insights',
    ARRAY['challenges', 'solutions', 'amc-business'],
    TRUE,
    NOW() - INTERVAL '3 days',
    '/images/blog/challenges.jpg'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    'digital-transformation-guide-amc-vendors',
    'Going Digital: A Complete Guide for AMC Business Owners',
    'Step-by-step guide to transitioning your AMC business from paper-based operations to digital field service management.',
    E'# Going Digital: A Guide for AMC Vendors\n\n## Why Go Digital?\n\nThe COVID-19 pandemic accelerated digital adoption across industries. AMC businesses that went digital saw:\n\n- **40% faster job completion**\n- **25% cost reduction** in operations\n- **60% better customer satisfaction**\n- **3x more AMC renewals**\n\n## The Roadmap\n\n### Phase 1: Assessment (Week 1)\n\n**Document Your Current Process**\n\n1. Map out your job workflow\n2. List all forms and paperwork\n3. Identify pain points\n4. Talk to your team\n\n**Questions to Ask:**\n- How many jobs do we handle monthly?\n- How many technicians do we have?\n- What''s our average response time?\n- How do we track customer complaints?\n\n### Phase 2: Tool Selection (Week 2)\n\n**What to Look For in Field Service Software**\n\n✓ **Mobile-first design** - Works on smartphones\n✓ **Offline capability** - Works without internet\n✓ **Easy to use** - Minimal training needed\n✓ **Affordable** - Fits your budget\n✓ **Indian support** - Local customer service\n\n**Red Flags to Avoid:**\n\n✗ Complex enterprise software\n✗ Requires expensive hardware\n✗ Long implementation timelines\n✗ Hidden costs and fees\n\n### Phase 3: Data Migration (Week 3-4)\n\n**Getting Your Data Digital**\n\n1. **Client Database**\n   - Company names and contacts\n   - Addresses with Google Maps links\n   - Phone numbers and emails\n\n2. **Site Information**\n   - Client locations\n   - GPS coordinates\n   - Site-specific notes\n\n3. **Asset Inventory**\n   - Equipment type and models\n   - Serial numbers\n   - Purchase and warranty dates\n   - AMC expiry dates\n\n**Pro Tip**: Start with your top 20% clients (80/20 rule). Add the rest gradually.\n\n### Phase 4: Team Training (Week 4-5)\n\n**Training Your Technicians**\n\n1. **Start with champions** - Train 2-3 tech-savvy technicians first\n2. **Hands-on practice** - Let them use the app on dummy jobs\n3. **Buddy system** - Pair new users with champions\n4. **Continuous support** - Daily check-ins during first week\n\n**Training Checklist:**\n- ✓ How to view assigned jobs\n- ✓ How to check-in at a site\n- ✓ How to update job status\n- ✓ How to add photos\n- ✓ How to mark job complete\n- ✓ How to update inventory\n\n### Phase 5: Parallel Run (Week 5-6)\n\n**Running Old + New Systems Together**\n\n- Keep paper system as backup\n- Use digital for new jobs\n- Compare results daily\n- Fix issues immediately\n\n**Metrics to Track:**\n- Job completion rate\n- Technician adoption rate\n- Customer feedback\n- System downtime\n\n### Phase 6: Full Switchover (Week 7+)\n\n**Going All-In**\n\nOnce you''re confident:\n- Stop paper job sheets\n- Digital-only assignments\n- Archive old paperwork\n- Celebrate with team!\n\n## Common Mistakes to Avoid\n\n### Mistake 1: Big Bang Approach\n**Don''t**: Try to digitize everything at once\n**Do**: Start small, expand gradually\n\n### Mistake 2: Ignoring Change Management\n**Don''t**: Force new system without explanation\n**Do**: Involve team in decision, address concerns\n\n### Mistake 3: No Backup Plan\n**Don''t**: Go digital with no fallback\n**Do**: Keep paper backup during transition\n\n### Mistake 4: Choosing Complex Software\n**Don''t**: Pick enterprise software for small team\n**Do**: Choose simple, intuitive tools\n\n## ROI Calculator\n\n**Time Saved Per Month:**\n- Job sheet paperwork: 20 hours\n- Status calls to technicians: 15 hours\n- Manual reporting: 10 hours\n- Inventory reconciliation: 8 hours\n- **Total**: 53 hours/month\n\n**Cost Savings:**\n- Reduced paperwork: ₹5,000\n- Faster job completion: ₹15,000\n- Fewer missed renewals: ₹25,000\n- **Total**: ₹45,000/month\n\n**Investment in Digital Tool:**\n- Automet Pro: ₹999/month\n- **Net Savings**: ₹44,000/month\n- **ROI**: 4,400%\n\n## Success Story\n\n> "We were skeptical about going digital. But after using Automet for 3 months, we can''t imagine going back. Our technicians love the GPS navigation, and we love seeing real-time job status. Best decision for our business."\n> \n> **- Suresh Patel, Patel Fire Safety Services, Ahmedabad**\n\n## Ready to Start?\n\nAutomet is launching in February 2026 with a special early bird offer:\n\n**₹499 one-time payment gets you:**\n- 6 months Pro plan FREE (₹5,994 value)\n- Lifetime 30% discount on subscription\n- Priority onboarding support\n- Beta access 2 weeks early\n\n[Book Your Early Access Now →](/)\n\n---\n\n## Need Help?\n\nDigital transformation can feel overwhelming. We''re here to help!\n\n📧 Email: hello@automet.in\n📞 WhatsApp: +91-XXXXXXXXXX\n\n*Our team will guide you through every step.*',
    'Priya Sharma',
    'best-practices',
    ARRAY['digital-transformation', 'guide', 'how-to'],
    TRUE,
    NOW() - INTERVAL '1 day',
    '/images/blog/digital-transformation.jpg'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verification query
SELECT
  slug,
  title,
  category,
  published,
  TO_CHAR(published_at, 'YYYY-MM-DD') as published_date
FROM blog_posts
ORDER BY published_at DESC;
