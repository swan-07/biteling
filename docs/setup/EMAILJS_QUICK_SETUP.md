# EmailJS Quick Setup Guide

Follow these steps to enable automatic friend invitation emails (no backend required!).

## Step 1: Sign Up for EmailJS

1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

**Free tier includes:**
- 200 emails/month
- No credit card required
- Perfect for starting out!

---

## Step 2: Add an Email Service

1. In the EmailJS dashboard, click **"Email Services"** in the left sidebar
2. Click **"Add New Service"**
3. Choose your email provider (Gmail recommended):
   - **Gmail**: Easy to set up, works with personal accounts
   - **Outlook**: Good if you use Microsoft
   - **Other**: Most email providers supported
4. Click **"Connect Account"** and authorize EmailJS
5. **Copy your Service ID** (e.g., `service_abc123`) - you'll need this later!

---

## Step 3: Create an Email Template

1. Click **"Email Templates"** in the left sidebar
2. Click **"Create New Template"**
3. Fill in the template:

### Template Settings:
- **Template Name**: `BiteLing Friend Invitation`

### Email Content:

**Subject:**
```
{{from_email}} invited you to BiteLing!
```

**Content (text version):**
```
Hi there!

{{from_email}} is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin Chinese!

Join now to connect with your friend and start learning together.

Get started: {{app_url}}

---
BiteLing - Learn Mandarin, One Bite at a Time 🍪
```

**Content (HTML version):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #FFFBF7; border-radius: 12px;">
    <h2 style="color: #6B5D4F; margin-bottom: 10px;">You've been invited to BiteLing! 🍪</h2>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
        <strong>{{from_email}}</strong> is adding you as a friend on <strong>BiteLing</strong>,
        the best and easiest way to learn Mandarin Chinese!
    </p>

    <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Join now to connect with your friend and start learning together.
    </p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{app_url}}"
           style="display: inline-block;
                  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;">
            Join BiteLing
        </a>
    </div>

    <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
        BiteLing - Learn Mandarin, One Bite at a Time 🍪
    </p>
</div>
```

4. Click **"Save"**
5. **Copy your Template ID** (e.g., `template_xyz789`) - you'll need this!

---

## Step 4: Get Your Public Key

1. Click on your account name in the top right
2. Select **"Account"**
3. Go to the **"API Keys"** tab
4. **Copy your Public Key** (e.g., `abc123XYZ456`)

---

## Step 5: Configure BiteLing

1. In your BiteLing project folder, create a new file:
   ```bash
   touch emailjs-config.local.js
   ```

2. Open `emailjs-config.local.js` and add your credentials:
   ```javascript
   window.EMAILJS_CONFIG = {
       serviceId: 'service_abc123',      // Your Service ID from Step 2
       templateId: 'template_xyz789',    // Your Template ID from Step 3
       publicKey: 'abc123XYZ456'         // Your Public Key from Step 4
   };
   ```

3. Save the file

**Note:** The file `emailjs-config.local.js` is already in `.gitignore` so your API keys won't be committed to Git!

---

## Step 6: Test It Out!

1. Start your local server
2. Sign in to BiteLing
3. Go to your Account page
4. Click the **"+"** button to add a friend
5. Enter an email address (use your own for testing!)
6. Submit

You should see:
- ✅ A success message in the browser
- ✅ Console log: `"✅ Invitation email automatically sent to [email]"`
- ✅ An email in your inbox within seconds!

**Check your spam folder** if you don't see it immediately.

---

## Troubleshooting

### "EmailJS is not defined" error
- Make sure the EmailJS library loaded correctly
- Check that `emailjs-config.local.js` exists
- Refresh the page

### Email not sending
1. Check your EmailJS dashboard > Logs to see what happened
2. Verify all three credentials are correct (Service ID, Template ID, Public Key)
3. Make sure template variables match: `{{to_email}}`, `{{from_email}}`, `{{app_url}}`

### Emails go to spam
- This is normal for new accounts
- Recipients should mark as "Not Spam"
- After a few successful sends, deliverability improves

### Hit the 200/month limit?
- Upgrade to paid plan ($7/month for 1,000 emails)
- Or use Firebase Cloud Functions (see `FRIEND_INVITATION_EMAIL_SETUP.md`)

---

## What Happens Now?

✅ **With EmailJS configured:**
- Friend invitations send **automatically**
- No mailto popup
- Emails arrive in seconds
- You get 200 free emails/month

❌ **Without EmailJS configured:**
- Falls back to mailto link
- User must manually send
- Still works, but less convenient

---

## Need Help?

- EmailJS docs: https://www.emailjs.com/docs/
- BiteLing issues: https://github.com/anthropics/claude-code/issues

---

**That's it! Your friend invitations are now fully automatic! 🎉**
