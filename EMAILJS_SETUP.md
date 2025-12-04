# EmailJS Setup Guide (FREE Alternative)

This guide shows you how to set up **FREE** email notifications using EmailJS instead of Firebase Cloud Functions (which requires a paid plan).

## Why EmailJS?
- **100% Free** for up to 200 emails/month
- No credit card required
- No backend/server needed
- Works directly from your React app

---

## Step 1: Sign Up for EmailJS

1. Go to https://www.emailjs.com/
2. Click **"Sign Up Free"**
3. Create your account (use Google/GitHub or email)

---

## Step 2: Connect Your Gmail Account

1. After signing in, go to **Email Services**
2. Click **"Add New Service"**
3. Select **Gmail**
4. Click **"Connect Account"** and authorize EmailJS to send emails from your Gmail
5. Give it a name like "BudgetBuddy Notifications"
6. **Copy the Service ID** (looks like `service_xxxxxxx`)

---

## Step 3: Create an Email Template

1. Go to **Email Templates**
2. Click **"Create New Template"**
3. Set up the template:

   **Template Name:** `budget_notification`

   **To Email:** (IMPORTANT - Click "To Email" field and enter)
   ```
   {{to_email}}
   ```

   **Subject:**
   ```
   {{subject}}
   ```

   **Content (Body):**
   ```
   {{message}}

   ---
   This notification was sent from BudgetBuddy
   ```

4. **IMPORTANT:** Make sure the "To Email" field contains `{{to_email}}` (with double curly braces)
5. **Save the template**
6. **Copy the Template ID** (looks like `template_xxxxxxx`)

---

## Step 4: Get Your Public Key

1. Go to **Account** > **General** tab
2. Find your **Public Key** (looks like a random string)
3. **Copy the Public Key**

---

## Step 5: Configure Your App

Create a `.env` file in your project root (if it doesn't exist):

```bash
# .env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace the values with your actual IDs from EmailJS.

**IMPORTANT:** The `.env` file is already in `.gitignore` so your keys won't be committed to Git.

---

## Step 6: Restart Your App

```bash
npm start
```

---

## Testing the Notifications

1. Make sure **Email Notifications** are enabled in the app (Settings > Notifications)
2. Add a transaction over $100 → You should get an email!
3. Add transactions to reach 50%, 75%, 90%, or 100% of a category budget → You'll get budget alerts!

---

## Free Tier Limits

EmailJS Free Plan:
- ✅ **200 emails per month**
- ✅ No credit card required
- ✅ Unlimited templates
- ✅ Unlimited services

This is plenty for personal budget tracking!

---

## Troubleshooting

### Emails not sending?
1. Check your `.env` file has the correct IDs
2. Make sure you restarted the app after creating `.env`
3. Check browser console for errors
4. Verify Email Notifications are enabled in Settings

### Gmail blocking emails?
1. Make sure you authorized EmailJS in your Google Account
2. Check your Gmail "Sent" folder to confirm emails are sending
3. Check spam folder on the receiving end

---

## Cost Comparison

| Service | Free Tier | Paid Plan Required? |
|---------|-----------|---------------------|
| **EmailJS** | 200 emails/month | ❌ No |
| Firebase Functions | Limited free tier | ✅ Yes (Blaze plan) |
| SendGrid | 100 emails/day | ❌ No |
| Brevo (Sendinblue) | 300 emails/day | ❌ No |

**EmailJS is perfect for personal use and completely free!**
