# BiteLing Project Structure

## 📁 Directory Organization

```
BiteLingSite/
├── index.html                 # Homepage
├── sw-notification.js         # Service Worker for notifications
├── vercel.json               # Vercel deployment config
│
├── pages/                    # All app pages
│   ├── account.html          # User account & settings
│   ├── books.html            # Book library
│   ├── camera.html           # AR camera translation
│   ├── complete.html         # Review completion page
│   ├── login.html            # Authentication
│   ├── reader.html           # Book reader
│   ├── review.html           # Spaced repetition review
│   ├── roadmap.html          # Feature roadmap
│   ├── talk.html             # AI conversation practice
│   └── watch.html            # Video learning
│
├── js/                       # JavaScript modules
│   ├── script.js             # Homepage logic
│   ├── account.js            # Account page logic
│   ├── books.js              # Book library logic
│   ├── camera.js             # Camera translation logic
│   ├── complete.js           # Completion page logic
│   ├── login.js              # Authentication logic
│   ├── reader.js             # Book reader logic
│   ├── review.js             # Review system logic
│   ├── roadmap.js            # Roadmap page logic
│   ├── talk.js               # AI conversation logic
│   ├── watch.js              # Video learning logic
│   ├── notifications.js      # Notification system
│   ├── user-data.js          # User data management
│   └── firebase-service.js   # Firebase utilities
│
├── css/                      # Stylesheets
│   ├── styles.css            # Homepage styles
│   ├── account.css           # Account page styles
│   ├── books.css             # Books page styles
│   ├── camera.css            # Camera page styles
│   ├── complete.css          # Completion page styles
│   ├── login.css             # Login page styles
│   ├── reader.css            # Reader page styles
│   ├── review.css            # Review page styles
│   ├── roadmap.css           # Roadmap page styles
│   ├── talk.css              # Talk page styles
│   └── watch.css             # Watch page styles
│
├── config/                   # Configuration files
│   ├── firebase-config.js    # Firebase config (template)
│   ├── firebase-config.local.js  # Firebase (local, gitignored)
│   ├── emailjs-config.js     # EmailJS config (template)
│   ├── youtube-config.js     # YouTube API config (template)
│   ├── youtube-config.local.js   # YouTube API (local, gitignored)
│   ├── web3forms-config.js   # Web3Forms config
│   └── config.js             # General config
│
├── assets/                   # Static assets
│   ├── favicon.svg           # Site icon
│   └── [other images]
│
├── api/                      # API endpoints
│   └── config.js
│
├── docs/                     # Documentation
│   ├── setup/                # Setup guides
│   ├── test-notification.html # Notification testing tool
│   └── PROJECT_STRUCTURE.md  # This file
│
└── .vscode/                  # VS Code settings
    └── settings.json
```

## 🎯 Core Features

### 1. **Spaced Repetition Review** (`review.html`, `review.js`)
- Card-based learning system
- HSK-level categorization
- Progress tracking
- Streak system

### 2. **Book Reader** (`reader.html`, `reader.js`)
- Interactive Chinese text reading
- Word-by-word translation
- Click-to-translate functionality
- Add words to review deck

### 3. **Camera Translation** (`camera.html`, `camera.js`)
- AR-style overlay translation (iPhone Live Text inspired)
- OCR with Tesseract.js
- Phrase-level translation with MyMemory API
- Pinyin support via CC-CEDICT
- Image preprocessing for accuracy
- Screen capture mode

### 4. **AI Conversation Practice** (`talk.html`, `talk.js`)
- Voice-based Chinese practice
- AI-powered conversations
- Real-time feedback

### 5. **Video Learning** (`watch.html`, `watch.js`)
- YouTube integration
- Interactive learning

### 6. **Daily Notifications** (`notifications.js`)
- Scheduled daily reminders
- In-page visual banners
- Sound notifications
- Service Worker integration
- Customizable reminder times

### 7. **Social Features** (`account.html`)
- Friend system
- Cookie gifting (10 per friend per day)
- Online status tracking

### 8. **Gamification**
- Streak tracking
- Cookie currency system
- XP and levels
- User food emoji avatars

## 🔧 Technologies Used

### Frontend
- **Vanilla JavaScript** (ES6 modules)
- **CSS3** (Custom styling, gradients, animations)
- **HTML5**

### APIs & Services
- **Firebase** (Authentication, Firestore database)
- **MyMemory Translation API** (Phrase translation)
- **CC-CEDICT** (Chinese-English dictionary, Pinyin)
- **Tesseract.js** (OCR for camera translation)
- **YouTube API** (Video integration)
- **EmailJS** (Email notifications)
- **Web3Forms** (Contact forms)
- **Web Audio API** (Notification sounds)
- **Service Workers** (Background notifications)

### Libraries
- Google Fonts (Quicksand)
- Tesseract.js v5

## 📊 Data Storage

### LocalStorage
- `bitelingData` - User cards, streak, progress
- `cardStates` - Review state for each card
- `reminderTime` - Daily notification time
- `lastNotificationDate` - Track notification delivery
- `lastUserEmail` - Cache for user email
- `cookiesSentToday` - Track daily cookie gifts

### Firebase Firestore
- `users/{userId}` - User profiles
  - cookies
  - hskLevel
  - friends
  - isOnline
  - lastSeen
- Syncs with localStorage as backup

## 🎨 Design System

### Colors
- **Background**: `#FFF9F0` (warm cream)
- **Primary**: `#FFD700` → `#FFC700` (gold gradient)
- **Text**: `#6B5D4F` (brown)
- **Accents**: `#FF6B6B`, `#4ECDC4`, `#95E1D3`

### Typography
- **Font**: Quicksand (400, 500, 600 weights)
- **Style**: Friendly, rounded, approachable

### Components
- Rounded corners (12-20px border-radius)
- Soft shadows
- Gradient buttons
- Animated transitions

## 🚀 Key Features by Page

### Homepage (`index.html`)
- START card (review entry)
- Daily progress tracker
- Quick navigation cards
- User stats display

### Account (`account.html`)
- User statistics (level, streak, words learned)
- Daily reminder settings
- Friends list
- Cookie management
- Test notification button

### Camera (`camera.html`)
- Live camera feed
- Flashlight toggle
- Screen share mode
- AR-style translation overlay
- OCR with image preprocessing
- iPhone Live Text inspired UI

### Books (`books.html`)
- Book library
- HSK level filtering
- Reading progress tracking

### Review (`review.html`)
- Spaced repetition algorithm
- Card flipping animation
- Difficulty rating (again, hard, good, easy)
- Progress tracking

## 📝 Configuration Files

### Required Local Configs (gitignored)
Create these files in `/config/`:

1. **firebase-config.local.js**
```javascript
export const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

2. **youtube-config.local.js**
```javascript
export const YOUTUBE_API_KEY = 'your-youtube-api-key';
```

## 🔐 Security Notes

- All sensitive configs use `.local.js` files (gitignored)
- Firebase security rules should be configured
- API keys should have domain restrictions
- User data syncs between localStorage and Firebase

## 📱 Progressive Web App Features

- Service Worker for notifications
- Offline-capable (partial)
- Mobile-responsive design
- Touch-friendly interactions

## 🎯 Notification System

### Components
1. **notifications.js** - Core notification logic
2. **sw-notification.js** - Service Worker for background notifications
3. **In-page banners** - Visual feedback when page is open
4. **Sound notifications** - Audio feedback using Web Audio API

### Features
- Daily scheduled notifications
- Permission management
- Visual + audio feedback
- Persistent notification tracking
- Test functionality

## 🌐 Deployment

- **Platform**: Vercel
- **Config**: `vercel.json`
- **Domain**: TBD

## 📦 Dependencies

### CDN Resources
- Tesseract.js v5 (OCR)
- EmailJS Browser SDK v3
- Firebase SDK (via config files)

### External APIs
- MyMemory Translation API (free tier: 10k words/day)
- CC-CEDICT dictionary (GitHub raw)
- YouTube Data API v3

## 🔄 Recent Updates

### Camera Translation (2025-12-30)
- iPhone Live Text inspired design
- MyMemory API integration
- Image preprocessing for better OCR
- Phrase-level translation
- AR-style positioned overlays

### Notification System (2025-12-30)
- Daily reminder system
- In-page visual banners
- Sound notifications
- Service Worker integration
- Test notification feature

## 📚 Related Documentation

- [Setup Guide](setup/) - Installation instructions
- [Test Notification](test-notification.html) - Notification testing tool
