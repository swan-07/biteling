# Deployment Options Summary

BiteLing supports multiple deployment methods. Choose the one that fits your needs:

## 🚀 Quick Comparison

| Method | Setup Time | API Keys | Best For |
|--------|-----------|----------|----------|
| **Vercel** ⭐ | 5 min | Secure environment variables | Production, Imagine Cup demo |
| **GitHub Pages** | 3 min | Browser console only | Simple hosting, portfolio |
| **Local** | 1 min | Browser console | Development, testing |

---

## Option 1: Vercel (Recommended) ⭐

### Why Vercel?
- ✅ **Secure API key storage** via environment variables
- ✅ **Global CDN** for fast loading worldwide
- ✅ **Automatic HTTPS**
- ✅ **Serverless functions** for API endpoint
- ✅ **Best for Microsoft Imagine Cup**

### Quick Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Add API Keys
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these 5 variables:
   - `AZURE_SPEECH_KEY`
   - `AZURE_SPEECH_REGION`
   - `AZURE_OPENAI_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_DEPLOYMENT`

### How It Works
- API keys stored securely on Vercel servers
- `/api/config` serverless function serves keys
- Client loads from API automatically
- ✅ **Safe to commit code to GitHub**

📖 **Full guide**: [VERCEL_SETUP.md](VERCEL_SETUP.md)

---

## Option 2: GitHub Pages

### Why GitHub Pages?
- ✅ **Free hosting** from GitHub
- ✅ **Simple deployment** (just push to GitHub)
- ✅ **Custom domain support**
- ✅ **Good for portfolios**

### Quick Setup
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/biteling.git
git push -u origin main

# Enable GitHub Pages
# Settings → Pages → Source: main branch
```

### Add API Keys (Browser Console)
After deployment, users configure keys in browser:
```javascript
saveConfig({
    AZURE_SPEECH_KEY: 'your-key',
    AZURE_SPEECH_REGION: 'eastus',
    AZURE_OPENAI_KEY: 'your-key',
    AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT: 'gpt-4'
});
```

### Limitations
- ⚠️ Each user must configure their own keys
- ⚠️ Keys stored in browser localStorage only
- ⚠️ Not ideal for production deployment

📖 **Full guide**: [GITHUB_SETUP.md](GITHUB_SETUP.md)

---

## Option 3: Local Development

### Quick Setup
```bash
# Start local server
python3 -m http.server 8000

# Open browser
open http://localhost:8000

# Configure API keys in console
saveConfig({ AZURE_SPEECH_KEY: 'your-key', ... });
```

---

## Which Should You Use?

### For Microsoft Imagine Cup Submission
**Use Vercel** → Professional deployment with secure API management

### For Your Portfolio
**Use GitHub Pages** → Simple, free, shows on your GitHub profile

### For Development
**Use Local** → Fast iteration, test changes immediately

---

## Security Comparison

| Method | API Key Security | Safe for GitHub |
|--------|-----------------|----------------|
| **Vercel** | ✅ Server-side env vars | ✅ Yes |
| **GitHub Pages** | ⚠️ Browser localStorage | ✅ Yes |
| **Local** | ⚠️ Browser localStorage | ✅ Yes |

All methods are GitHub-safe! 🎉

---

## Files You Need to Know

### Safe to Commit (Always)
- ✅ `config.js` - Has empty values only
- ✅ `.env.example` - Just placeholders
- ✅ All HTML, CSS, JS files

### Protected by .gitignore (Never Committed)
- 🔒 `.env` - Your actual keys
- 🔒 `config.local.js` - Local config
- 🔒 `.DS_Store` - System files

### Vercel-Specific
- ✅ `vercel.json` - Vercel configuration (safe to commit)
- ✅ `api/config.js` - Serverless function (safe to commit)

---

## Quick Start Commands

### Vercel
```bash
vercel                          # Deploy
vercel env add AZURE_SPEECH_KEY # Add environment variable
vercel --prod                   # Deploy to production
```

### GitHub Pages
```bash
git push origin main            # Auto-deploys to GitHub Pages
```

### Local
```bash
python3 -m http.server 8000     # Start server
```

---

## Need Help?

- 📖 [README.md](../README.md) - Complete setup guide
- 🔐 [SECURITY.md](SECURITY.md) - Security best practices
- 🚀 [VERCEL_SETUP.md](VERCEL_SETUP.md) - Detailed Vercel guide
- 📦 [GITHUB_SETUP.md](GITHUB_SETUP.md) - Detailed GitHub guide

---

## Summary

**Yes, Vercel works perfectly!** It's actually the **best option** for your project because:

1. ✅ **Secure API keys** (environment variables on server)
2. ✅ **No client-side key exposure**
3. ✅ **Professional for Imagine Cup**
4. ✅ **Easy to set up** (5 minutes)
5. ✅ **Free tier** is generous

The app will be fully functional on Vercel with proper API key management! 🎉
