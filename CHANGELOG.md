# Changelog

All notable changes to BiteLing will be documented in this file.

## [Unreleased]

### Added - 2025-12-31

#### Account - Profile Icon Shop
- **Customizable profile icons** - Purchase and equip unique icons for your profile
- **15 unlockable icons** - Cookie (free starter), food items, animals, and special icons
- **Tiered pricing** - Icons range from 50 to 300 cookies
- **Instant equipping** - Switch between owned icons anytime
- **Visual indicators** - "Equipped" badge shows currently selected icon
- **Default cookie icon** - All users start with 🍪 cookie icon
- **Icon persistence** - Selected icon saved to localStorage and displayed everywhere
- **Affordable options** - Basic food icons (pizza, burger, sushi) for just 50 cookies
- **Premium icons** - Special items like dragon 🐉, unicorn 🦄, crown 👑 for collectors

#### Talk - Peer-to-Peer Matching System
- **Find Partner mode** - Match with real users for conversation practice
- **HSK level-based matching** - Automatically pairs users at similar proficiency levels
- **Dual conversation types** - Choose text chat or voice call preferences
- **Firebase Firestore matchmaking** - Real-time matchmaking queue and conversation rooms
- **Live messaging** - Real-time message synchronization between matched partners
- **No match handling** - Shows "No Match Found" message after 30-second timeout
- **Match preferences** - Select text chat, voice call, or both
- **Partner identification** - See partner's display name in conversation
- **Automatic mode switching** - Switches to chat mode when match is found
- **Cancel matching** - Stop search and remove from matchmaking queue anytime

### Changed - 2025-12-30

#### Free Content - Watch & Books
- **Removed cookie cost** from Watch videos - now completely free!
- **Removed cookie cost** from Books - all books free to add to library!
- Users can now swipe through unlimited videos without spending cookies
- Users can add any book to their library without paying cookies
- Updated cookie economy: Learning content is now completely free
- Cookies now primarily used for social features (gifting to friends)
- Improved user experience: Learn Chinese without financial restrictions
- Books button changed from "Buy" to "Add to Library"
- Books display "📚 Free" badge instead of cookie price
- Success modal updated: "Added to Library!" instead of "Purchase Successful!"

### Added - 2025-12-30

#### Camera Translation Enhancements
- **iPhone Live Text inspired design** - Yellow accent colors, Apple system fonts, clean minimal UI
- **MyMemory Translation API integration** - Professional phrase-level translation (10,000 words/day free tier)
- **Image preprocessing pipeline** - Grayscale conversion, contrast enhancement, sharpening for better OCR
- **AR-style positioned overlays** - Translations appear directly over source text at exact positions
- **Phrase grouping algorithm** - Spatial proximity detection (yDistance < 20px, xDistance < 30px)
- **Parallel API calls** - All phrases translated simultaneously using Promise.all()

#### Daily Notification System
- **Customizable reminder times** - Set hour, minute, and AM/PM in account settings
- **In-page visual banners** - Gold gradient banners slide in from right
- **Audio notifications** - Web Audio API beep confirmations
- **Service Worker integration** - Background notification support via sw-notification.js
- **Test notification button** - Verify notification system works correctly
- **Smart scheduling** - Checks every minute, prevents duplicate daily notifications
- **Notification tracking** - localStorage tracks last notification date
- **Cookie emoji** 🍪 - Changed from pizza to cookie in notification text

#### Code Organization
- Created comprehensive PROJECT_STRUCTURE.md documentation
- Updated README.md with latest features
- Moved test-notification.html to docs/ directory
- Added CHANGELOG.md for version tracking

### Changed - 2025-12-30

#### Camera Translation
- Replaced CC-CEDICT dictionary with MyMemory API for phrases
- Updated Tesseract.js from v4 to v5 CDN
- Changed API initialization from separate loadLanguage/initialize to single createWorker call
- Fixed ES6 module scope issue by using window.Tesseract prefix
- Updated icon paths from relative (../assets/) to absolute (/assets/)
- Removed popup window feature entirely

#### UI/UX Improvements
- Camera overlay styling matches iPhone Live Text aesthetics
- Font changed to -apple-system, BlinkMacSystemFont for native feel
- Border color updated to #FFD60A (iOS yellow)
- Background opacity increased to 75% for better readability
- Improved spacing with 8px padding

### Fixed - 2025-12-30

#### Camera Translation
- Fixed "OCR error unknown error" by accessing Tesseract via window object
- Fixed "SetImageFile" error with v5 API syntax
- Fixed translations showing "?" by integrating proper translation API
- Fixed character-level translation - now uses phrase-level
- Improved OCR accuracy with preprocessing

#### Notifications
- Added async/await to all translation-related functions
- Fixed notification permission handling with better error messages
- Added visual feedback for notification testing
- Implemented fallback in-page banners for when system notifications are hidden

## Technical Details

### Dependencies Added
- MyMemory Translation API (free tier, no API key required)
- CC-CEDICT 100,000+ entry dictionary for Pinyin
- Tesseract.js v5 for OCR
- Service Workers for background notifications

### API Integrations
- **MyMemory**: https://api.mymemory.translated.net/get
  - Free tier: 10,000 words/day
  - No authentication required
  - Chinese to English translation

- **CC-CEDICT**: https://raw.githubusercontent.com/skishore/makemeahanzi/master/cedict_ts.u8
  - 100,000+ entries
  - Simplified & Traditional Chinese
  - Pinyin pronunciation data

### Browser APIs Used
- Notification API - System notifications
- Service Worker API - Background notifications
- Web Audio API - Notification sounds
- MediaDevices API - Camera access & screen capture
- Canvas API - Image preprocessing & overlay drawing

### File Structure Changes
```
New files:
├── js/notifications.js           # Notification management system
├── sw-notification.js            # Service Worker for notifications
├── docs/test-notification.html   # Testing tool (moved from root)
├── docs/PROJECT_STRUCTURE.md     # Comprehensive documentation
└── CHANGELOG.md                  # This file

Modified files:
├── README.md                     # Updated with new features
├── pages/account.html            # Added test notification button
├── pages/camera.html             # Updated Tesseract CDN, removed popup
├── js/account.js                 # Integrated notification system
├── js/camera.js                  # Complete translation rewrite
├── js/script.js                  # Initialize notifications on homepage
└── css/account.css               # Added test button styling
```

## Migration Notes

### For Developers
If you're updating from a previous version:

1. **Camera feature changes:**
   - Old CC-CEDICT-only translation → New MyMemory API with CC-CEDICT fallback
   - Popup window removed - all overlays are AR-style now
   - Update any references to translation functions (now async)

2. **Notification system:**
   - Import notifications.js in any page that needs reminders
   - Call `await notificationManager.init()` in DOMContentLoaded
   - Set reminder time saved to localStorage as JSON

3. **Service Worker:**
   - Register sw-notification.js for background notifications
   - Users may need to grant notification permissions

## Known Issues

### Camera Translation
- System notifications may be hidden by macOS - use in-page banners as fallback
- OCR accuracy depends on image quality, lighting, and text clarity
- MyMemory API has 10,000 words/day limit (very generous for individual use)

### Notifications
- Notifications require user permission grant
- Browser notification settings must allow localhost (in development)
- macOS may hide notifications in Notification Center instead of showing banners
- Service Worker requires HTTPS in production (works on localhost)

## Future Enhancements

### Planned
- [ ] Offline OCR caching for common phrases
- [ ] User preference for translation API (MyMemory vs CC-CEDICT only)
- [ ] Notification sound customization
- [ ] Multiple notification reminders per day
- [ ] Weekly progress reports via notification
- [ ] Push notifications for friend cookie gifts

### Under Consideration
- [ ] Alternative translation APIs (Google Translate, DeepL)
- [ ] OCR language detection (auto-switch between Chinese/Japanese/Korean)
- [ ] Save translated phrases to review deck from camera
- [ ] Export camera translations to study notes

---

**Format:** This changelog follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.

**Versioning:** BiteLing will adopt [Semantic Versioning](https://semver.org/) once v1.0.0 is released.
