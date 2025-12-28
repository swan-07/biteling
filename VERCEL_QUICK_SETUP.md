# Quick Vercel Setup for YouTube API

Since you're already deployed on Vercel, here's how to add your YouTube API key:

## Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `YOUTUBE_API_KEY`
   - **Value**: (paste your YouTube API key)
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**

## Step 2: Update Vercel Build Settings

1. In your Vercel project dashboard, go to **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. Set **Build Command** to: `bash vercel-build.sh`
4. Leave **Output Directory** blank (or set to `.`)
5. Click **Save**

## Step 3: Redeploy

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" if available
5. Click **Redeploy**

That's it! Your site will now have access to the YouTube API.

## How It Works

1. **vercel-build.sh** runs during build and creates `env-config.js`
2. This file contains: `window.ENV = { YOUTUBE_API_KEY: 'your-key' }`
3. **watch.html** loads this file before the main config
4. **youtube-config.js** uses `window.ENV.YOUTUBE_API_KEY` if available

## Local Development

For local development, you already have `youtube-config.local.js` with your API key. This file:
- ✅ Is gitignored (won't be committed)
- ✅ Overrides the template config
- ✅ Works locally without Vercel

## Verify It's Working

After deployment:
1. Visit your Vercel site
2. Go to the Watch page
3. Open browser console (F12)
4. Look for: "Fetched X videos for HSK Y"
5. Videos should load automatically!

## Security Note

⚠️ Even with environment variables, the API key will be visible in browser source code. This is normal for client-side apps.

**To protect your API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers"
   - Add: `https://your-site.vercel.app/*`
   - Add: `http://localhost:*` (for local dev)
4. Under "API restrictions":
   - Choose "Restrict key"
   - Select only "YouTube Data API v3"
5. Save

This prevents others from using your key on their sites!
