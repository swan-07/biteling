# Security Policy

## API Key Management

### ✅ Safe Practices

1. **Use Browser Console** (Recommended):
   ```javascript
   saveConfig({ AZURE_SPEECH_KEY: 'your-key' });
   ```
   - Keys stored in localStorage only
   - Never leaves your browser
   - Not committed to Git

2. **Use `.env` File** (Gitignored):
   - Copy `.env.example` to `.env`
   - Add your keys to `.env`
   - This file is automatically ignored by Git

3. **Use `config.local.js`** (Gitignored):
   - Create a local config file
   - Add to your HTML after `config.js`
   - This file is automatically ignored by Git

### ❌ Unsafe Practices

1. **DO NOT** hardcode keys in `config.js`
2. **DO NOT** commit `.env` file with real keys
3. **DO NOT** share screenshots with visible API keys
4. **DO NOT** commit `config.local.js` with keys

## What's Safe to Commit

✅ `config.js` - Contains empty strings only
✅ `.env.example` - Contains placeholders only
✅ `.gitignore` - Protects sensitive files
✅ All HTML, CSS, and JS files (without keys)

## What's Protected by .gitignore

🔒 `.env` - Your actual environment variables
🔒 `config.local.js` - Your local configuration
🔒 `.DS_Store` - macOS system files

## Azure API Key Best Practices

1. **Rotate Keys Regularly**: Change your API keys every 90 days
2. **Use Key Restrictions**: Limit API keys to specific domains
3. **Monitor Usage**: Check Azure portal for unusual activity
4. **Delete Unused Keys**: Remove old or compromised keys
5. **Use Separate Keys**: Different keys for dev/staging/production

## Reporting Security Issues

If you find a security vulnerability, please email: security@biteling.app

## Azure Services Used

- **Azure Speech Services**: Text-to-speech functionality
- **Azure OpenAI**: AI conversation partner

Both services require API keys that should **never** be committed to version control.

## For Microsoft Imagine Cup Judges

To test the full functionality with Azure AI:

1. Set up your own Azure account (free tier available)
2. Create Speech Service and Azure OpenAI resources
3. Use the browser console method to add your keys
4. Keys persist in localStorage across sessions

No keys are required in the codebase to evaluate the project!
