// Import user data manager
import userDataManager from './user-data.js';

// ========================================
// STATE MANAGEMENT
// ========================================

let stream = null;
let currentCamera = 'environment'; // Start with back camera
let flashlightOn = false;
let isProcessing = false;
let isScreenShare = false; // Track if using screen share instead of camera
let popupWindow = null; // Reference to popup window for results
let ocrWorker = null; // Persistent Tesseract worker to avoid reloading
let ccdictDictionary = {}; // CC-CEDICT dictionary (loaded from API)
let isDictionaryLoaded = false;

// Fallback Chinese dictionary (sample - used while CC-CEDICT loads)
const chineseDictionary = {
    '你': { pinyin: 'nǐ', english: 'you' },
    '好': { pinyin: 'hǎo', english: 'good, well' },
    '我': { pinyin: 'wǒ', english: 'I, me' },
    '是': { pinyin: 'shì', english: 'to be, am, is, are' },
    '的': { pinyin: 'de', english: 'possessive particle, of' },
    '人': { pinyin: 'rén', english: 'person, people' },
    '在': { pinyin: 'zài', english: 'at, in, on, to be (located)' },
    '有': { pinyin: 'yǒu', english: 'to have, there is/are' },
    '这': { pinyin: 'zhè', english: 'this, these' },
    '中': { pinyin: 'zhōng', english: 'middle, center, China' },
    '大': { pinyin: 'dà', english: 'big, large, great' },
    '来': { pinyin: 'lái', english: 'to come, to arrive' },
    '上': { pinyin: 'shàng', english: 'up, on, above' },
    '国': { pinyin: 'guó', english: 'country, nation' },
    '个': { pinyin: 'gè', english: 'measure word for general use' },
    '到': { pinyin: 'dào', english: 'to arrive, to reach' },
    '说': { pinyin: 'shuō', english: 'to say, to speak' },
    '们': { pinyin: 'men', english: 'plural marker for pronouns' },
    '为': { pinyin: 'wèi', english: 'for, to, as' },
    '子': { pinyin: 'zǐ', english: 'son, child, seed' },
    '学': { pinyin: 'xué', english: 'to study, to learn' },
    '生': { pinyin: 'shēng', english: 'to be born, life, raw' },
    '中国': { pinyin: 'zhōngguó', english: 'China' },
    '学生': { pinyin: 'xuésheng', english: 'student' },
    '你好': { pinyin: 'nǐhǎo', english: 'hello, hi' },
    '谢谢': { pinyin: 'xièxie', english: 'thank you' },
    '再见': { pinyin: 'zàijiàn', english: 'goodbye' },
    '对不起': { pinyin: 'duìbùqǐ', english: 'sorry, excuse me' },
    '没关系': { pinyin: 'méiguānxi', english: "it doesn't matter, never mind" }
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await checkPremiumStatus();
    setupEventListeners();

    // Load CC-CEDICT in background
    loadCCCEDICT();
});

async function checkPremiumStatus() {
    const isPremium = localStorage.getItem('isPremium') === 'true';

    if (!isPremium) {
        // Show premium gate
        document.getElementById('premiumGate').classList.remove('hidden');
        document.getElementById('cameraContainer').classList.add('hidden');
        document.getElementById('instructions').classList.add('hidden');
    } else {
        // Initialize camera for premium users
        await initializeCamera();

        // Pre-initialize Tesseract worker in background
        initializeTesseract();
    }
}

async function initializeTesseract() {
    try {
        console.log('Pre-loading Tesseract OCR engine...');

        // Check if Tesseract is available (access via window for ES6 modules)
        if (typeof window.Tesseract === 'undefined') {
            console.error('Tesseract.js is not loaded! Make sure the CDN script is included.');
            return;
        }

        // Create worker using Tesseract v5 API (simpler than v4)
        ocrWorker = await window.Tesseract.createWorker('chi_sim', 1, {
            logger: m => {
                console.log('Tesseract init:', m);
                if (m.status === 'loading language traineddata') {
                    console.log(`Loading Chinese model... ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        console.log('✅ Tesseract OCR ready! Chinese model cached.');
    } catch (error) {
        console.error('Failed to pre-load Tesseract:', error);
        console.error('Error details:', error.message, error.stack);
        // Don't show error to user, will retry on first capture
    }
}

async function loadCCCEDICT() {
    try {
        console.log('Loading CC-CEDICT dictionary...');

        // Use CC-CEDICT API from GitHub
        const response = await fetch('https://raw.githubusercontent.com/skishore/makemeahanzi/master/cedict_ts.u8');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        const lines = text.split('\n');
        let count = 0;

        for (const line of lines) {
            // Skip comments and empty lines
            if (line.startsWith('#') || line.trim() === '') continue;

            // Parse CC-CEDICT format:
            // Traditional Simplified [pin1 yin1] /definition1/definition2/
            const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//);

            if (match) {
                const traditional = match[1];
                const simplified = match[2];
                const pinyin = match[3];
                const definitions = match[4].split('/').filter(d => d.trim());
                const english = definitions.join('; ');

                // Store both traditional and simplified
                ccdictDictionary[simplified] = { pinyin, english };
                if (traditional !== simplified) {
                    ccdictDictionary[traditional] = { pinyin, english };
                }
                count++;
            }
        }

        isDictionaryLoaded = true;
        console.log(`✅ CC-CEDICT loaded! ${count} entries available.`);
    } catch (error) {
        console.error('Failed to load CC-CEDICT:', error);
        console.log('Will use fallback dictionary with limited entries.');
    }
}

// ========================================
// CAMERA MANAGEMENT
// ========================================

async function initializeCamera() {
    try {
        const constraints = {
            video: {
                facingMode: currentCamera,
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('videoFeed');
        video.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                console.log('Camera initialized:', video.videoWidth, 'x', video.videoHeight);
                resolve();
            };
        });

        console.log('Camera ready');
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check permissions and try again.');
    }
}

async function switchCamera() {
    if (!stream) return;

    // Stop current stream
    stream.getTracks().forEach(track => track.stop());

    // Toggle camera
    currentCamera = currentCamera === 'environment' ? 'user' : 'environment';

    // Restart with new camera
    await initializeCamera();
}

async function toggleFlashlight() {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (!capabilities.torch) {
        alert('Flashlight not supported on this device');
        return;
    }

    try {
        flashlightOn = !flashlightOn;
        await track.applyConstraints({
            advanced: [{ torch: flashlightOn }]
        });

        const flashBtn = document.getElementById('flashlightBtn');
        flashBtn.style.background = flashlightOn
            ? 'linear-gradient(135deg, #FFD700 0%, #FFC700 100%)'
            : 'rgba(255, 255, 255, 0.95)';
    } catch (error) {
        console.error('Error toggling flashlight:', error);
    }
}

async function toggleScreenShare() {
    if (isScreenShare) {
        // Switch back to camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        isScreenShare = false;
        await initializeCamera();

        // Update button appearance
        const screenBtn = document.getElementById('screenShareBtn');
        screenBtn.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
        // Switch to screen share
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                }
            });

            const video = document.getElementById('videoFeed');
            video.srcObject = stream;

            isScreenShare = true;

            // Update button appearance
            const screenBtn = document.getElementById('screenShareBtn');
            screenBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)';

            console.log('Screen share started');
        } catch (error) {
            console.error('Error starting screen share:', error);
            alert('Screen share not available or permission denied');
        }
    }
}

// ========================================
// CAPTURE & OCR
// ========================================

async function captureAndTranslate() {
    if (isProcessing) return;

    isProcessing = true;
    document.getElementById('processing').classList.remove('hidden');

    try {
        // Capture frame from video
        const video = document.getElementById('videoFeed');

        // Validate video element
        if (!video) {
            throw new Error('Video element not found');
        }

        if (!video.videoWidth || !video.videoHeight) {
            throw new Error('Video not ready. Please wait for camera to initialize.');
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');

        // Validate canvas context
        if (!ctx) {
            throw new Error('Failed to create canvas context');
        }

        ctx.drawImage(video, 0, 0);

        // Pre-process image to improve OCR accuracy
        preprocessImageForOCR(ctx, canvas.width, canvas.height);

        // Perform OCR - pass canvas directly instead of data URL
        // Tesseract.js can work with canvas elements directly
        await performOCR(canvas);
    } catch (error) {
        console.error('Error capturing and translating:', error);
        alert(`Error: ${error.message || 'Error processing image. Please try again.'}`);
    } finally {
        isProcessing = false;
        document.getElementById('processing').classList.add('hidden');
    }
}

async function performOCR(imageSource) {
    try {
        // Real OCR using Tesseract.js
        console.log('Starting Tesseract OCR...');
        console.log('Image source type:', imageSource.constructor.name);

        // Check if Tesseract is available (access via window for ES6 modules)
        if (typeof window.Tesseract === 'undefined') {
            throw new Error('Tesseract.js is not loaded. Please refresh the page.');
        }

        // Update processing message
        const processingDiv = document.getElementById('processing');
        const processingText = processingDiv.querySelector('p');

        // If worker not ready, initialize it now
        if (!ocrWorker) {
            if (processingText) {
                processingText.textContent = 'Initializing OCR (first time)...';
            }

            // Create worker using Tesseract v5 API
            ocrWorker = await window.Tesseract.createWorker('chi_sim', 1, {
                logger: m => {
                    console.log('Tesseract:', m);
                    if (processingText) {
                        if (m.status === 'loading tesseract core') {
                            processingText.textContent = 'Loading OCR engine...';
                        } else if (m.status === 'initializing tesseract') {
                            processingText.textContent = 'Initializing...';
                        } else if (m.status === 'loading language traineddata') {
                            processingText.textContent = `Loading Chinese model... ${Math.round(m.progress * 100)}%`;
                        } else if (m.status === 'initializing api') {
                            processingText.textContent = 'Getting ready...';
                        } else if (m.status === 'recognizing text') {
                            processingText.textContent = `Recognizing text... ${Math.round(m.progress * 100)}%`;
                        }
                    }
                }
            });
        }

        // Recognize text from image using persistent worker
        if (processingText) {
            processingText.textContent = 'Reading Chinese text...';
        }

        // Tesseract.js accepts: Canvas, Image, Video, or data URL
        // We're passing a canvas element directly
        console.log('Starting OCR recognition with word detection...');
        const { data } = await ocrWorker.recognize(imageSource);

        console.log('OCR Result:', data.text);
        console.log('Word count:', data.words.length);

        // Get all detected words with their bounding boxes
        const detectedWords = data.words.filter(word => {
            // Only keep Chinese text
            const cleanText = word.text.replace(/[^\u4e00-\u9fa5]/g, '');
            return cleanText.length > 0;
        });

        if (detectedWords.length > 0) {
            // Group words into phrases and display translations overlaid on original positions
            await displayOverlayTranslations(detectedWords, imageSource);
        } else {
            alert('No Chinese text detected. Try:\n- Better lighting\n- Clearer focus\n- Larger text\n- Higher contrast');
        }
    } catch (error) {
        console.error('OCR Error:', error);
        console.error('Error type:', typeof error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        const errorMessage = error.message || error.toString() || 'Unknown error';
        alert(`OCR Error: ${errorMessage}\n\nTip: Make sure you have a stable internet connection for first-time setup.\n\nCheck the browser console (F12) for more details.`);

        // Reset worker on error
        if (ocrWorker) {
            try {
                await ocrWorker.terminate();
            } catch (e) {
                console.error('Error terminating worker:', e);
            }
            ocrWorker = null;
        }
    }
}

// ========================================
// TRANSLATION & DISPLAY
// ========================================

async function displayOverlayTranslations(detectedWords, sourceCanvas) {
    // Get overlay canvas
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    const video = document.getElementById('videoFeed');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Group nearby words into phrases (words on same line, close together)
    const phrases = groupWordsIntoPhrases(detectedWords);

    console.log(`Grouped ${detectedWords.length} words into ${phrases.length} phrases`);

    // Get all translations first (parallel API calls for speed)
    const translationPromises = phrases.map(phrase => getTranslation(phrase.text));
    const translations = await Promise.all(translationPromises);

    // Draw translation for each phrase at its original position
    phrases.forEach((phrase, index) => {
        const chineseText = phrase.text;
        const bbox = phrase.bbox;
        const translation = translations[index];

        // Calculate position (place translation below original text)
        const x = bbox.x0;
        const y = bbox.y1 + 5; // Slightly below the original text
        const width = bbox.x1 - bbox.x0;
        const height = 60; // Height for translation box

        // Draw semi-transparent background (iPhone-style)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(x, y, width, height);

        // Draw border with yellow accent (iPhone Live Text style)
        ctx.strokeStyle = '#FFD60A';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw English translation
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';

        // Wrap text to fit within box width
        const padding = 8;
        wrapTextInBox(ctx, translation.english, x + padding, y + 22, width - padding * 2, 17);

        // Show pinyin in smaller text with yellow accent
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial';
        ctx.fillStyle = '#FFD60A';
        ctx.fillText(translation.pinyin, x + padding, y + height - 8);
    });

    // Also display all phrases in results panel
    const resultsContent = document.getElementById('resultsContent');

    // Remove empty state if present
    const emptyState = resultsContent.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    // Display each phrase with its translation
    phrases.forEach((phrase, index) => {
        const chineseText = phrase.text;
        const translation = translations[index];

        // Create translation item
        const item = document.createElement('div');
        item.className = 'translation-item';

        // Split text into individual characters/words for clicking
        const wordsHTML = splitIntoClickableWords(chineseText);

        item.innerHTML = `
            <div class="chinese-text">${wordsHTML}</div>
            <div class="pinyin">${translation.pinyin}</div>
            <div class="english-translation">${translation.english}</div>
        `;

        // Insert at top
        resultsContent.insertBefore(item, resultsContent.firstChild);

        // Add click handlers to words
        item.querySelectorAll('.word-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                showWordDetails(chip.textContent);
            });
        });
    });

    // Scroll results panel to top
    document.getElementById('resultsPanel').scrollTop = 0;
}

// Pre-process image to improve OCR accuracy
function preprocessImageForOCR(ctx, width, height) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Step 1: Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
        // Grayscale conversion using luminance formula
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Increase contrast (makes text sharper)
        const contrast = 1.5;
        let adjusted = ((gray - 128) * contrast) + 128;

        // Apply threshold for better character recognition
        // Chinese characters benefit from high contrast
        if (adjusted > 140) {
            adjusted = 255; // White
        } else if (adjusted < 100) {
            adjusted = 0; // Black
        }

        // Clamp values
        adjusted = Math.max(0, Math.min(255, adjusted));

        data[i] = data[i + 1] = data[i + 2] = adjusted;
    }

    // Step 2: Apply sharpening filter to enhance edges
    const sharpenKernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ];

    const tempData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            let sum = 0;

            // Apply kernel
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const kidx = ((y + ky) * width + (x + kx)) * 4;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);
                    sum += tempData[kidx] * sharpenKernel[kernelIdx];
                }
            }

            sum = Math.max(0, Math.min(255, sum));
            data[idx] = data[idx + 1] = data[idx + 2] = sum;
        }
    }

    // Put processed image back
    ctx.putImageData(imageData, 0, 0);
}

// Group detected words into phrases based on proximity
function groupWordsIntoPhrases(words) {
    if (words.length === 0) return [];

    const phrases = [];
    let currentPhrase = {
        text: '',
        bbox: null,
        words: []
    };

    // Sort words by position (top to bottom, left to right)
    const sortedWords = words.sort((a, b) => {
        const yDiff = a.bbox.y0 - b.bbox.y0;
        if (Math.abs(yDiff) > 20) return yDiff; // Different lines
        return a.bbox.x0 - b.bbox.x0; // Same line, sort by x
    });

    sortedWords.forEach((word, index) => {
        const cleanText = word.text.replace(/[^\u4e00-\u9fa5]/g, '');
        if (cleanText.length === 0) return;

        if (currentPhrase.words.length === 0) {
            // Start new phrase
            currentPhrase = {
                text: cleanText,
                bbox: { ...word.bbox },
                words: [word]
            };
        } else {
            // Check if word should be added to current phrase
            const lastWord = currentPhrase.words[currentPhrase.words.length - 1];
            const yDistance = Math.abs(word.bbox.y0 - lastWord.bbox.y0);
            const xDistance = word.bbox.x0 - lastWord.bbox.x1;

            // Words on same line and close together = same phrase
            if (yDistance < 20 && xDistance < 30) {
                currentPhrase.text += cleanText;
                // Expand bounding box
                currentPhrase.bbox.x1 = word.bbox.x1;
                currentPhrase.bbox.y0 = Math.min(currentPhrase.bbox.y0, word.bbox.y0);
                currentPhrase.bbox.y1 = Math.max(currentPhrase.bbox.y1, word.bbox.y1);
                currentPhrase.words.push(word);
            } else {
                // Save current phrase and start new one
                phrases.push(currentPhrase);
                currentPhrase = {
                    text: cleanText,
                    bbox: { ...word.bbox },
                    words: [word]
                };
            }
        }
    });

    // Don't forget the last phrase
    if (currentPhrase.words.length > 0) {
        phrases.push(currentPhrase);
    }

    return phrases;
}

// Helper function to wrap text within a box
function wrapTextInBox(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + (line ? ' ' : '') + words[i];
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            line = words[i];
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }

    if (line) {
        ctx.fillText(line, x, currentY);
    }
}

function splitIntoClickableWords(text) {
    // Try to match multi-character words first, then individual characters
    let html = '';
    let i = 0;

    while (i < text.length) {
        let matched = false;

        // Try 4-character words
        if (i + 3 < text.length) {
            const fourChar = text.substring(i, i + 4);
            if (chineseDictionary[fourChar]) {
                html += `<span class="word-chip">${fourChar}</span>`;
                i += 4;
                matched = true;
                continue;
            }
        }

        // Try 3-character words
        if (i + 2 < text.length) {
            const threeChar = text.substring(i, i + 3);
            if (chineseDictionary[threeChar]) {
                html += `<span class="word-chip">${threeChar}</span>`;
                i += 3;
                matched = true;
                continue;
            }
        }

        // Try 2-character words
        if (i + 1 < text.length) {
            const twoChar = text.substring(i, i + 2);
            if (chineseDictionary[twoChar]) {
                html += `<span class="word-chip">${twoChar}</span>`;
                i += 2;
                matched = true;
                continue;
            }
        }

        // Single character
        html += `<span class="word-chip">${text[i]}</span>`;
        i++;
    }

    return html;
}

async function getTranslation(text) {
    try {
        // Use MyMemory Translation API for phrase-level translation
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|en`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData.translatedText) {
            const translation = data.responseData.translatedText;

            // Get pinyin from CC-CEDICT for the phrase
            const pinyin = getPinyin(text);

            return {
                pinyin: pinyin,
                english: translation
            };
        }
    } catch (error) {
        console.error('Translation API error:', error);
    }

    // Fallback: Try CC-CEDICT or character-by-character
    return getFallbackTranslation(text);
}

function getPinyin(text) {
    // Try to get pinyin from CC-CEDICT
    if (isDictionaryLoaded && ccdictDictionary[text]) {
        return ccdictDictionary[text].pinyin;
    }

    // Build pinyin from individual characters
    const characters = text.split('');
    const pinyinParts = [];

    for (const char of characters) {
        if (isDictionaryLoaded && ccdictDictionary[char]) {
            pinyinParts.push(ccdictDictionary[char].pinyin);
        } else if (chineseDictionary[char]) {
            pinyinParts.push(chineseDictionary[char].pinyin);
        } else {
            pinyinParts.push(char);
        }
    }

    return pinyinParts.join(' ');
}

function getFallbackTranslation(text) {
    // Try CC-CEDICT first (if loaded)
    if (isDictionaryLoaded && ccdictDictionary[text]) {
        return ccdictDictionary[text];
    }

    // Try fallback dictionary
    if (chineseDictionary[text]) {
        return chineseDictionary[text];
    }

    // Try to build translation from individual characters
    const characters = text.split('');
    const pinyinParts = [];
    const englishParts = [];

    for (const char of characters) {
        // Try CC-CEDICT first
        if (isDictionaryLoaded && ccdictDictionary[char]) {
            pinyinParts.push(ccdictDictionary[char].pinyin);
            englishParts.push(ccdictDictionary[char].english);
        }
        // Try fallback dictionary
        else if (chineseDictionary[char]) {
            pinyinParts.push(chineseDictionary[char].pinyin);
            englishParts.push(chineseDictionary[char].english);
        }
        // Unknown character
        else {
            pinyinParts.push(char);
            englishParts.push('[unknown]');
        }
    }

    return {
        pinyin: pinyinParts.join(' '),
        english: englishParts.length > 0 ? englishParts.join('; ') : '[No translation available]'
    };
}

async function showWordDetails(word) {
    const modal = document.getElementById('wordModal');
    const wordDetails = document.getElementById('wordDetails');

    const translation = await getTranslation(word);

    wordDetails.innerHTML = `
        <div class="word-character">${word}</div>
        <div class="word-pinyin">${translation.pinyin}</div>
        <div class="word-definition">${translation.english}</div>
        <button class="add-to-deck-btn" onclick="window.addWordToDeck('${word}')">
            Add to Review Deck
        </button>
    `;

    modal.classList.remove('hidden');
}

window.addWordToDeck = async function(word) {
    const translation = await getTranslation(word);

    // Get existing cards
    const saved = localStorage.getItem('bitelingData');
    let data = saved ? JSON.parse(saved) : { cards: [] };

    // Check if word already exists
    const exists = data.cards.some(card => card.chinese === word);

    if (exists) {
        alert('This word is already in your review deck!');
        return;
    }

    // Add new card
    const newCard = {
        chinese: word,
        pinyin: translation.pinyin,
        english: translation.english,
        masteryLevel: 0,
        nextReview: Date.now(),
        reviewCount: 0
    };

    data.cards.push(newCard);
    localStorage.setItem('bitelingData', JSON.stringify(data));

    // Close modal
    document.getElementById('wordModal').classList.add('hidden');

    // Show success message
    alert(`Added "${word}" to your review deck!`);
};

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Capture button
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', captureAndTranslate);
    }

    // Flashlight button
    const flashBtn = document.getElementById('flashlightBtn');
    if (flashBtn) {
        flashBtn.addEventListener('click', toggleFlashlight);
    }

    // Switch camera button
    const switchBtn = document.getElementById('switchCameraBtn');
    if (switchBtn) {
        switchBtn.addEventListener('click', switchCamera);
    }

    // Screen share button
    const screenBtn = document.getElementById('screenShareBtn');
    if (screenBtn) {
        screenBtn.addEventListener('click', toggleScreenShare);
    }

    // Clear results button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const resultsContent = document.getElementById('resultsContent');
            resultsContent.innerHTML = `
                <div class="empty-state">
                    <p class="empty-icon">👆</p>
                    <p>Point your camera at Chinese text and tap the capture button</p>
                </div>
            `;
        });
    }

    // Close word modal
    const closeModalBtn = document.getElementById('closeWordModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('wordModal').classList.add('hidden');
        });
    }

    // Close modal on overlay click
    const modalOverlay = document.getElementById('wordModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }
}

// ========================================
// CLEANUP
// ========================================

window.addEventListener('beforeunload', async () => {
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // Terminate OCR worker
    if (ocrWorker) {
        try {
            await ocrWorker.terminate();
        } catch (e) {
            console.error('Error terminating OCR worker:', e);
        }
    }
});
