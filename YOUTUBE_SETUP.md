# YouTube API Setup for Watch Page

The Watch page uses the YouTube Data API v3 to automatically fetch Chinese learning YouTube Shorts for truly infinite content.

## Getting Your YouTube API Key (FREE)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or use existing)
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it "BiteLing" or anything you like
   - Click "Create"

3. **Enable YouTube Data API v3**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "YouTube Data API v3"
   - Click on it
   - Click "Enable"

4. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials"
   - Select "API Key"
   - Copy your API key!

5. **Add Key to Your App (KEEP IT PRIVATE!)**
   - **DO NOT** edit `youtube-config.js` - that file is committed to git!
   - Instead, open `youtube-config.local.js` (already created for you)
   - Paste your API key in the `apiKey` field:
   ```javascript
   apiKey: 'YOUR_API_KEY_HERE',
   ```
   - ✅ The `.local.js` file is in `.gitignore` so your key stays private when you push to GitHub!

## API Quota

- YouTube API is **FREE** with a daily quota of 10,000 units
- Each video search costs ~100 units
- This gives you ~100 searches per day (plenty for typical use!)
- Quota resets daily at midnight Pacific Time

## How It Works

1. **Automatic Fetching**: The app searches YouTube for Chinese learning content based on your HSK level
2. **Infinite Scroll**: When you're near the end of cached videos, it automatically loads more
3. **Smart Caching**: Videos are cached in memory, so you don't waste API quota
4. **Fallback**: If API fails or isn't configured, shows a demo video

## Search Queries

The app searches for different content based on HSK level:

- **HSK 1**: Basic beginner content (greetings, numbers)
- **HSK 2**: Elementary daily life conversations
- **HSK 3**: Intermediate topics (culture, travel)
- **HSK 4**: Advanced business and news vocabulary
- **HSK 5**: Professional and literary content

You can customize these queries in `youtube-config.js`!

## Troubleshooting

**"Video unavailable"**: Your API key might be invalid or quota exceeded
**No videos loading**: Check browser console for error messages
**Want different content?**: Edit the search queries in `youtube-config.js`

## Security Note

⚠️ API keys in frontend code are visible to users. For production apps:
- Restrict your API key to specific domains in Google Cloud Console
- Consider using a backend proxy to hide your key
- Monitor your quota usage regularly
