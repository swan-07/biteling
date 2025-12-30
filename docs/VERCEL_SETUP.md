# Vercel Deployment Guide

## ⚠️ IMPORTANT: Firebase Configuration Required

If you're seeing **"Firebase not initialized"** on Vercel, you need to add Firebase environment variables. See the [Firebase Setup Section](#firebase-configuration-on-vercel) below.

## Why Vercel?

✅ **Better than GitHub Pages for this project:**
- Environment Variables (secure API key storage)
- Automatic HTTPS
- Global CDN
- Instant deployments
- Custom domains

## Quick Deploy

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project directory)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? biteling
# - Directory? ./
# - Build command? (leave empty)
# - Output directory? (leave empty)
```

### Option 2: Deploy from GitHub

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"

## Firebase Configuration on Vercel

### Step 1: Get Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → Project Settings
4. Scroll down to "Your apps" section
5. Click on your web app (or create one if you haven't)
6. Copy the `firebaseConfig` object values

It should look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 2: Add Firebase Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your BiteLing project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (one by one):

| Variable Name | Example Value | Where to Find |
|---------------|---------------|---------------|
| `FIREBASE_API_KEY` | `AIzaSyB...` | From `apiKey` in Firebase config |
| `FIREBASE_AUTH_DOMAIN` | `biteling-xyz.firebaseapp.com` | From `authDomain` in Firebase config |
| `FIREBASE_PROJECT_ID` | `biteling-xyz` | From `projectId` in Firebase config |
| `FIREBASE_STORAGE_BUCKET` | `biteling-xyz.appspot.com` | From `storageBucket` in Firebase config |
| `FIREBASE_MESSAGING_SENDER_ID` | `123456789012` | From `messagingSenderId` in Firebase config |
| `FIREBASE_APP_ID` | `1:123:web:abc` | From `appId` in Firebase config |

**Important Notes:**
- For each variable, select **All Environments** (Production, Preview, Development)
- Click **Save** after adding each variable
- The values should **NOT** include quotes

### Step 3: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **•••** menu on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete

The build script (`vercel-build.sh`) will automatically inject these environment variables into `env-config.js` at build time.

### Step 4: Verify

After deployment completes:

1. Visit your Vercel site
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for "Firebase initialized successfully" message
5. If you see errors, check that all environment variables are set correctly

## Additional Environment Variables (Optional)

### Azure OpenAI (for Talk feature)

| Key | Value | Environment |
|-----|-------|-------------|
| `AZURE_SPEECH_KEY` | your-key-here | Production, Preview, Development |
| `AZURE_SPEECH_REGION` | eastus | Production, Preview, Development |
| `AZURE_OPENAI_KEY` | your-key-here | Production, Preview, Development |
| `AZURE_OPENAI_ENDPOINT` | https://your-resource.openai.azure.com | Production, Preview, Development |
| `AZURE_OPENAI_DEPLOYMENT` | gpt-4 | Production, Preview, Development |

### YouTube API (for Watch feature)

| Key | Value | Environment |
|-----|-------|-------------|
| `YOUTUBE_API_KEY` | your-key-here | Production, Preview, Development |

### Method 2: Vercel CLI

```bash
# Add environment variables
vercel env add AZURE_SPEECH_KEY
# Enter your key when prompted
# Select: Production, Preview, Development

vercel env add AZURE_SPEECH_REGION
vercel env add AZURE_OPENAI_KEY
vercel env add AZURE_OPENAI_ENDPOINT
vercel env add AZURE_OPENAI_DEPLOYMENT
```

## Update config.js for Vercel

We need to modify `config.js` to read from Vercel environment variables.

Since Vercel runs client-side apps, we need a **Vercel Serverless Function** to securely expose the keys:

### Step 1: Create `vercel.json`

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Step 2: Create API endpoint

Create `/api/config.js`:

```javascript
// This runs on Vercel's serverless functions
export default function handler(req, res) {
  // Only allow requests from your domain
  const allowedOrigins = [
    'https://biteling.vercel.app',
    'https://your-custom-domain.com'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Return environment variables
  res.status(200).json({
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY || '',
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION || '',
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY || '',
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || '',
    AZURE_OPENAI_API_VERSION: '2024-02-01'
  });
}
```

### Step 3: Update config.js

Modify your `config.js` to fetch from the API:

```javascript
const ENV_CONFIG = {
    AZURE_SPEECH_KEY: '',
    AZURE_SPEECH_REGION: '',
    AZURE_OPENAI_KEY: '',
    AZURE_OPENAI_ENDPOINT: '',
    AZURE_OPENAI_DEPLOYMENT: '',
    AZURE_OPENAI_API_VERSION: '2024-02-01'
};

// Load config from Vercel API endpoint or localStorage
async function loadConfig() {
    // Try to load from Vercel API first
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            Object.assign(ENV_CONFIG, config);
            console.log('Loaded config from Vercel environment variables');
            return;
        }
    } catch (error) {
        console.log('Not running on Vercel, using localStorage');
    }

    // Fallback to localStorage for local development
    const savedConfig = localStorage.getItem('bitelingConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        Object.assign(ENV_CONFIG, parsed);
        console.log('Loaded config from localStorage');
    }
}

// Initialize
loadConfig().then(() => {
    window.ENV_CONFIG = ENV_CONFIG;
    console.log('Azure Speech configured:', !!(ENV_CONFIG.AZURE_SPEECH_KEY));
    console.log('Azure OpenAI configured:', !!(ENV_CONFIG.AZURE_OPENAI_KEY));
});

// Keep saveConfig for local development
function saveConfig(config) {
    localStorage.setItem('bitelingConfig', JSON.stringify(config));
    Object.assign(ENV_CONFIG, config);
}

window.saveConfig = saveConfig;
```

## Deployment Workflow

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys!
# Check status at vercel.com/dashboard
```

## Local Development with Vercel

Test your Vercel setup locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull

# Run locally with Vercel's environment
vercel dev
```

This creates a `.env.local` file (gitignored) with your production variables.

## Comparison: GitHub Pages vs Vercel

| Feature | GitHub Pages | Vercel |
|---------|-------------|--------|
| **API Keys** | Browser console only | Environment variables (secure) |
| **HTTPS** | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Free | ✅ Free |
| **Edge Network** | ❌ | ✅ Global CDN |
| **Serverless Functions** | ❌ | ✅ Built-in |
| **Deploy Speed** | Slow | ⚡ Instant |
| **Build Step** | ❌ | ✅ Optional |

## For Microsoft Imagine Cup

Vercel deployment shows:
- ✅ Production-ready deployment
- ✅ Secure API key management
- ✅ Professional CI/CD workflow
- ✅ Scalable architecture

## Security Benefits

1. **Keys never in client code**: API endpoint serves them
2. **CORS protection**: Only your domain can access
3. **Environment isolation**: Dev/Preview/Prod separated
4. **Easy rotation**: Update in dashboard, instant deploy

## How It Works

1. **Build Time**: The `vercel-build.sh` script runs during Vercel deployment
2. **Injection**: It creates `env-config.js` with your Firebase config from environment variables
3. **Runtime**: Pages load `env-config.js` which sets `window.ENV.FIREBASE_*` values
4. **Config**: `firebase-config.js` reads from `window.ENV` and initializes Firebase

## Troubleshooting

### "Firebase not initialized" error
- ✅ Check that all 6 Firebase environment variables are set in Vercel
- ✅ Make sure they're available in **all environments** (Production/Preview/Development)
- ✅ Verify the variable names match exactly (case-sensitive)
- ✅ Redeploy after adding variables
- ✅ Check build logs for "✅ Environment variables injected successfully" message

### Variables not updating after changes
- Clear Vercel's cache: Settings → Advanced → Clear Cache
- Trigger a fresh deployment from Git
- Check the Deployments tab for build errors

### Local development works but Vercel doesn't
- **Local** uses `firebase-config.local.js` (gitignored)
- **Vercel** uses environment variables from Settings
- These are separate configurations - both need to be set up

### Build script not running
- Check that `vercel.json` has `"buildCommand": "bash vercel-build.sh"`
- Verify `vercel-build.sh` exists in project root
- Check Vercel build logs for script execution

### Environment variables not working for other features?

```bash
# Check if variables are set
vercel env ls

# Pull latest variables
vercel env pull

# Redeploy to pick up changes
vercel --prod
```

### CORS errors?

Add your Vercel domain to allowed origins in `/api/config.js`:
```javascript
const allowedOrigins = [
    'https://your-project.vercel.app'
];
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add environment variables
3. ✅ Create `/api/config.js` endpoint
4. ✅ Update `config.js` to fetch from API
5. ✅ Test on live site
6. 🎉 Share your link!

Your app will be live at: `https://your-project.vercel.app`
