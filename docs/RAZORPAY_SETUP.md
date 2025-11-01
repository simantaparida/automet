# Razorpay Setup Guide

This guide covers setting up Razorpay for payment processing and subscriptions in Automet.

## Prerequisites

- Business email address
- Indian bank account (for production/live mode)
- Basic business information

---

## Step 1: Create Razorpay Account

### 1.1 Sign Up

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click **"Sign Up"** (top-right)
3. Fill in:
   - **Email**: Your business email
   - **Password**: Strong password
   - **Mobile**: Indian mobile number (+91)
4. Click **"Sign Up"**
5. Verify your email and mobile number

### 1.2 Complete Business Profile (Optional for Test Mode)

For **Test Mode**, you can skip KYC and start immediately.

For **Live Mode** (production), you'll need:
- PAN card
- Business registration documents
- Bank account details
- GSTIN (if applicable)

**For MVP, we'll use Test Mode only.**

---

## Step 2: Get API Keys

### 2.1 Navigate to API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings** (gear icon, bottom-left) → **API Keys**

### 2.2 Generate Test Keys

1. You'll see two tabs: **Test Mode** and **Live Mode**
2. Stay on **Test Mode** tab
3. If keys don't exist, click **"Generate Test Keys"**
4. You'll get:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (click "Show" to reveal)

### 2.3 Copy Keys

**Important:** Copy both values immediately:

- **Key ID**: `rzp_test_xxxxxxxxxxxxx`
- **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Never share or commit Key Secret to Git!**

### 2.4 Add to .env.local

Open `.env.local` and add:

```bash
RZ_KEY_ID=rzp_test_xxxxxxxxxxxxx
RZ_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3: Create Subscription Plans

Razorpay requires plans to be created in the dashboard for subscriptions.

### 3.1 Navigate to Subscriptions

1. From left menu, go to **Subscriptions** → **Plans**

### 3.2 Create Free Plan

1. Click **"+ Create Plan"**
2. Fill in:

| Field | Value |
|-------|-------|
| **Plan Name** | `Automet Free Plan` |
| **Plan Description** | `Free tier with 5 users and 50 jobs/month` |
| **Billing Interval** | `Monthly` |
| **Billing Amount** | `0` INR |
| **Plan Currency** | `INR` |

3. Advanced settings:
   - **Trial period**: (Optional) 0 days
   - **Addons**: (Optional) None

4. Click **"Create Plan"**
5. **Copy the Plan ID** (e.g., `plan_xxxxxxxxxxxxx`)

### 3.3 Create Pro Plan

1. Click **"+ Create Plan"** again
2. Fill in:

| Field | Value |
|-------|-------|
| **Plan Name** | `Automet Pro Plan` |
| **Plan Description** | `Unlimited users, jobs, and advanced features` |
| **Billing Interval** | `Monthly` |
| **Billing Amount** | `999` INR (₹999/month) |
| **Plan Currency** | `INR` |

3. Click **"Create Plan"**
4. **Copy the Plan ID** (e.g., `plan_yyyyyyyyyyyyy`)

### 3.4 Create Annual Pro Plan (Optional)

Repeat for annual billing:
- **Plan Name**: `Automet Pro Plan (Annual)`
- **Billing Interval**: `Yearly`
- **Billing Amount**: `9999` INR (₹9,999/year - save ₹2,000)

### 3.5 Save Plan IDs

You'll need these Plan IDs for your seed data:

```bash
# Add to your notes or seed scripts:
FREE_PLAN_ID=plan_xxxxxxxxxxxxx
PRO_MONTHLY_PLAN_ID=plan_yyyyyyyyyyyyy
PRO_ANNUAL_PLAN_ID=plan_zzzzzzzzzzzzz
```

**Update seed file** `seeds/001_seed_plans.sql` with actual Plan IDs later.

---

## Step 4: Configure Webhooks

Webhooks notify your app when payments succeed/fail, subscriptions activate, etc.

### 4.1 Navigate to Webhooks

1. Go to **Settings** → **Webhooks**

### 4.2 For Local Development (ngrok)

Since webhooks need a public URL, use **ngrok** to expose localhost:

#### Install ngrok:

```bash
npm install -g ngrok
# or
brew install ngrok  # macOS
```

#### Start your dev server:

```bash
npm run dev
```

#### In another terminal, start ngrok:

```bash
ngrok http 3000
```

You'll get a public URL like:
```
https://a1b2c3d4.ngrok.io
```

#### Add ngrok webhook:

1. In Razorpay Dashboard, click **"+ Add New Webhook"**
2. Fill in:
   - **Webhook URL**: `https://a1b2c3d4.ngrok.io/api/webhooks/razorpay`
   - **Secret**: Generate a random secret (e.g., `whsec_xxxxxxxxx`)
   - **Alert Email**: Your email (for webhook failures)

3. **Select Events** to receive:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `subscription.activated`
   - ✅ `subscription.charged`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.paused`
   - ✅ `subscription.resumed`

4. Click **"Create Webhook"**

5. **Copy the Webhook Secret** (you just generated it)

### 4.3 For Production (Vercel)

When deploying to production:

1. Use your production URL:
   - **Webhook URL**: `https://automet.app/api/webhooks/razorpay`
   - **Secret**: Same as dev (or generate new one)

2. Add to Vercel Environment Variables:
   - `RZ_WEBHOOK_SECRET` → (your webhook secret)

### 4.4 Add Webhook Secret to .env.local

```bash
RZ_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
```

---

## Step 5: Test Payment Integration

### 5.1 Use Test Cards

Razorpay provides test cards for development:

#### Successful Payment:
- **Card Number**: `4111 1111 1111 1111` (Visa)
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name

#### Failed Payment:
- **Card Number**: `4000 0000 0000 0002`
- **CVV**: `123`
- **Expiry**: `12/25`

#### More test cards:
- [Razorpay Test Cards Documentation](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

### 5.2 Test Checkout Flow

1. In your app, initiate a payment:
   ```javascript
   // Example: Subscribe to Pro Plan
   const options = {
     key: process.env.RZ_KEY_ID,
     amount: 99900, // ₹999 in paise
     currency: 'INR',
     name: 'Automet',
     description: 'Pro Plan Subscription',
     order_id: 'order_xxxxx', // from Razorpay Orders API
     handler: function(response) {
       console.log('Payment ID:', response.razorpay_payment_id);
     },
   };
   const rzp = new Razorpay(options);
   rzp.open();
   ```

2. Use test card to complete payment
3. Check webhook endpoint receives `payment.captured` event

### 5.3 Verify Webhook Delivery

1. Go to Razorpay Dashboard → **Webhooks**
2. Click on your webhook
3. View **Recent Deliveries**
4. Check:
   - ✅ Status: 200 OK
   - ✅ Response time < 5s
   - ❌ If failed, check error logs

---

## Step 6: (Optional) Enable UPI, Netbanking, Wallets

Razorpay supports multiple payment methods:

### 6.1 Navigate to Payment Methods

1. Go to **Settings** → **Configuration** → **Payment Methods**

### 6.2 Enable Methods

- ✅ **Cards** (enabled by default)
- ✅ **UPI** (enable for Indian users)
- ✅ **Netbanking** (enable major banks)
- ✅ **Wallets** (Paytm, PhonePe, etc.)

**For Test Mode**, all methods are available automatically.

**For Live Mode**, some methods require KYC completion.

---

## Step 7: Security Best Practices

### 7.1 Webhook Signature Verification

**Always verify webhook signatures** to prevent fake webhook calls.

Example in your webhook handler:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

// In your webhook handler:
const signature = req.headers['x-razorpay-signature'];
const isValid = verifyWebhookSignature(
  JSON.stringify(req.body),
  signature,
  process.env.RZ_WEBHOOK_SECRET
);

if (!isValid) {
  return res.status(400).json({ error: 'Invalid signature' });
}
```

### 7.2 Never Store Card Details

⚠️ **Never store raw card numbers, CVV, or expiry dates.**

Razorpay handles all sensitive data. You only store:
- ✅ Payment IDs
- ✅ Order IDs
- ✅ Customer IDs
- ✅ Payment status
- ✅ Amount

### 7.3 Use Server-Side API Calls

❌ **Don't call Razorpay API from browser with Key Secret**

✅ **Always use server-side routes:**

```
Browser → Your API Route → Razorpay API
```

---

## Troubleshooting

### Webhook not receiving events

**Check:**
1. ngrok is running and URL is correct
2. Webhook URL ends with `/api/webhooks/razorpay`
3. Events are selected in Razorpay Dashboard
4. Your dev server is running
5. Firewall/antivirus not blocking ngrok

**Debug:**
- Check Razorpay Dashboard → Webhooks → Recent Deliveries
- Look for error messages (e.g., "Connection refused", "Timeout")
- Check your API logs for incoming requests

### Payment fails with "Key ID is invalid"

**Cause:** Using wrong Key ID or Live key in Test mode.

**Fix:**
1. Verify `RZ_KEY_ID` starts with `rzp_test_`
2. Check `.env.local` has no typos or extra spaces
3. Restart dev server after changing env vars

### Webhook signature verification fails

**Cause:** Secret mismatch or body modification.

**Fix:**
1. Ensure `RZ_WEBHOOK_SECRET` matches Razorpay Dashboard
2. Use raw body (don't parse JSON before verification)
3. Check for middleware that modifies request body

### Test cards not working

**Ensure:**
- You're in **Test Mode** (check Razorpay dashboard top-right toggle)
- Using correct test card numbers from Razorpay docs
- Card expiry is in the future

---

## Switching to Live Mode (Production)

**When ready for production:**

1. **Complete KYC** in Razorpay Dashboard
2. **Activate account** with bank details
3. **Generate Live Keys**:
   - Go to Settings → API Keys → **Live Mode** tab
   - Generate keys (starts with `rzp_live_`)
4. **Update environment variables**:
   - Production: Use `rzp_live_` keys
   - Dev/Test: Keep `rzp_test_` keys
5. **Update webhook URL** to production domain
6. **Recreate subscription plans** in Live Mode
7. **Test with real card** (small amount, refund after)

---

## Next Steps

- ✅ Razorpay account created
- ✅ API keys added to `.env.local`
- ✅ Subscription plans created
- ✅ Webhooks configured

**Continue to:**
- [Complete Setup Guide](./SETUP.md)
- Run migrations and test the app

---

## Useful Links

- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Subscriptions Guide](https://razorpay.com/docs/payments/subscriptions/)
- [Webhooks Guide](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Node.js SDK](https://razorpay.com/docs/payments/server-integration/nodejs/)
