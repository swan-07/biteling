# Web3Forms Setup Guide (EmailJS Alternative)

Web3Forms is easier to set up - no bot protection issues, and it works great for sending emails!

## Step 1: Get Your Access Key (30 seconds!)

1. Go to https://web3forms.com/
2. Scroll down to **"Get Started Free"**
3. Enter your email address
4. Click **"Get Access Key"**
5. Check your email - you'll receive your Access Key instantly
6. **Copy the Access Key** (looks like: `abcd1234-5678-90ef-ghij-klmnopqrstuv`)

That's it! No account creation, no bot protection, no verification hassles.

**Free tier includes:**
- 250 emails/month
- No credit card required
- Instant setup

---

## Step 2: Configure BiteLing

1. In your BiteLing project folder, create a new file:
   ```bash
   touch web3forms-config.local.js
   ```

2. Open `web3forms-config.local.js` and add:
   ```javascript
   window.WEB3FORMS_CONFIG = {
       accessKey: 'your-access-key-here'  // Paste the key from your email
   };
   ```

3. Save the file

**Note:** This file is already in `.gitignore` so your key won't be committed!

---

## Step 3: Test It Out!

1. Start your local server
2. Sign in to BiteLing
3. Go to Account page
4. Click **"+"** to add a friend
5. Enter any email address
6. Submit

You should see:
- ✅ Success message
- ✅ Console: `"✅ Invitation email sent to [email]"`
- ✅ Email delivered within seconds!

---

## How the Email Looks

**Subject:** `[Your Email] invited you to BiteLing!`

**Body:**
```
Hi there!

[Your Email] is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin!

Join now to connect with your friend and start learning Chinese together.

Visit: https://biteling.vercel.app/

---
BiteLing - Learn Mandarin, One Bite at a Time 🍪
```

---

## Troubleshooting

### "Failed to send email" error
1. Check that your Access Key is correct in `web3forms-config.local.js`
2. Make sure there are no extra spaces or quotes
3. Refresh the browser

### Email not arriving
- Check spam folder
- Web3Forms emails come from `noreply@web3forms.com`
- May take 1-2 minutes on first send

### Hit the 250/month limit?
- Upgrade for $5/month (1000 emails)
- Or switch to EmailJS/SendGrid

---

## Advantages of Web3Forms

✅ **No bot protection** - just enter your email, get the key
✅ **Instant setup** - 30 seconds total
✅ **No account creation** - no password, no login
✅ **Simple integration** - one API key, that's it
✅ **Reliable delivery** - professional email service

---

**You're all set! Friend invitations will now send automatically! 🎉**
