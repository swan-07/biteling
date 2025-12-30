# 🔥 Fix "Firebase not initialized" on Vercel

## Quick Fix (5 minutes)

### Step 1: Get Firebase Config
1. Go to https://console.firebase.google.com/
2. Select your project → ⚙️ Settings → Project Settings
3. Scroll to "Your apps" → Copy the config values

### Step 2: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add these 6 variables (click "Add" for each):

```
FIREBASE_API_KEY = AIzaSy... (from apiKey)
FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com (from authDomain)
FIREBASE_PROJECT_ID = your-project-id (from projectId)
FIREBASE_STORAGE_BUCKET = your-project.appspot.com (from storageBucket)
FIREBASE_MESSAGING_SENDER_ID = 123456789 (from messagingSenderId)
FIREBASE_APP_ID = 1:123:web:abc (from appId)
```

**For each variable:**
- Select: ✅ Production ✅ Preview ✅ Development
- Click "Save"

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **•••** on latest deployment → **Redeploy**
3. Wait for build to complete

### Step 4: Verify
1. Visit your Vercel site
2. Press F12 → Console tab
3. Look for: ✅ "Firebase initialized successfully"

## Why This Happens

- **Local development**: Uses `firebase-config.local.js` (gitignored)
- **Vercel deployment**: Needs environment variables in Settings

The `vercel-build.sh` script automatically injects environment variables into your deployment at build time.

## Still Not Working?

### Check build logs:
1. Vercel → Deployments → Click latest deployment
2. Look for: "✅ Environment variables injected successfully"
3. If missing, check that `vercel.json` has:
   ```json
   {
     "buildCommand": "bash vercel-build.sh"
   }
   ```

### Double-check variables:
- Names are **exact** and **case-sensitive**
- Values have **NO quotes**
- All environments selected: Production, Preview, Development

## Full Documentation

See [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md) for complete setup guide.
