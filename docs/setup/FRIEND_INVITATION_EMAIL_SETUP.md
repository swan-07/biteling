# Friend Invitation Email Setup

Currently, friend invitations open a mailto link which requires users to manually send the email. To make this automatic, you need to set up a backend email service.

## Options for Automatic Email Sending

### Option 1: Firebase Cloud Functions + SendGrid (Recommended)

**Pros:**
- Fully automatic email sending
- Professional email service
- Free tier: 100 emails/day
- Easy integration with Firebase

**Setup Steps:**

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase Functions:**
   ```bash
   firebase init functions
   # Choose JavaScript or TypeScript
   # Install dependencies when prompted
   ```

3. **Sign up for SendGrid:**
   - Go to https://sendgrid.com/
   - Create free account (100 emails/day)
   - Get your API key from Settings > API Keys

4. **Install SendGrid in functions:**
   ```bash
   cd functions
   npm install @sendgrid/mail
   ```

5. **Set SendGrid API key:**
   ```bash
   firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
   ```

6. **Create the Cloud Function:**

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendFriendInvitation = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
    }

    const { toEmail, fromEmail } = data;

    // Validate inputs
    if (!toEmail || !fromEmail) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const msg = {
        to: toEmail,
        from: 'noreply@biteling.vercel.app', // Replace with your verified sender
        subject: `${fromEmail} invited you to BiteLing!`,
        text: `${fromEmail} is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin!\n\n` +
              `Join now to connect with your friend and start learning Chinese together!\n\n` +
              `Visit: https://biteling.vercel.app/\n\n` +
              `BiteLing - Learn Mandarin, One Bite at a Time`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited to BiteLing!</h2>
                <p><strong>${fromEmail}</strong> is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin!</p>
                <p>Join now to connect with your friend and start learning Chinese together!</p>
                <a href="https://biteling.vercel.app/"
                   style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Join BiteLing
                </a>
                <p style="color: #666; font-size: 14px;">BiteLing - Learn Mandarin, One Bite at a Time 🍪</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        return { success: true, message: 'Invitation sent!' };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send invitation');
    }
});
```

7. **Deploy the function:**
   ```bash
   firebase deploy --only functions
   ```

8. **Update frontend code:**

In `js/firebase-service.js`, replace the `sendInvitationEmail` function:

```javascript
// Import at the top
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';

// In the FirebaseService class constructor:
this.functions = null;

// In the init() method:
this.functions = getFunctions(this.app);

// Replace sendInvitationEmail method:
async sendInvitationEmail(toEmail, fromEmail) {
    try {
        const sendInvitation = httpsCallable(this.functions, 'sendFriendInvitation');
        const result = await sendInvitation({ toEmail, fromEmail });

        console.log(`Invitation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending invitation email:', error);
        return false;
    }
}
```

---

### Option 2: EmailJS (No Backend Required)

**Pros:**
- No backend/server needed
- Free tier: 200 emails/month
- Works directly from frontend
- Easiest setup

**Setup Steps:**

1. **Sign up at EmailJS:**
   - Go to https://www.emailjs.com/
   - Create free account

2. **Set up email service:**
   - Add an email service (Gmail, Outlook, etc.)
   - Get your Service ID

3. **Create email template:**
   - Create a new template
   - Use these template variables:
     - `{{to_email}}` - recipient
     - `{{from_email}}` - sender
   - Template content:
     ```
     Subject: {{from_email}} invited you to BiteLing!

     {{from_email}} is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin!

     Join now to connect with your friend and start learning Chinese together!

     Visit: https://biteling.vercel.app/

     BiteLing - Learn Mandarin, One Bite at a Time
     ```

4. **Get your credentials:**
   - Service ID
   - Template ID
   - Public Key (from Account > API Keys)

5. **Add EmailJS to your project:**

In `firebase-config.js`, add:

```javascript
window.EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY'
};
```

6. **Load EmailJS library:**

In `pages/account.html`, add before closing `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
    emailjs.init(window.EMAILJS_CONFIG.publicKey);
</script>
```

7. **Update sendInvitationEmail:**

In `js/firebase-service.js`:

```javascript
async sendInvitationEmail(toEmail, fromEmail) {
    try {
        const config = window.EMAILJS_CONFIG;

        if (!config || !window.emailjs) {
            console.warn('EmailJS not configured');
            return false;
        }

        await emailjs.send(config.serviceId, config.templateId, {
            to_email: toEmail,
            from_email: fromEmail,
            app_url: 'https://biteling.vercel.app/'
        });

        console.log(`Invitation email sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending invitation email:', error);
        return false;
    }
}
```

---

### Option 3: Simple Backend API

If you want full control, you can create a simple backend API using:
- Express.js + Nodemailer
- Vercel Serverless Functions
- AWS Lambda + SES

This requires more setup but gives you complete control over email sending.

---

## Which Option Should You Choose?

- **EmailJS** - Best for quick setup, no backend knowledge needed
- **Firebase Cloud Functions + SendGrid** - Best for production, scalable solution
- **Custom Backend** - Best if you need advanced features or already have a backend

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| EmailJS | 200 emails/month | $7/month for 1000 |
| SendGrid | 100 emails/day | $15/month for 40k |
| Firebase Functions | 2M invocations/month | Pay as you go |

## Next Steps

1. Choose your preferred option
2. Follow the setup steps
3. Test with a real email address
4. Update the error messages to inform users their invitation was sent

## Testing

After setup, test by:
1. Adding a friend with an email that doesn't exist in the system
2. Check if the email arrives (check spam folder)
3. Verify the email content looks good
4. Ensure the invitation link works
