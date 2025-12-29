# Camera Translation Feature

## Overview

The Camera Translation feature is a **BiteLing+ exclusive** that allows users to translate Chinese text in real-time using their device camera. This powerful tool helps learners understand signs, menus, books, and any printed Chinese text instantly.

## Features

### 📷 Live Camera Access
- Uses device camera (back camera by default)
- Real-time video feed
- Switch between front/back cameras
- Flashlight toggle for low-light conditions

### 🔍 Text Recognition (OCR)
- Captures frames from camera
- Recognizes Chinese characters
- Supports both simplified and traditional characters
- Mock implementation ready for Tesseract.js integration

### 📖 Instant Translation
- Displays Chinese text with pinyin and English
- Click individual words for detailed definitions
- Add words directly to review deck
- Translation history panel

### 👑 Premium Gating
- Exclusive to BiteLing+ members
- Beautiful upgrade prompt for free users
- Seamless premium status check

## File Structure

```
pages/camera.html       # Camera translation page
css/camera.css          # Camera-specific styles
js/camera.js           # Camera logic and OCR
```

## How It Works

### 1. Premium Check
```javascript
async function checkPremiumStatus() {
    const isPremium = localStorage.getItem('isPremium') === 'true';

    if (!isPremium) {
        // Show premium gate
        document.getElementById('premiumGate').classList.remove('hidden');
    } else {
        // Initialize camera
        await initializeCamera();
    }
}
```

### 2. Camera Initialization
```javascript
async function initializeCamera() {
    const constraints = {
        video: {
            facingMode: 'environment',  // Back camera
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
}
```

### 3. Capture & OCR
```javascript
async function captureAndTranslate() {
    // Capture current video frame
    const canvas = document.createElement('canvas');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');

    // Perform OCR (mock - ready for Tesseract.js)
    await performOCR(imageData);
}
```

### 4. Translation Display
```javascript
function displayTranslation(chineseText) {
    // Get translation from dictionary
    const translation = getTranslation(chineseText);

    // Create clickable word chips
    const wordsHTML = splitIntoClickableWords(chineseText);

    // Display with pinyin and English
    // Each word is clickable for detailed definition
}
```

## Controls

| Button | Icon | Function |
|--------|------|----------|
| Capture | 📸 | Capture frame and translate |
| Flashlight | 💡 | Toggle camera flash (if supported) |
| Switch Camera | 🔄 | Switch between front/back cameras |
| Clear | Clear | Clear translation history |

## Integration with Tesseract.js (Production)

For production deployment, integrate Tesseract.js for real OCR:

### 1. Add Tesseract.js CDN
```html
<!-- In pages/camera.html -->
<script src='https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js'></script>
```

### 2. Update OCR Function
```javascript
async function performOCR(imageData) {
    const { createWorker } = Tesseract;
    const worker = await createWorker('chi_sim');  // Simplified Chinese

    const { data: { text } } = await worker.recognize(imageData);

    await worker.terminate();

    // Display translation
    displayTranslation(text.trim());
}
```

### 3. Language Options
```javascript
// For traditional Chinese:
const worker = await createWorker('chi_tra');

// For both:
const worker = await createWorker(['chi_sim', 'chi_tra']);
```

## Dictionary Integration

### Current Implementation
Uses a hardcoded dictionary with 30+ common words and phrases:
```javascript
const chineseDictionary = {
    '你好': { pinyin: 'nǐhǎo', english: 'hello, hi' },
    '谢谢': { pinyin: 'xièxie', english: 'thank you' },
    // ... more entries
};
```

### For Production
Integrate with a full Chinese dictionary API:

**Option 1: CC-CEDICT**
- Free, open-source dictionary
- 100,000+ entries
- https://www.mdbg.net/chinese/dictionary?page=cedict

**Option 2: Azure Translator API**
- Real-time translation
- Context-aware definitions
- Requires API key

**Option 3: Google Translate API**
- Accurate translations
- Multiple languages
- Pay-per-use pricing

## User Experience

### For Free Users
1. Click Camera button on homepage
2. See premium gate screen
3. Option to upgrade to BiteLing+ for $20
4. Return to home or upgrade

### For BiteLing+ Users
1. Click Camera button on homepage
2. Camera initializes immediately
3. Point at Chinese text
4. Tap 📸 to capture and translate
5. View translation with pinyin
6. Click words for definitions
7. Add words to review deck

## Mobile Optimization

### Responsive Design
- Full-screen camera view
- Touch-optimized controls
- Large capture button (70px)
- Accessible flashlight/switch buttons

### Performance
- High-quality video (1920x1080)
- Fast capture processing
- Smooth UI transitions
- Minimal battery impact

## Browser Compatibility

### Camera API Support
- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS 11+)
- ✅ Firefox (desktop & mobile)
- ⚠️ Requires HTTPS in production

### Flashlight Support
- ✅ Android Chrome
- ❌ iOS Safari (flashlight not supported via web API)
- Device-dependent feature

## Privacy & Security

### Camera Permissions
- Requests camera access on page load (premium users only)
- User can deny/revoke at any time
- No video recording
- Images processed locally

### Data Handling
- No images sent to external servers (unless using cloud OCR)
- Translations stored locally in browser
- No personal data collected

## Future Enhancements

1. **Continuous Mode**: Real-time translation without capture button
2. **Image Upload**: Translate from gallery photos
3. **History**: Save past translations
4. **Export**: Download translations as PDF/text
5. **Offline Mode**: Pre-download OCR models
6. **AR Overlay**: Overlay translation on live camera view
7. **Multi-language**: Support Japanese, Korean, etc.

## Testing

### Manual Testing Checklist
- [ ] Premium gate shows for free users
- [ ] Camera initializes for BiteLing+ users
- [ ] Capture button works
- [ ] Flashlight toggles (if supported)
- [ ] Camera switches front/back
- [ ] Translations display correctly
- [ ] Word details modal opens
- [ ] Add to deck functionality works
- [ ] Clear button works
- [ ] Mobile responsive
- [ ] HTTPS camera access works

### Test Premium Status
```javascript
// Enable premium in console:
localStorage.setItem('isPremium', 'true');

// Disable premium:
localStorage.setItem('isPremium', 'false');
```

## Cost Estimate

### Free (Current Implementation)
- Mock OCR: $0
- Hardcoded dictionary: $0
- Camera API: Free (browser feature)
- **Total: $0/month**

### With Tesseract.js
- Tesseract.js: Free (open-source)
- CC-CEDICT: Free (open-source)
- Hosting: $0 (runs in browser)
- **Total: $0/month**

### With Cloud OCR
- Azure Computer Vision: $1/1000 images
- Google Cloud Vision: $1.50/1000 images
- Estimated usage: 10,000 captures/month
- **Total: $10-15/month**

## Conclusion

The Camera Translation feature is a powerful, premium tool that:
- ✅ Drives BiteLing+ subscriptions ($20 each)
- ✅ Provides real value to language learners
- ✅ Works completely free with Tesseract.js
- ✅ Easy to upgrade to cloud OCR later
- ✅ Mobile-first, responsive design
- ✅ Privacy-focused (local processing)

This feature positions BiteLing as a comprehensive learning platform with cutting-edge AR-like capabilities!
