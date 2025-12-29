# API Key Setup Summary

Your BiteLing app now supports keeping API keys private in both local development and Vercel deployment!

## ✅ What's Been Set Up

### Local Development (Your Computer)
- **File**: `youtube-config.local.js` ← Your API key goes here
- **Status**: ✅ Already created with your key
- **Git**: Ignored (won't be committed to GitHub)

### Vercel Deployment (Production)
- **Method**: Environment variable + build script
- **Steps**: See [VERCEL_QUICK_SETUP.md](VERCEL_QUICK_SETUP.md)
- **File Generated**: `env-config.js` (auto-created during build)
- **Git**: Also ignored

## 📁 Files Overview

| File | Purpose | Committed to Git? |
|------|---------|------------------|
| `youtube-config.js` | Template with empty values | ✅ Yes (safe) |
| `youtube-config.local.js` | Your local API key | ❌ No (.gitignored) |
| `env-config.js` | Auto-generated on Vercel | ❌ No (.gitignored) |
| `vercel-build.sh` | Builds env-config.js | ✅ Yes |
| `.gitignore` | Protects your keys | ✅ Yes |

## 🔐 How It Works

### Local Development
1. You run the site locally
2. `youtube-config.local.js` loads with your API key
3. Videos work!

### Vercel Deployment
1. You push code to GitHub (API key NOT included)
2. Vercel runs `vercel-build.sh`
3. Build script reads `YOUTUBE_API_KEY` environment variable
4. Creates `env-config.js` with the key
5. Your deployed site works with videos!

## 🎯 Priority Order

The app checks for API keys in this order:
1. `youtube-config.local.js` (local dev)
2. `window.ENV.YOUTUBE_API_KEY` (Vercel)
3. Empty string (shows setup instructions)

## 🚀 Next Steps for Vercel

Since you're already deployed:

1. **Add Environment Variable** in Vercel dashboard:
   - Settings → Environment Variables
   - Name: `YOUTUBE_API_KEY`
   - Value: (your key)

2. **Update Build Command**:
   - Settings → General → Build & Development Settings
   - Build Command: `bash vercel-build.sh`

3. **Redeploy** your site

See full instructions in: [VERCEL_QUICK_SETUP.md](VERCEL_QUICK_SETUP.md)

## 🔒 Security Best Practices

Even with environment variables, client-side API keys are visible in browser source. Protect yours by:

1. **Restrict by Domain** in Google Cloud Console:
   - HTTP referrers: `https://your-site.vercel.app/*`
   - Also add: `http://localhost:*`

2. **Restrict by API**:
   - Only allow "YouTube Data API v3"

3. **Monitor Usage**:
   - Check quota in Google Cloud Console
   - Free tier: 10,000 units/day (~100 searches)

## ✅ Git Safety Checklist

Before you commit and push:
- [ ] `youtube-config.local.js` is NOT in git (check with `git status`)
- [ ] `env-config.js` is NOT in git
- [ ] `youtube-config.js` has empty `apiKey: ''` value
- [ ] `.gitignore` includes both local files

Your API key is safe! 🎉
