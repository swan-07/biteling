// HSK 1 Vocabulary Deck (150 words)
const hsk1Deck = [
    { chinese: "你好", pinyin: "nǐ hǎo", definition: "hello", example: "你好！很高兴见到你。" },
    { chinese: "谢谢", pinyin: "xiè xie", definition: "thank you", example: "谢谢你的帮助。" },
    { chinese: "再见", pinyin: "zài jiàn", definition: "goodbye", example: "再见！明天见。" },
    { chinese: "我", pinyin: "wǒ", definition: "I, me", example: "我是学生。" },
    { chinese: "你", pinyin: "nǐ", definition: "you", example: "你叫什么名字？" },
    { chinese: "他", pinyin: "tā", definition: "he, him", example: "他是我朋友。" },
    { chinese: "她", pinyin: "tā", definition: "she, her", example: "她很漂亮。" },
    { chinese: "是", pinyin: "shì", definition: "to be", example: "这是我的书。" },
    { chinese: "的", pinyin: "de", definition: "possessive particle", example: "我的妈妈很好。" },
    { chinese: "不", pinyin: "bù", definition: "not, no", example: "我不是老师。" },
    { chinese: "吗", pinyin: "ma", definition: "question particle", example: "你好吗？" },
    { chinese: "呢", pinyin: "ne", definition: "question particle", example: "你呢？" },
    { chinese: "什么", pinyin: "shén me", definition: "what", example: "这是什么？" },
    { chinese: "谁", pinyin: "shéi", definition: "who", example: "他是谁？" },
    { chinese: "哪", pinyin: "nǎ", definition: "which", example: "你是哪国人？" },
    { chinese: "这", pinyin: "zhè", definition: "this", example: "这是我的。" },
    { chinese: "那", pinyin: "nà", definition: "that", example: "那是什么？" },
    { chinese: "一", pinyin: "yī", definition: "one", example: "我有一个朋友。" },
    { chinese: "二", pinyin: "èr", definition: "two", example: "我有二个苹果。" },
    { chinese: "三", pinyin: "sān", definition: "three", example: "三个人。" }
];

// ========================================
// SPACED REPETITION SYSTEM (SRS)
// ========================================

// SRS Intervals (in minutes for testing, will convert to days for production)
const SRS_INTERVALS = {
    again: 1,      // 1 minute (for testing) - in production: same day
    hard: 10,      // 10 minutes (for testing) - in production: 1 day
    good: 1440,    // 1 day (in minutes)
    easy: 4320     // 3 days (in minutes)
};

// Mastery thresholds
const MASTERY_THRESHOLD = 4; // Number of "good" or "easy" ratings needed for mastery

// Card state structure
class CardState {
    constructor(word) {
        this.word = word;
        this.interval = 0;           // Minutes until next review
        this.dueDate = Date.now();   // When card is due for review
        this.ease = 2.5;             // Ease factor (like Anki)
        this.reviews = 0;            // Total reviews
        this.lapses = 0;             // Times clicked "Again"
        this.successfulReviews = 0;  // Times clicked "Good" or "Easy"
        this.masteryLevel = 0;       // 0-4, 4 = mastered
        this.lastReview = null;
    }
}

// Load or initialize card states
function loadCardStates() {
    const saved = localStorage.getItem('cardStates');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Convert plain objects back to CardState instances
        const states = {};
        for (const word in parsed) {
            states[word] = Object.assign(new CardState(word), parsed[word]);
        }
        return states;
    }
    return {};
}

// Save card states
function saveCardStates(states) {
    localStorage.setItem('cardStates', JSON.stringify(states));
}

// Get or create card state
function getCardState(word, cardStates) {
    if (!cardStates[word]) {
        cardStates[word] = new CardState(word);
    }
    return cardStates[word];
}

// Calculate next interval based on rating (SM-2 algorithm, simplified)
function calculateNextInterval(state, rating) {
    let newInterval;
    let newEase = state.ease;

    switch(rating) {
        case 'again':
            newInterval = SRS_INTERVALS.again;
            newEase = Math.max(1.3, state.ease - 0.2);
            state.lapses++;
            state.masteryLevel = Math.max(0, state.masteryLevel - 1);
            break;

        case 'hard':
            newInterval = Math.max(SRS_INTERVALS.hard, state.interval * 1.2);
            newEase = Math.max(1.3, state.ease - 0.15);
            break;

        case 'good':
            if (state.interval === 0) {
                newInterval = SRS_INTERVALS.good;
            } else {
                newInterval = state.interval * state.ease;
            }
            state.successfulReviews++;
            state.masteryLevel = Math.min(MASTERY_THRESHOLD, state.masteryLevel + 1);
            break;

        case 'easy':
            if (state.interval === 0) {
                newInterval = SRS_INTERVALS.easy;
            } else {
                newInterval = state.interval * state.ease * 1.3;
            }
            newEase = state.ease + 0.15;
            state.successfulReviews++;
            state.masteryLevel = Math.min(MASTERY_THRESHOLD, state.masteryLevel + 1);
            break;
    }

    state.interval = newInterval;
    state.ease = newEase;
    state.dueDate = Date.now() + (newInterval * 60 * 1000); // Convert minutes to milliseconds
    state.reviews++;
    state.lastReview = Date.now();

    return state;
}

// Build review deck based on due cards
function buildReviewDeck() {
    const customWords = JSON.parse(localStorage.getItem('customDeck') || '[]');
    const combinedDeck = [...hsk1Deck, ...customWords];

    // Remove duplicates
    const uniqueDeck = [];
    const seenWords = new Set();
    for (const card of combinedDeck) {
        if (!seenWords.has(card.chinese)) {
            uniqueDeck.push(card);
            seenWords.add(card.chinese);
        }
    }

    const cardStates = loadCardStates();
    const now = Date.now();

    // Get cards that are due for review
    const dueCards = uniqueDeck.filter(card => {
        const state = getCardState(card.chinese, cardStates);
        return state.dueDate <= now;
    });

    // If no due cards, add some new cards
    if (dueCards.length === 0) {
        const newCards = uniqueDeck.filter(card => {
            const state = getCardState(card.chinese, cardStates);
            return state.reviews === 0;
        }).slice(0, 20);
        return newCards;
    }

    // Sort by due date (oldest first) and limit to daily goal
    dueCards.sort((a, b) => {
        const stateA = getCardState(a.chinese, cardStates);
        const stateB = getCardState(b.chinese, cardStates);
        return stateA.dueDate - stateB.dueDate;
    });

    return dueCards.slice(0, 20);
}

// Build dictionary from review + custom deck
function buildWordDictionary() {
    const customWords = JSON.parse(localStorage.getItem('customDeck') || '[]');
    const combinedDeck = [...hsk1Deck, ...customWords];

    const dictionary = {};
    combinedDeck.forEach(card => {
        if (!dictionary[card.chinese]) {
            dictionary[card.chinese] = {
                pinyin: card.pinyin || '',
                definition: card.definition || '',
                example: card.example || ''
            };
        }
    });

    return dictionary;
}

// State
let currentCardIndex = 0;
let cardsReviewed = 0;
let cookiesEarned = 0;
let showingAnswer = false;
let masteredInSession = 0;
const dailyGoal = 20;
let cardType = 'chinese-english'; // 'chinese-english', 'english-chinese', or 'both'
let currentCardDirection = 'chinese-english'; // Direction of the current card being shown

let reviewDeck = buildReviewDeck();
let cardStates = loadCardStates();
let sessionQueue = []; // Queue for cards that need to be seen again in this session
let wordDictionary = {};
let maxDictWordLength = 1;
let addedWords = new Set();

// Azure TTS Configuration (loaded from config.js)
const AZURE_CONFIG = {
    get subscriptionKey() { return window.ENV_CONFIG?.AZURE_SPEECH_KEY || ''; },
    get region() { return window.ENV_CONFIG?.AZURE_SPEECH_REGION || ''; }
};

// Initialize
function init() {
    wordDictionary = buildWordDictionary();
    maxDictWordLength = Math.max(1, ...Object.keys(wordDictionary).map(word => word.length));
    loadAddedWords();
    setupExampleWordClicks();
    setupCardTypeSelector();

    if (reviewDeck.length === 0) {
        alert('No cards due for review! Come back later or add more words from books.');
        window.location.href = '../index.html';
        return;
    }

    loadCard(currentCardIndex);
    updateProgress();

    // Show answer button click
    document.getElementById('showAnswerBtn').addEventListener('click', showAnswer);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

// Current card being displayed
let currentCard = null;

// Load card
function loadCard(index) {
    // Check if we have cards in the session queue first
    if (sessionQueue.length > 0) {
        currentCard = sessionQueue.shift(); // Get first card from queue
        determineCardDirection(); // Determine direction for this card
        displayCard(currentCard);
        return;
    }

    if (index >= reviewDeck.length) {
        finishReview();
        return;
    }

    currentCard = reviewDeck[index];
    determineCardDirection(); // Determine direction for this card
    displayCard(currentCard);
}

// Display a card on screen
function displayCard(card) {
    const state = getCardState(card.chinese, cardStates);

    // Use the determined card direction
    if (currentCardDirection === 'chinese-english') {
        // Chinese → English
        document.getElementById('question').textContent = card.chinese;
        document.getElementById('hint').textContent = card.pinyin;
        document.getElementById('answer').textContent = card.definition;
    } else {
        // English → Chinese
        document.getElementById('question').textContent = card.definition;
        document.getElementById('hint').textContent = ''; // No pinyin hint for English→Chinese
        document.getElementById('answer').textContent = card.chinese + ' (' + card.pinyin + ')';
    }

    renderExampleSentence(card.example);

    // Update mastery indicator
    updateMasteryIndicator(state.masteryLevel);

    // Update button times based on current state
    updateButtonTimes(state);

    // Reset card state
    showingAnswer = false;
    document.querySelector('.card-back').classList.add('hidden');
    document.getElementById('showAnswerBtn').classList.remove('hidden');
    document.getElementById('ratingButtons').classList.add('hidden');
}

// Render example sentence with clickable words
function renderExampleSentence(text) {
    const exampleEl = document.getElementById('example');
    exampleEl.innerHTML = makeWordsClickable(text);
}

function setupExampleWordClicks() {
    const exampleEl = document.getElementById('example');
    exampleEl.addEventListener('click', (event) => {
        const wordEl = event.target.closest('.word');
        if (!wordEl) return;
        showDictionary(wordEl.dataset.word);
    });

    document.getElementById('dictOverlay').addEventListener('click', closeDictionary);
    document.getElementById('dictCloseBtn').addEventListener('click', closeDictionary);
    document.getElementById('addToDeckBtn').addEventListener('click', addWordToDeck);
}

function makeWordsClickable(text) {
    let result = '';
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (!isCjkChar(char)) {
            result += escapeHtml(char);
            i += 1;
            continue;
        }

        let matched = false;
        const maxLen = Math.min(maxDictWordLength, text.length - i);

        for (let len = maxLen; len >= 1; len--) {
            const word = text.substr(i, len);
            if (wordDictionary[word]) {
                result += `<span class="word" data-word="${escapeAttribute(word)}">${escapeHtml(word)}</span>`;
                i += len;
                matched = true;
                break;
            }
        }

        if (!matched) {
            result += `<span class="word unknown" data-word="${escapeAttribute(char)}">${escapeHtml(char)}</span>`;
            i += 1;
        }
    }

    return result;
}

function showDictionary(word) {
    const entry = wordDictionary[word];

    document.getElementById('dictChinese').textContent = word;
    document.getElementById('dictPinyin').textContent = entry?.pinyin || 'Pinyin not available';
    document.getElementById('dictDefinition').textContent = entry?.definition || 'Definition not available';
    document.getElementById('dictExample').textContent = entry?.example || '';

    const addBtn = document.getElementById('addToDeckBtn');
    addBtn.dataset.word = word;

    if (!entry) {
        addBtn.classList.remove('added');
        addBtn.textContent = 'No entry available';
        addBtn.disabled = true;
    } else if (addedWords.has(word)) {
        addBtn.classList.add('added');
        addBtn.innerHTML = '<span>✓</span>Added to Deck';
        addBtn.disabled = true;
    } else {
        addBtn.classList.remove('added');
        addBtn.innerHTML = '<span>+</span>Add to Review Deck';
        addBtn.disabled = false;
    }

    document.getElementById('dictionaryPopup').classList.add('show');
    document.getElementById('dictOverlay').classList.add('show');
}

function closeDictionary() {
    document.getElementById('dictionaryPopup').classList.remove('show');
    document.getElementById('dictOverlay').classList.remove('show');
}

function addWordToDeck() {
    const addBtn = document.getElementById('addToDeckBtn');
    const word = addBtn.dataset.word;
    const entry = wordDictionary[word];

    if (!word || !entry || addedWords.has(word)) return;

    let customDeck = JSON.parse(localStorage.getItem('customDeck') || '[]');
    customDeck.push({
        chinese: word,
        pinyin: entry.pinyin,
        definition: entry.definition,
        example: entry.example
    });
    localStorage.setItem('customDeck', JSON.stringify(customDeck));

    addedWords.add(word);
    saveAddedWords();

    addBtn.classList.add('added');
    addBtn.innerHTML = '<span>✓</span>Added to Deck';
    addBtn.disabled = true;
}

function loadAddedWords() {
    const saved = localStorage.getItem('addedWords');
    if (saved) {
        addedWords = new Set(JSON.parse(saved));
    }
}

function saveAddedWords() {
    localStorage.setItem('addedWords', JSON.stringify([...addedWords]));
}

// Update button times dynamically
function updateButtonTimes(state) {
    const againBtn = document.querySelector('.rating-btn.again .rating-time');
    const goodBtn = document.querySelector('.rating-btn.good .rating-time');

    // Again is always <1 minute in session
    againBtn.textContent = '<1m';

    // Good time depends on current interval
    let goodTime;
    if (state.interval === 0 || state.reviews === 0) {
        // New card
        goodTime = '1d';
    } else if (state.interval < 60) {
        // Less than 1 hour
        goodTime = Math.round(state.interval * state.ease) + 'm';
    } else if (state.interval < 1440) {
        // Less than 1 day
        const hours = Math.round((state.interval * state.ease) / 60);
        goodTime = hours + 'h';
    } else {
        // Days
        const days = Math.round((state.interval * state.ease) / 1440);
        goodTime = days + 'd';
    }

    goodBtn.textContent = goodTime;
}

// Update mastery indicator
function updateMasteryIndicator(level) {
    const indicators = document.querySelectorAll('.mastery-dot');
    indicators.forEach((dot, index) => {
        if (index < level) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// Show answer
function showAnswer() {
    showingAnswer = true;
    document.querySelector('.card-back').classList.remove('hidden');
    document.getElementById('showAnswerBtn').classList.add('hidden');
    document.getElementById('ratingButtons').classList.remove('hidden');
}

// Rate card with SRS
function rateCard(rating) {
    if (!showingAnswer) return;
    if (!currentCard) return;

    let state = getCardState(currentCard.chinese, cardStates);

    // Calculate next interval
    state = calculateNextInterval(state, rating);

    // Track mastery
    if (state.masteryLevel === MASTERY_THRESHOLD && rating !== 'again') {
        masteredInSession++;
    }

    // Save state
    cardStates[currentCard.chinese] = state;
    saveCardStates(cardStates);

    // If rated "Again", add back to session queue (show again soon)
    if (rating === 'again') {
        // Add to queue after a few cards (position 3-5)
        const position = Math.min(3, sessionQueue.length);
        sessionQueue.splice(position, 0, currentCard);

        // Don't award cookie or increment counters for "Again"
        // Just load next card
        setTimeout(() => {
            loadCard(currentCardIndex);
        }, 200);
        return;
    }

    // Award cookie and increment counters (only for "Good")
    cookiesEarned++;
    cardsReviewed++;

    updateProgress();

    // Move to next card
    if (sessionQueue.length === 0) {
        currentCardIndex++;
    }

    // Load next card
    if (currentCardIndex < reviewDeck.length || sessionQueue.length > 0) {
        setTimeout(() => {
            loadCard(currentCardIndex);
        }, 200);
    } else {
        finishReview();
    }
}

// Update progress
function updateProgress() {
    // Progress is based on original deck size, not including re-queued cards
    const progress = Math.min(100, (currentCardIndex / reviewDeck.length) * 100);
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${cardsReviewed}/${reviewDeck.length}`;
    document.getElementById('cookiesEarned').textContent = cookiesEarned;
}

// Finish review
function finishReview() {
    // Update user data
    const userData = JSON.parse(localStorage.getItem('bitelingData') || '{\"streak\":0,\"cookies\":0,\"cardsReviewed\":0,\"dailyGoal\":20,\"level\":1,\"wordsLearned\":0}');
    userData.cookies += cookiesEarned;
    userData.cardsReviewed = cardsReviewed;

    // Calculate total mastered words
    const allStates = loadCardStates();
    const masteredWords = Object.values(allStates).filter(state =>
        state.masteryLevel === MASTERY_THRESHOLD
    ).length;

    userData.wordsLearned = masteredWords;

    // Update level based on mastered words (HSK levels)
    if (masteredWords >= 5000) userData.level = 6;
    else if (masteredWords >= 2500) userData.level = 5;
    else if (masteredWords >= 1200) userData.level = 4;
    else if (masteredWords >= 600) userData.level = 3;
    else if (masteredWords >= 300) userData.level = 2;
    else if (masteredWords >= 150) userData.level = 2;

    // Mark daily review complete with today's date
    if (cardsReviewed >= dailyGoal) {
        userData.streak += 1;
        userData.lastReviewDate = new Date().toDateString();
    }

    localStorage.setItem('bitelingData', JSON.stringify(userData));

    // Save session data
    sessionStorage.setItem('reviewSession', JSON.stringify({
        cardsReviewed: cardsReviewed,
        cookiesEarned: cookiesEarned,
        masteredInSession: masteredInSession
    }));

    // Go to completion screen
    window.location.href = 'complete.html';
}

// Play audio pronunciation
function playAudio() {
    if (!currentCard) return;
    const text = currentCard.chinese;

    // Try Azure TTS first
    if (AZURE_CONFIG.subscriptionKey && AZURE_CONFIG.region) {
        synthesizeSpeech(text);
    } else {
        // Fallback to Web Speech API
        playAudioFallback(text);
    }
}

// Azure TTS
async function synthesizeSpeech(text) {
    try {
        const tokenResponse = await fetch(`https://${AZURE_CONFIG.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
            method: 'POST',
            headers: { 'Ocp-Apim-Subscription-Key': AZURE_CONFIG.subscriptionKey }
        });

        const token = await tokenResponse.text();
        const url = `https://${AZURE_CONFIG.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

        const ssml = `
            <speak version='1.0' xml:lang='zh-CN'>
                <voice xml:lang='zh-CN' name='zh-CN-XiaoxiaoNeural'>
                    <prosody rate='0.8'>${text}</prosody>
                </voice>
            </speak>
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
            },
            body: ssml
        });

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error('Azure TTS error:', error);
        playAudioFallback(text);
    }
}

// Fallback Web Speech API
function playAudioFallback(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function isCjkChar(char) {
    return /[\u4E00-\u9FFF]/.test(char);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeAttribute(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
}

// Keyboard shortcuts
function handleKeyPress(e) {
    if (!showingAnswer && e.code === 'Space') {
        e.preventDefault();
        showAnswer();
    } else if (showingAnswer) {
        switch(e.code) {
            case 'Digit1':
                rateCard('again');
                break;
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
                rateCard('good');
                break;
        }
    }
}

// Card Type Selector
function setupCardTypeSelector() {
    const buttons = document.querySelectorAll('.card-type-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update card type
            cardType = btn.dataset.type;

            // Reload current card with new direction
            determineCardDirection();
            loadCard(currentCardIndex);
        });
    });
}

function determineCardDirection() {
    if (cardType === 'both') {
        // Randomly choose direction for each card
        currentCardDirection = Math.random() < 0.5 ? 'chinese-english' : 'english-chinese';
    } else {
        currentCardDirection = cardType;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
