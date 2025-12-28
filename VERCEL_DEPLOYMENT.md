# Deploying BiteLing to Vercel

## Quick Setup

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your BiteLing repository
4. Configure project:
   - **Framework Preset**: Other (static site)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: `.` (current directory)
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `YOUTUBE_API_KEY` = your YouTube API key
   - Select all environments (Production, Preview, Development)
6. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
cd /path/to/BiteLingSite
vercel
```

Follow the prompts to link your project.

### 3. Add Your YouTube API Key to Vercel

**Via Dashboard:**
1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - **Name**: `YOUTUBE_API_KEY`
   - **Value**: Your YouTube Data API v3 key
   - **Environments**: Check all (Production, Preview, Development)
4. Click "Save"
5. Redeploy your project

**Via CLI:**
```bash
vercel env add YOUTUBE_API_KEY
# Paste your API key when prompted
# Select all environments
```

### 4. Create Build Script (for env variables)

Since Vercel doesn't support runtime environment variables for static sites, we'll inject them at build time:

Create `vercel-build.sh`:
```bash
#!/bin/bash
# This script injects environment variables at build time

# Create env-config.js with the API key
cat > env-config.js << EOF
window.ENV = {
    YOUTUBE_API_KEY: '${YOUTUBE_API_KEY}'
};
EOF

echo "Environment variables injected successfully"
```

Add to your HTML before other scripts:
```html
<script src="/env-config.js"></script>
```

## Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "bash vercel-build.sh",
  "outputDirectory": ".",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

## Testing Locally with Vercel CLI

```bash
# Install dependencies
vercel dev

# Your site will be available at http://localhost:3000
```

## Important Notes

### Security

- ⚠️ **Client-side API keys are visible to users** - even with environment variables
- The API key will be in the browser's source code
- **Recommended**: Set API key restrictions in Google Cloud Console:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  2. Click on your API key
  3. Under "Application restrictions":
     - Choose "HTTP referrers (web sites)"
     - Add your Vercel domain: `https://your-project.vercel.app/*`
     - Add `http://localhost:3000/*` for local testing
  4. Under "API restrictions":
     - Choose "Restrict key"
     - Select only "YouTube Data API v3"
  5. Click "Save"

### Alternative: Backend Proxy (More Secure)

For production apps handling sensitive data, consider:
1. Create a Vercel Serverless Function to proxy YouTube API calls
2. Store API key in Vercel's secret environment variables
3. Frontend calls your serverless function, not YouTube directly

Would you like me to set up the serverless function approach instead?

## Troubleshooting

**"No videos loading" on Vercel:**
- Check browser console for errors
- Verify environment variable is set in Vercel dashboard
- Redeploy after adding environment variables

**API quota exceeded:**
- Check usage in [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
- Consider implementing caching or a serverless proxy

**CORS errors:**
- YouTube API should work from any domain
- If issues persist, check API key restrictions

## Monitoring

- Monitor API usage: https://console.cloud.google.com/apis/dashboard
- Check Vercel logs: Go to your project → Deployments → Click deployment → View Logs
