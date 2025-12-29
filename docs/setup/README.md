# Setup Documentation

This folder contains all setup guides for BiteLing's various integrations and services.

## Quick Start Guides

### Core Services (Required)
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Set up Firebase for authentication and database
- **[FIREBASE_SECURITY_RULES.md](FIREBASE_SECURITY_RULES.md)** - Configure Firebase security rules

### Content Services (Optional)
- **[YOUTUBE_SETUP.md](YOUTUBE_SETUP.md)** - Enable YouTube video integration for the Watch feature

### Email Services (Optional - Choose One)
- **[EMAILJS_QUICK_SETUP.md](EMAILJS_QUICK_SETUP.md)** ⭐ **Recommended** - Send friend invitations automatically (5 min setup)
- **[WEB3FORMS_SETUP.md](WEB3FORMS_SETUP.md)** - Alternative email service (30 sec setup, no account needed)
- **[FRIEND_INVITATION_EMAIL_SETUP.md](FRIEND_INVITATION_EMAIL_SETUP.md)** - Detailed comparison of all email options

### Deployment
- **[VERCEL_QUICK_SETUP.md](VERCEL_QUICK_SETUP.md)** - Deploy to Vercel in 2 minutes
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Detailed Vercel deployment guide

### Reference
- **[API_KEY_SETUP_SUMMARY.md](API_KEY_SETUP_SUMMARY.md)** - Overview of all API keys needed

## Setup Order

For a new installation, follow this order:

1. **Firebase** (Required for user accounts)
   - Follow `FIREBASE_SETUP.md`
   - Apply rules from `FIREBASE_SECURITY_RULES.md`

2. **YouTube API** (Optional, for Watch feature)
   - Follow `YOUTUBE_SETUP.md`

3. **Email Service** (Optional, for friend invitations)
   - Choose one: `EMAILJS_QUICK_SETUP.md` or `WEB3FORMS_SETUP.md`

4. **Deploy** (When ready to go live)
   - Follow `VERCEL_QUICK_SETUP.md`

## Local vs Production

All setup guides explain how to configure services for both:
- **Local Development** - Uses `*.local.js` config files (gitignored)
- **Production** - Uses Vercel environment variables

## Need Help?

Check the main [README.md](../../README.md) in the project root for:
- Project overview
- Feature list
- Development workflow
- Contributing guidelines
