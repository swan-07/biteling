# BiteLing - Language Learning App

A gamified Chinese language learning platform with Anki-style spaced repetition and Duolingo-style progression.

## Features

- 📚 **Daily Review**: Spaced repetition flashcards with mastery tracking
- 📖 **Books**: Read Chinese stories with interactive dictionary
- 📷 **Camera** (BiteLing+ only): Live camera translation of Chinese text
- 💬 **Talk**: AI conversation partner for speaking practice
- 🎬 **Watch**: TikTok-style video feed with HSK-adaptive content
- 🗺️ **Roadmap**: HSK level progression (1-6)
- 🍪 **Cookie Economy**: Earn cookies through learning activities

## Quick Start

### 1. Clone from GitHub

```bash
git clone https://github.com/yourusername/biteling.git
cd biteling
```

### 2. Run Locally (No Setup Required!)

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: http://localhost:8000

The app works immediately! Configure services below for full functionality.

### 3. Configure Services (Optional)

📖 **All setup guides are in [docs/setup/](docs/setup/README.md)**

**Core Services:**
- 🔐 [Firebase Setup](docs/setup/FIREBASE_SETUP.md) - User accounts & data sync
- 🔒 [Security Rules](docs/setup/FIREBASE_SECURITY_RULES.md) - Firebase permissions

**Optional Services:**
- 📺 [YouTube API](docs/setup/YOUTUBE_SETUP.md) - Video content for Watch feature
- 📧 [EmailJS](docs/setup/EMAILJS_QUICK_SETUP.md) - Automatic friend invitations
- 🚀 [Deploy to Vercel](docs/setup/VERCEL_QUICK_SETUP.md) - Go live in 2 minutes

### 4. Legacy Azure AI Setup (Optional)

BiteLing uses Azure AI services for enhanced features. These are **optional** - the app works without them, but with limited functionality.

⚠️ **NEVER commit API keys to GitHub!** The `.gitignore` file is configured to protect your keys.

#### Option A: Using Browser Console (Recommended - Most Secure)

1. Open the app in your browser
2. Open Developer Console (F12)
3. Run the following commands:

```javascript
// For Text-to-Speech (Review & Books)
saveConfig({
    AZURE_SPEECH_KEY: 'your-speech-api-key',
    AZURE_SPEECH_REGION: 'eastus'
});

// For AI Conversation (Talk)
saveConfig({
    AZURE_OPENAI_KEY: 'your-openai-key',
    AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT: 'gpt-4'
});
```

This saves keys to **localStorage only** (browser-specific, never pushed to Git).

#### Option B: Use .env File (Local Only)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your keys (this file is gitignored):
   ```
   AZURE_SPEECH_KEY=your-key-here
   AZURE_SPEECH_REGION=eastus
   AZURE_OPENAI_KEY=your-key-here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT=gpt-4
   ```

3. Then use the browser console to load them with `saveConfig()`

#### Option C: Create a Local config.local.js (Advanced)

1. Create `config.local.js` (gitignored):
   ```javascript
   // Auto-load your keys on page load
   window.addEventListener('load', () => {
       saveConfig({
           AZURE_SPEECH_KEY: 'your-key',
           AZURE_SPEECH_REGION: 'eastus',
           AZURE_OPENAI_KEY: 'your-key',
           AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com',
           AZURE_OPENAI_DEPLOYMENT: 'gpt-4'
       });
   });
   ```

2. Add to `.gitignore`:
   ```
   config.local.js
   ```

3. Include in your HTML files after `config.js`

### 3. Run the App

Start a local web server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: http://localhost:8000

## Azure Services Setup

### Azure Speech Services (for Text-to-Speech)

1. Go to https://portal.azure.com
2. Create a new "Speech Service" resource
3. Copy your **Key** and **Region** from the resource
4. Used in: Review page (flashcards) and Books page (reading aloud)

### Azure OpenAI (for AI Conversations)

1. Go to https://portal.azure.com
2. Create a new "Azure OpenAI" resource
3. Deploy a GPT model (e.g., GPT-4 or GPT-3.5)
4. Copy your **Key**, **Endpoint**, and **Deployment Name**
5. Used in: Talk page (conversation partner)

## File Structure

```
BiteLingSite/
├── index.html              # Homepage
├── .env                    # Environment variables (gitignored)
├── .env.example            # Example environment file
├── vercel.json             # Vercel deployment config
│
├── config/                 # Configuration files
│   ├── config.js           # Azure services config (legacy)
│   ├── firebase-config.js  # Firebase authentication & database
│   ├── youtube-config.js   # YouTube API for Watch feature
│   ├── emailjs-config.js   # EmailJS for friend invitations
│   ├── web3forms-config.js # Web3Forms (EmailJS alternative)
│   └── *.local.js          # Local overrides (gitignored)
│
├── pages/                  # HTML pages
│   ├── account.html        # User account & friends
│   ├── login.html          # Authentication
│   ├── review.html         # Daily review flashcards
│   ├── watch.html          # TikTok-style video feed
│   ├── books.html          # Book library
│   ├── reader.html         # Book reader
│   ├── talk.html           # AI conversation partner
│   ├── roadmap.html        # HSK level progression
│   └── complete.html       # Review completion screen
│
├── css/                    # Stylesheets (one per page)
│   ├── styles.css          # Homepage & global styles
│   ├── account.css         # Account page styles
│   ├── login.css           # Login page styles
│   └── ...                 # Other page styles
│
├── js/                     # JavaScript modules
│   ├── script.js           # Homepage logic
│   ├── firebase-service.js # Firebase SDK wrapper
│   ├── user-data.js        # User data manager (localStorage + Firebase)
│   ├── account.js          # Account & friends logic
│   └── ...                 # Other page scripts
│
├── assets/                 # Static assets
│   └── favicon.svg         # Cookie favicon
│
├── api/                    # Vercel serverless functions
│   └── config.js           # API endpoint for env vars
│
└── docs/                   # Documentation
    ├── setup/              # Setup guides (NEW!)
    │   ├── README.md       # Setup guide index
    │   ├── FIREBASE_SETUP.md
    │   ├── YOUTUBE_SETUP.md
    │   ├── EMAILJS_QUICK_SETUP.md
    │   ├── VERCEL_QUICK_SETUP.md
    │   └── ...             # Other setup guides
    │
    ├── DEPLOYMENT_SUMMARY.md
    ├── VERCEL_SETUP.md
    ├── GITHUB_SETUP.md
    └── SECURITY.md
```

## Features by Page

### Daily Review ([pages/review.html](pages/review.html))
- Anki-style spaced repetition
- Bidirectional cards (Chinese↔English)
- Mastery dots (0-4 levels)
- Audio pronunciation (Azure TTS)
- Session queue for failed cards

### Books ([pages/books.html](pages/books.html), [pages/reader.html](pages/reader.html))
- Chinese stories with translations
- Interactive dictionary (click any word)
- Add words to review deck
- Chapter-by-chapter reading
- Text-to-speech (Azure TTS)

### Talk ([pages/talk.html](pages/talk.html))
- **Two conversation modes:**
  - 💬 **Chat Mode**: Text/voice input, optional auto-play TTS, manual audio playback
  - 📞 **Call Mode**: Continuous audio conversation like a phone call
- AI adjusts language complexity based on your HSK level (1-5)
- Voice input (Web Speech API for Chinese)
- Text-to-speech with Azure Speech Services
- Earn 5 cookies per 5 messages
- Powered by Azure OpenAI GPT

### Watch ([pages/watch.html](pages/watch.html))
- **TikTok-style video learning feed**
- HSK-adaptive content (automatically matches your level)
- **i+1 learning**: Each video introduces slightly new content
- Interactive features:
  - Chinese/Pinyin/English subtitles (toggleable)
  - Tap words to add to SRS deck
  - Playback speed control (0.5x - 1.5x)
  - Replay videos
- **Swipe up for next video** (costs 5 🍪)
- Track progress per HSK level
- Learn naturally through comprehensible input

### Roadmap ([pages/roadmap.html](pages/roadmap.html))
- HSK levels 1-6 visualization
- Progress tracking by mastered words
- Only completes when ALL words mastered

## Cookie Economy

- Daily Review: Earn 1 cookie per card (only "Good" rating)
- Talk: Earn 5 cookies per 5 messages
- Watch: Spend 5 cookies per video
- Books: Spend cookies to unlock books

## Technologies Used

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Services**: Azure OpenAI, Azure Speech Services
- **Storage**: localStorage
- **Speech**: Web Speech API (fallback)

## Microsoft Imagine Cup

This project showcases:
- ✅ Azure AI integration (OpenAI GPT, Speech Services)
- ✅ Innovative gamification approach
- ✅ Real-world learning application
- ✅ Accessible education technology

## Deployment

For detailed deployment instructions, see:

- **[Deployment Summary](docs/DEPLOYMENT_SUMMARY.md)** - Quick comparison of all deployment options
- **[Vercel Setup Guide](docs/VERCEL_SETUP.md)** - Recommended for production (secure API keys)
- **[GitHub Pages Setup Guide](docs/GITHUB_SETUP.md)** - Free hosting option

### Quick Deployment Options

**Vercel (Recommended for Imagine Cup)**: Secure API key management with environment variables
```bash
vercel
```

**GitHub Pages**: Free hosting with browser-based API configuration
1. Push code to GitHub
2. Enable GitHub Pages in repository settings
3. Users configure API keys in browser console

**Local Development**: Fast iteration for testing
```bash
python3 -m http.server 8000
```

### Security Notes

For complete security best practices, see **[Security Guide](docs/SECURITY.md)**

✅ **Safe for GitHub:**
- `config.js` has empty values (safe to commit)
- `.env` is gitignored (never committed)
- `config.local.js` is gitignored (never committed)
- API keys stored in localStorage (browser-only)

❌ **Never commit:**
- Files with actual API keys
- `.env` file with real values
- Modified `config.js` with hardcoded keys

## License

Created for Microsoft Imagine Cup 2025
