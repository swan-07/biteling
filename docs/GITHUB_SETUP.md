# GitHub Setup Guide

## Initial Setup

### 1. Create a GitHub Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Commit (your API keys are safe - they're in .gitignore!)
git commit -m "Initial commit: BiteLing language learning app"

# Create a new repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/yourusername/biteling.git
git push -u origin main
```

### 2. Verify .gitignore is Working

Before pushing, check what's being tracked:

```bash
# See what files will be committed
git status

# Make sure these are NOT listed:
# - .env (if it exists)
# - config.local.js (if it exists)
```

### 3. Safe to Commit

✅ These files have NO sensitive data:
- `config.js` - Empty API key values
- `.env.example` - Just placeholders
- All `.html`, `.css`, `.js` files

### 4. Protected by .gitignore

🔒 These files are automatically excluded:
- `.env` - Your actual API keys
- `config.local.js` - Your local config
- `.DS_Store` - System files

## Deploying to GitHub Pages

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Your site will be live at: `https://yourusername.github.io/biteling/`

### Configure API Keys on Live Site

After deployment, users need to add their own API keys:

1. Visit your live site
2. Open browser console (F12)
3. Run:
   ```javascript
   saveConfig({
       AZURE_SPEECH_KEY: 'your-key',
       AZURE_SPEECH_REGION: 'eastus',
       AZURE_OPENAI_KEY: 'your-key',
       AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com',
       AZURE_OPENAI_DEPLOYMENT: 'gpt-4'
   });
   ```

## Working with Collaborators

### For Team Members

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/biteling.git
   cd biteling
   ```

2. Set up their own API keys using browser console method

3. Work on features:
   ```bash
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

4. Create Pull Request on GitHub

### Important Notes for Team

- ⚠️ Never commit API keys in any branch
- ⚠️ Always check `git status` before committing
- ⚠️ Use browser console method for API keys
- ⚠️ Don't modify `config.js` with real keys

## Continuous Deployment

GitHub Pages auto-deploys when you push to main:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin main

# Site auto-updates at yourusername.github.io/biteling
```

## Emergency: Committed Keys by Accident?

If you accidentally commit API keys:

### 1. Immediately Rotate Keys
- Go to Azure Portal
- Regenerate all exposed keys
- Update your local config

### 2. Remove from Git History
```bash
# WARNING: This rewrites history!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous!)
git push origin --force --all
```

### 3. Better: Use BFG Repo-Cleaner
```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove sensitive data
bfg --replace-text passwords.txt  # List of keys to remove
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

### 4. Report to GitHub
- Keys in public repos are often scanned by bots
- GitHub may alert you
- Take action immediately

## Microsoft Imagine Cup Submission

For judges to test your project:

1. Provide demo Azure credentials (time-limited)
2. Include video demonstration
3. Document setup process
4. Explain that keys are not required to view code

## Questions?

Check:
- `README.md` - Full setup instructions
- `SECURITY.md` - Security best practices
- `.gitignore` - What's excluded from Git
