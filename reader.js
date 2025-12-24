// Book content database
const bookContent = {
    'book1': {
        title: '小猫钓鱼',
        titleEn: 'The Kitten Goes Fishing',
        chapters: [
            {
                title: '第一章：去钓鱼',
                content: [
                    '今天天气很好。小猫想去钓鱼。',
                    '小猫拿着鱼竿，走到河边。河水很清。',
                    '小猫坐下来，开始钓鱼。'
                ]
            },
            {
                title: '第二章：蝴蝶来了',
                content: [
                    '小猫在钓鱼。一只蝴蝶飞来了。',
                    '蝴蝶很漂亮。小猫想抓蝴蝶。',
                    '小猫放下鱼竿，去追蝴蝶。蝴蝶飞走了。'
                ]
            },
            {
                title: '第三章：学到了什么',
                content: [
                    '小猫回到河边。妈妈问："你钓到鱼了吗？"',
                    '小猫说："没有。我去追蝴蝶了。"',
                    '妈妈说："做事要专心，不要三心二意。"小猫明白了。'
                ]
            }
        ]
    },
    'book2': {
        title: '我的家',
        titleEn: 'My Family',
        chapters: [
            {
                title: '第一章：我的家人',
                content: [
                    '我有一个幸福的家。我家有四口人。',
                    '我的爸爸，我的妈妈，我的妹妹，还有我。',
                    '我们都住在一起，很快乐。'
                ]
            },
            {
                title: '第二章：爸爸妈妈',
                content: [
                    '我的爸爸是老师。他很忙，但是很爱我们。',
                    '我的妈妈是医生。她做饭很好吃。',
                    '爸爸妈妈都很好。我爱他们。'
                ]
            },
            {
                title: '第三章：妹妹',
                content: [
                    '我的妹妹很可爱。她今年五岁。',
                    '她喜欢唱歌和跳舞。我们常常一起玩。',
                    '我很喜欢我的妹妹。'
                ]
            },
            {
                title: '第四章：我们的家',
                content: [
                    '我们的家不大，但是很温暖。',
                    '每天晚上，我们一起吃晚饭，一起看电视。',
                    '这就是我的家。我爱我的家。'
                ]
            }
        ]
    }
};

// Vocabulary dictionary (HSK 1 words from the stories)
const dictionary = {
    '今天': { pinyin: 'jīn tiān', definition: 'today', example: '今天天气很好。' },
    '天气': { pinyin: 'tiān qì', definition: 'weather', example: '今天天气很好。' },
    '很': { pinyin: 'hěn', definition: 'very', example: '天气很好。' },
    '好': { pinyin: 'hǎo', definition: 'good', example: '今天天气很好。' },
    '小': { pinyin: 'xiǎo', definition: 'small, little', example: '小猫很可爱。' },
    '猫': { pinyin: 'māo', definition: 'cat', example: '小猫在钓鱼。' },
    '想': { pinyin: 'xiǎng', definition: 'to want, to think', example: '我想去钓鱼。' },
    '去': { pinyin: 'qù', definition: 'to go', example: '我想去钓鱼。' },
    '钓鱼': { pinyin: 'diào yú', definition: 'to fish', example: '小猫想去钓鱼。' },
    '拿': { pinyin: 'ná', definition: 'to take, to hold', example: '小猫拿着鱼竿。' },
    '着': { pinyin: 'zhe', definition: 'particle (continuous action)', example: '小猫拿着鱼竿。' },
    '鱼竿': { pinyin: 'yú gān', definition: 'fishing rod', example: '小猫拿着鱼竿。' },
    '走': { pinyin: 'zǒu', definition: 'to walk, to go', example: '走到河边。' },
    '到': { pinyin: 'dào', definition: 'to arrive', example: '走到河边。' },
    '河边': { pinyin: 'hé biān', definition: 'riverside', example: '走到河边。' },
    '河': { pinyin: 'hé', definition: 'river', example: '河水很清。' },
    '水': { pinyin: 'shuǐ', definition: 'water', example: '河水很清。' },
    '清': { pinyin: 'qīng', definition: 'clear', example: '河水很清。' },
    '坐': { pinyin: 'zuò', definition: 'to sit', example: '小猫坐下来。' },
    '下': { pinyin: 'xià', definition: 'down, below', example: '小猫坐下来。' },
    '来': { pinyin: 'lái', definition: 'to come', example: '小猫坐下来。' },
    '开始': { pinyin: 'kāi shǐ', definition: 'to begin, to start', example: '开始钓鱼。' },
    '在': { pinyin: 'zài', definition: 'at, in, on', example: '小猫在钓鱼。' },
    '一': { pinyin: 'yī', definition: 'one', example: '一只蝴蝶。' },
    '只': { pinyin: 'zhī', definition: 'measure word (animals)', example: '一只蝴蝶。' },
    '蝴蝶': { pinyin: 'hú dié', definition: 'butterfly', example: '一只蝴蝶飞来了。' },
    '飞': { pinyin: 'fēi', definition: 'to fly', example: '蝴蝶飞来了。' },
    '了': { pinyin: 'le', definition: 'particle (completed action)', example: '蝴蝶飞来了。' },
    '漂亮': { pinyin: 'piào liang', definition: 'beautiful, pretty', example: '蝴蝶很漂亮。' },
    '抓': { pinyin: 'zhuā', definition: 'to catch, to grab', example: '小猫想抓蝴蝶。' },
    '放下': { pinyin: 'fàng xià', definition: 'to put down', example: '小猫放下鱼竿。' },
    '追': { pinyin: 'zhuī', definition: 'to chase', example: '去追蝴蝶。' },
    '走了': { pinyin: 'zǒu le', definition: 'left, went away', example: '蝴蝶飞走了。' },
    '回': { pinyin: 'huí', definition: 'to return', example: '小猫回到河边。' },
    '妈妈': { pinyin: 'mā ma', definition: 'mom, mother', example: '妈妈问小猫。' },
    '问': { pinyin: 'wèn', definition: 'to ask', example: '妈妈问："你钓到鱼了吗？"' },
    '你': { pinyin: 'nǐ', definition: 'you', example: '你钓到鱼了吗？' },
    '鱼': { pinyin: 'yú', definition: 'fish', example: '你钓到鱼了吗？' },
    '吗': { pinyin: 'ma', definition: 'question particle', example: '你钓到鱼了吗？' },
    '说': { pinyin: 'shuō', definition: 'to say, to speak', example: '小猫说。' },
    '没有': { pinyin: 'méi yǒu', definition: 'to not have, did not', example: '没有钓到鱼。' },
    '我': { pinyin: 'wǒ', definition: 'I, me', example: '我去追蝴蝶了。' },
    '做事': { pinyin: 'zuò shì', definition: 'to do things', example: '做事要专心。' },
    '要': { pinyin: 'yào', definition: 'must, should', example: '要专心。' },
    '专心': { pinyin: 'zhuān xīn', definition: 'to concentrate', example: '做事要专心。' },
    '不要': { pinyin: 'bù yào', definition: 'don\'t', example: '不要三心二意。' },
    '三心二意': { pinyin: 'sān xīn èr yì', definition: 'half-hearted, distracted', example: '不要三心二意。' },
    '明白': { pinyin: 'míng bái', definition: 'to understand', example: '小猫明白了。' },
    '有': { pinyin: 'yǒu', definition: 'to have', example: '我有一个家。' },
    '一个': { pinyin: 'yí gè', definition: 'one (measure word)', example: '一个家。' },
    '幸福': { pinyin: 'xìng fú', definition: 'happy, happiness', example: '幸福的家。' },
    '家': { pinyin: 'jiā', definition: 'home, family', example: '我的家。' },
    '四': { pinyin: 'sì', definition: 'four', example: '四口人。' },
    '口': { pinyin: 'kǒu', definition: 'measure word (people)', example: '四口人。' },
    '人': { pinyin: 'rén', definition: 'person, people', example: '四口人。' },
    '的': { pinyin: 'de', definition: 'possessive particle', example: '我的爸爸。' },
    '爸爸': { pinyin: 'bà ba', definition: 'dad, father', example: '我的爸爸。' },
    '妹妹': { pinyin: 'mèi mei', definition: 'younger sister', example: '我的妹妹。' },
    '还有': { pinyin: 'hái yǒu', definition: 'also, in addition', example: '还有我。' },
    '我们': { pinyin: 'wǒ men', definition: 'we, us', example: '我们都住在一起。' },
    '都': { pinyin: 'dōu', definition: 'all, both', example: '我们都住在一起。' },
    '住': { pinyin: 'zhù', definition: 'to live', example: '住在一起。' },
    '一起': { pinyin: 'yì qǐ', definition: 'together', example: '住在一起。' },
    '快乐': { pinyin: 'kuài lè', definition: 'happy', example: '很快乐。' },
    '是': { pinyin: 'shì', definition: 'to be', example: '爸爸是老师。' },
    '老师': { pinyin: 'lǎo shī', definition: 'teacher', example: '爸爸是老师。' },
    '他': { pinyin: 'tā', definition: 'he, him', example: '他很忙。' },
    '忙': { pinyin: 'máng', definition: 'busy', example: '他很忙。' },
    '但是': { pinyin: 'dàn shì', definition: 'but, however', example: '但是很爱我们。' },
    '爱': { pinyin: 'ài', definition: 'to love', example: '爱我们。' },
    '医生': { pinyin: 'yī shēng', definition: 'doctor', example: '妈妈是医生。' },
    '她': { pinyin: 'tā', definition: 'she, her', example: '她做饭很好吃。' },
    '做饭': { pinyin: 'zuò fàn', definition: 'to cook', example: '她做饭很好吃。' },
    '好吃': { pinyin: 'hǎo chī', definition: 'delicious', example: '做饭很好吃。' },
    '他们': { pinyin: 'tā men', definition: 'they, them', example: '我爱他们。' },
    '可爱': { pinyin: 'kě ài', definition: 'cute, lovely', example: '妹妹很可爱。' },
    '今年': { pinyin: 'jīn nián', definition: 'this year', example: '她今年五岁。' },
    '五': { pinyin: 'wǔ', definition: 'five', example: '五岁。' },
    '岁': { pinyin: 'suì', definition: 'years old', example: '五岁。' },
    '喜欢': { pinyin: 'xǐ huan', definition: 'to like', example: '她喜欢唱歌。' },
    '唱歌': { pinyin: 'chàng gē', definition: 'to sing', example: '喜欢唱歌。' },
    '和': { pinyin: 'hé', definition: 'and', example: '唱歌和跳舞。' },
    '跳舞': { pinyin: 'tiào wǔ', definition: 'to dance', example: '喜欢跳舞。' },
    '常常': { pinyin: 'cháng cháng', definition: 'often', example: '常常一起玩。' },
    '玩': { pinyin: 'wán', definition: 'to play', example: '一起玩。' },
    '不': { pinyin: 'bù', definition: 'not', example: '不大。' },
    '大': { pinyin: 'dà', definition: 'big, large', example: '不大。' },
    '温暖': { pinyin: 'wēn nuǎn', definition: 'warm', example: '很温暖。' },
    '每天': { pinyin: 'měi tiān', definition: 'every day', example: '每天晚上。' },
    '晚上': { pinyin: 'wǎn shang', definition: 'evening, night', example: '每天晚上。' },
    '吃': { pinyin: 'chī', definition: 'to eat', example: '吃晚饭。' },
    '晚饭': { pinyin: 'wǎn fàn', definition: 'dinner', example: '吃晚饭。' },
    '看': { pinyin: 'kàn', definition: 'to watch, to look', example: '看电视。' },
    '电视': { pinyin: 'diàn shì', definition: 'television', example: '看电视。' },
    '这': { pinyin: 'zhè', definition: 'this', example: '这就是我的家。' },
    '就是': { pinyin: 'jiù shì', definition: 'exactly, precisely', example: '这就是我的家。' }
};

// State
let currentBook = null;
let currentChapter = 0;
let addedWords = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBook();
    setupNavigation();
    loadAddedWords();
});

// Load book from URL parameter
function loadBook() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('book');

    if (!bookId || !bookContent[bookId]) {
        alert('Book not found!');
        window.location.href = 'books.html';
        return;
    }

    currentBook = bookContent[bookId];
    document.getElementById('bookTitle').textContent = currentBook.title;

    displayChapter(0);
}

// Display chapter
function displayChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= currentBook.chapters.length) return;

    currentChapter = chapterIndex;
    const chapter = currentBook.chapters[chapterIndex];

    document.getElementById('chapterTitle').textContent = chapter.title;
    document.getElementById('chapterIndicator').textContent = `Chapter ${chapterIndex + 1}`;

    // Render story text with clickable words
    const storyTextDiv = document.getElementById('storyText');
    storyTextDiv.innerHTML = '';

    chapter.content.forEach(paragraph => {
        const p = document.createElement('p');
        p.innerHTML = makeWordsClickable(paragraph);
        storyTextDiv.appendChild(p);
    });

    // Update navigation buttons
    document.getElementById('prevChapter').disabled = chapterIndex === 0;
    document.getElementById('nextChapter').disabled = chapterIndex === currentBook.chapters.length - 1;
}

// Make words clickable
function makeWordsClickable(text) {
    let result = '';
    let i = 0;

    while (i < text.length) {
        let matched = false;

        // Try to match longer phrases first (up to 4 characters)
        for (let len = 4; len >= 1; len--) {
            const word = text.substr(i, len);
            if (dictionary[word]) {
                result += `<span class="word" onclick="showDictionary('${word}')">${word}</span>`;
                i += len;
                matched = true;
                break;
            }
        }

        if (!matched) {
            result += text[i];
            i++;
        }
    }

    return result;
}

// Show dictionary
function showDictionary(word) {
    const entry = dictionary[word];
    if (!entry) return;

    document.getElementById('dictChinese').textContent = word;
    document.getElementById('dictPinyin').textContent = entry.pinyin;
    document.getElementById('dictDefinition').textContent = entry.definition;
    document.getElementById('dictExample').textContent = entry.example;

    // Update add button state
    const addBtn = document.getElementById('addToDeckBtn');
    if (addedWords.has(word)) {
        addBtn.classList.add('added');
        addBtn.innerHTML = '<span>✓</span>Added to Deck';
        addBtn.disabled = true;
    } else {
        addBtn.classList.remove('added');
        addBtn.innerHTML = '<span>+</span>Add to Review Deck';
        addBtn.disabled = false;
    }

    // Store current word
    addBtn.dataset.word = word;

    // Show popup
    document.getElementById('dictionaryPopup').classList.add('show');
    document.getElementById('dictOverlay').classList.add('show');
}

// Close dictionary
function closeDictionary() {
    document.getElementById('dictionaryPopup').classList.remove('show');
    document.getElementById('dictOverlay').classList.remove('show');
}

// Add word to deck
function addWordToDeck() {
    const addBtn = document.getElementById('addToDeckBtn');
    const word = addBtn.dataset.word;

    if (!word || addedWords.has(word)) return;

    const entry = dictionary[word];

    // Add to custom deck in localStorage
    let customDeck = JSON.parse(localStorage.getItem('customDeck') || '[]');
    customDeck.push({
        chinese: word,
        pinyin: entry.pinyin,
        definition: entry.definition,
        example: entry.example
    });
    localStorage.setItem('customDeck', JSON.stringify(customDeck));

    // Mark as added
    addedWords.add(word);
    saveAddedWords();

    // Update button
    addBtn.classList.add('added');
    addBtn.innerHTML = '<span>✓</span>Added to Deck';
    addBtn.disabled = true;
}

// Load added words
function loadAddedWords() {
    const saved = localStorage.getItem('addedWords');
    if (saved) {
        addedWords = new Set(JSON.parse(saved));
    }
}

// Save added words
function saveAddedWords() {
    localStorage.setItem('addedWords', JSON.stringify([...addedWords]));
}

// Setup navigation
function setupNavigation() {
    document.getElementById('prevChapter').addEventListener('click', () => {
        stopAudio();
        displayChapter(currentChapter - 1);
    });

    document.getElementById('nextChapter').addEventListener('click', () => {
        stopAudio();
        displayChapter(currentChapter + 1);
    });
}

// ========================================
// TEXT-TO-SPEECH (Azure Speech Services)
// ========================================

// Azure Configuration
// To enable TTS, get your Azure Speech API key from: https://portal.azure.com
// Create a Speech Service resource and copy your key and region
const AZURE_CONFIG = {
    subscriptionKey: '', // Add your Azure Speech API key here
    region: '', // Add your region here (e.g., 'eastus', 'westus', 'westeurope')
};

let isPlaying = false;
let currentAudio = null;
let currentSynthesizer = null;

// Toggle audio playback
function toggleAudio() {
    if (isPlaying) {
        stopAudio();
    } else {
        playChapterAudio();
    }
}

// Play chapter audio using Azure TTS
async function playChapterAudio() {
    // Check if Azure credentials are configured
    if (!AZURE_CONFIG.subscriptionKey || !AZURE_CONFIG.region) {
        document.getElementById('ttsNotice').style.display = 'block';
        return;
    }

    // Get chapter text
    const chapter = currentBook.chapters[currentChapter];
    const textToSpeak = chapter.content.join('');

    // Update UI
    const listenBtn = document.getElementById('listenBtn');
    const listenIcon = document.getElementById('listenIcon');
    const listenText = document.getElementById('listenText');

    listenBtn.classList.add('playing');
    listenIcon.textContent = '⏸️';
    listenText.textContent = 'Pause';
    isPlaying = true;

    try {
        // Use Azure Speech SDK or REST API
        await synthesizeSpeech(textToSpeak);
    } catch (error) {
        console.error('TTS Error:', error);
        stopAudio();
        alert('Error playing audio. Please check your Azure credentials.');
    }
}

// Synthesize speech using Azure Speech Services REST API
async function synthesizeSpeech(text) {
    const url = `https://${AZURE_CONFIG.region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    // Get access token
    const tokenResponse = await fetch(`https://${AZURE_CONFIG.region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': AZURE_CONFIG.subscriptionKey
        }
    });

    const token = await tokenResponse.text();

    // SSML for Chinese speech
    const ssml = `
        <speak version='1.0' xml:lang='zh-CN'>
            <voice xml:lang='zh-CN' name='zh-CN-XiaoxiaoNeural'>
                <prosody rate='0.9'>
                    ${text}
                </prosody>
            </voice>
        </speak>
    `;

    // Request speech synthesis
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
    });

    if (!response.ok) {
        throw new Error(`Azure TTS error: ${response.status}`);
    }

    // Get audio data and play
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);
    currentAudio.play();

    // Handle audio end
    currentAudio.addEventListener('ended', () => {
        stopAudio();
    });

    // Handle audio errors
    currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        stopAudio();
    });
}

// Stop audio playback
function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    const listenBtn = document.getElementById('listenBtn');
    const listenIcon = document.getElementById('listenIcon');
    const listenText = document.getElementById('listenText');

    listenBtn.classList.remove('playing');
    listenIcon.textContent = '🔊';
    listenText.textContent = 'Listen';
    isPlaying = false;
}

// Alternative: Use browser's built-in Web Speech API (fallback, but limited voice quality)
function playChapterAudioFallback() {
    if ('speechSynthesis' in window) {
        const chapter = currentBook.chapters[currentChapter];
        const textToSpeak = chapter.content.join('');

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;

        // Update UI
        const listenBtn = document.getElementById('listenBtn');
        listenBtn.classList.add('playing');
        document.getElementById('listenIcon').textContent = '⏸️';
        document.getElementById('listenText').textContent = 'Pause';
        isPlaying = true;

        utterance.onend = () => {
            stopAudio();
        };

        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in your browser.');
    }
}
