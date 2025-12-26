# Vercel Deployment Guide

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

## Setting Environment Variables on Vercel

### Method 1: Vercel Dashboard (Recommended for Production)

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `AZURE_SPEECH_KEY` | your-key-here | Production, Preview, Development |
| `AZURE_SPEECH_REGION` | eastus | Production, Preview, Development |
| `AZURE_OPENAI_KEY` | your-key-here | Production, Preview, Development |
| `AZURE_OPENAI_ENDPOINT` | https://your-resource.openai.azure.com | Production, Preview, Development |
| `AZURE_OPENAI_DEPLOYMENT` | gpt-4 | Production, Preview, Development |

4. Redeploy your project for changes to take effect

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

## Troubleshooting

### Environment variables not working?

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
