// ========================================
// AZURE CONFIGURATION
// ========================================

const AZURE_CONFIG = {
    // OpenAI for chat
    get openaiKey() { return window.ENV_CONFIG?.AZURE_OPENAI_KEY || ''; },
    get openaiEndpoint() { return window.ENV_CONFIG?.AZURE_OPENAI_ENDPOINT || ''; },
    get openaiDeployment() { return window.ENV_CONFIG?.AZURE_OPENAI_DEPLOYMENT || ''; },
    get openaiApiVersion() { return window.ENV_CONFIG?.AZURE_OPENAI_API_VERSION || '2024-02-01'; },

    // Speech for TTS
    get speechKey() { return window.ENV_CONFIG?.AZURE_SPEECH_KEY || ''; },
    get speechRegion() { return window.ENV_CONFIG?.AZURE_SPEECH_REGION || ''; }
};

// ========================================
// STATE MANAGEMENT
// ========================================

let currentMode = 'chat'; // 'chat', 'call', 'partner'
let conversationHistory = [];
let cookiesEarned = 0;
let messageCount = 0;
let isRecording = false;
let recognition = null;
let speechSynthesizer = null;
let currentAudio = null;
let autoPlayEnabled = true;
let userHSKLevel = 1; // Will be loaded from user data

// Call mode state
let callActive = false;
let callStartTime = null;
let callTimerInterval = null;

// Partner mode state
let isSearchingForMatch = false;
let matchListener = null;
let currentMatch = null;
let matchConversationListener = null;

// ========================================
// INITIALIZATION
// ========================================

// Import Firebase modules
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    onSnapshot,
    addDoc,
    orderBy,
    limit,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import firebaseService from './firebase-service.js';

let db = null;

document.addEventListener('DOMContentLoaded', async () => {
    loadUserHSKLevel();
    setupEventListeners();
    setupSpeechRecognition();
    initializeSpeechSynthesis();

    // Initialize Firebase for matchmaking
    firebaseService.init();
    db = firebaseService.db;

    // Add initial AI greeting to history
    conversationHistory.push({
        role: 'assistant',
        content: '你好！我是你的中文对话伙伴。'
    });
});

// Load user's HSK level from their progress
function loadUserHSKLevel() {
    try {
        const userData = JSON.parse(localStorage.getItem('bitelingData') || '{}');
        const cards = userData.cards || [];

        // Count mastered words (masteryLevel === 4)
        const masteredCount = cards.filter(card => card.masteryLevel === 4).length;

        // Determine HSK level based on mastered words
        if (masteredCount >= 2500) userHSKLevel = 5;
        else if (masteredCount >= 1200) userHSKLevel = 4;
        else if (masteredCount >= 600) userHSKLevel = 3;
        else if (masteredCount >= 300) userHSKLevel = 2;
        else userHSKLevel = 1;

        console.log(`User HSK Level: ${userHSKLevel} (${masteredCount} mastered words)`);
    } catch (error) {
        console.error('Error loading HSK level:', error);
        userHSKLevel = 1; // Default to beginner
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Chat mode controls
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const micButton = document.getElementById('micButton');
    const autoPlayToggle = document.getElementById('autoPlayAudio');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    micButton.addEventListener('click', toggleRecording);
    autoPlayToggle.addEventListener('change', (e) => {
        autoPlayEnabled = e.target.checked;
    });

    // Call mode controls
    const startCallButton = document.getElementById('startCallButton');
    const endCallButton = document.getElementById('endCallButton');

    startCallButton.addEventListener('click', startCall);
    endCallButton.addEventListener('click', endCall);

    // Partner mode controls
    const findMatchButton = document.getElementById('findMatchButton');
    const cancelMatchButton = document.getElementById('cancelMatchButton');

    if (findMatchButton) {
        findMatchButton.addEventListener('click', startMatchmaking);
    }
    if (cancelMatchButton) {
        cancelMatchButton.addEventListener('click', cancelMatchmaking);
    }
}

// ========================================
// MODE SWITCHING
// ========================================

function switchMode(mode) {
    currentMode = mode;

    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide containers
    const chatContainer = document.getElementById('chatContainer');
    const callScreen = document.getElementById('callScreen');
    const partnerContainer = document.getElementById('partnerMatchingContainer');

    if (mode === 'call') {
        chatContainer.classList.add('hidden');
        callScreen.classList.remove('hidden');
        if (partnerContainer) partnerContainer.classList.add('hidden');
    } else if (mode === 'partner') {
        chatContainer.classList.add('hidden');
        callScreen.classList.add('hidden');
        if (partnerContainer) {
            partnerContainer.classList.remove('hidden');
            // Update HSK level display
            document.getElementById('matchHSKLevel').textContent = userHSKLevel;
        }
    } else {
        chatContainer.classList.remove('hidden');
        callScreen.classList.add('hidden');
        if (partnerContainer) partnerContainer.classList.add('hidden');
    }
}

// ========================================
// SPEECH RECOGNITION (Voice Input)
// ========================================

function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;

            if (currentMode === 'call') {
                // In call mode, immediately send the message
                sendMessageText(transcript);
            } else {
                // In chat mode, populate the input
                document.getElementById('userInput').value = transcript;
            }

            stopRecording();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
        };

        recognition.onend = () => {
            if (callActive && currentMode === 'call') {
                // In call mode, restart recognition automatically
                setTimeout(() => {
                    if (callActive) startRecording();
                }, 500);
            } else {
                stopRecording();
            }
        };
    }
}

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    isRecording = true;
    const micButton = document.getElementById('micButton');
    micButton?.classList.add('recording');

    if (currentMode === 'call') {
        document.getElementById('callStatus').textContent = 'Listening...';
    }

    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting recognition:', error);
        stopRecording();
    }
}

function stopRecording() {
    if (!recognition) return;

    isRecording = false;
    const micButton = document.getElementById('micButton');
    micButton?.classList.remove('recording');

    if (currentMode === 'call' && callActive) {
        document.getElementById('callStatus').textContent = 'In call...';
    }

    try {
        recognition.stop();
    } catch (error) {
        console.error('Error stopping recognition:', error);
    }
}

// ========================================
// TEXT-TO-SPEECH (Voice Output)
// ========================================

function initializeSpeechSynthesis() {
    // Azure Speech SDK will be initialized when needed
}

async function playMessageAudio(button, text) {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        document.querySelectorAll('.play-audio-btn.playing').forEach(btn => {
            btn.classList.remove('playing');
        });
    }

    button.classList.add('playing');

    try {
        await speakText(text);
    } catch (error) {
        console.error('Error playing audio:', error);
    } finally {
        button.classList.remove('playing');
    }
}

// Make it globally accessible for onclick handlers
window.playMessageAudio = playMessageAudio;

async function speakText(text) {
    if (!AZURE_CONFIG.speechKey || !AZURE_CONFIG.speechRegion) {
        console.warn('Azure Speech not configured, using browser TTS');
        return speakWithBrowserTTS(text);
    }

    try {
        const response = await fetch(
            `https://${AZURE_CONFIG.speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
            {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': AZURE_CONFIG.speechKey,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
                },
                body: `<speak version='1.0' xml:lang='zh-CN'>
                    <voice xml:lang='zh-CN' name='zh-CN-XiaoxiaoNeural'>
                        ${text}
                    </voice>
                </speak>`
            }
        );

        if (!response.ok) {
            throw new Error(`TTS failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        return new Promise((resolve, reject) => {
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                resolve();
            };
            currentAudio.onerror = reject;
            currentAudio.play().catch(reject);
        });
    } catch (error) {
        console.error('Azure TTS error:', error);
        return speakWithBrowserTTS(text);
    }
}

function speakWithBrowserTTS(text) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Browser TTS not supported'));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;

        utterance.onend = resolve;
        utterance.onerror = reject;

        speechSynthesis.cancel(); // Cancel any ongoing speech
        speechSynthesis.speak(utterance);
    });
}

// ========================================
// MESSAGE HANDLING
// ========================================

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

    if (!message) return;

    userInput.value = '';
    await sendMessageText(message);
}

async function sendMessageText(message) {
    // If matched with a partner, send to partner instead of AI
    if (currentMatch) {
        await sendPartnerMessage(message);
        return;
    }

    // Add user message to chat
    addUserMessage(message);

    // Show typing indicator
    showTypingIndicator();

    // Get AI response
    try {
        const aiResponse = await getAIResponse(message);
        removeTypingIndicator();
        await addAIMessage(aiResponse);

        // Award cookies for conversation
        messageCount++;
        if (messageCount % 5 === 0) {
            cookiesEarned += 5;
            updateCookiesDisplay();
            saveProgress();
        }
    } catch (error) {
        console.error('Error getting AI response:', error);
        removeTypingIndicator();

        // Check if Azure is configured
        if (!AZURE_CONFIG.openaiKey || !AZURE_CONFIG.openaiEndpoint) {
            document.getElementById('azureNotice').style.display = 'block';

            // Fallback response
            const fallbackResponse = {
                chinese: '对不起，我现在不能回答。',
                pinyin: 'duì bu qǐ, wǒ xiàn zài bù néng huí dá.',
                english: 'Sorry, I cannot respond right now.'
            };
            await addAIMessage(fallbackResponse);
        } else {
            alert('Error communicating with AI. Please check your Azure credentials.');
        }
    }
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';

    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-chinese">${escapeHtml(text)}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: text
    });

    // For call mode, add to transcript
    if (currentMode === 'call') {
        addToCallTranscript(text, 'user');
    }
}

async function addAIMessage(response) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    const audioButtonHtml = `
        <button class="play-audio-btn" onclick="playMessageAudio(this, '${escapeHtml(response.chinese).replace(/'/g, "\\'")}')">
            <span class="audio-icon">🔊</span>
        </button>
    `;

    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${audioButtonHtml}
            <div class="message-chinese">${escapeHtml(response.chinese)}</div>
            ${response.pinyin ? `<div class="message-pinyin">${escapeHtml(response.pinyin)}</div>` : ''}
            ${response.english ? `<div class="message-english">${escapeHtml(response.english)}</div>` : ''}
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();

    // Add to conversation history
    conversationHistory.push({
        role: 'assistant',
        content: response.chinese
    });

    // For call mode, add to transcript
    if (currentMode === 'call') {
        addToCallTranscript(response.chinese, 'ai');
    }

    // Auto-play audio if enabled or in call mode
    if (autoPlayEnabled || currentMode === 'call') {
        // Stop speech recognition while AI is speaking to prevent echo
        const wasRecording = isRecording;
        if (currentMode === 'call' && wasRecording) {
            stopRecording();
        }

        try {
            await speakText(response.chinese);
        } catch (error) {
            console.error('Auto-play failed:', error);
        }

        // Restart speech recognition after AI finishes speaking
        if (currentMode === 'call' && callActive && wasRecording) {
            setTimeout(() => {
                if (callActive) startRecording();
            }, 500);
        }
    }
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message';
    typingDiv.id = 'typingIndicator';

    typingDiv.innerHTML = `
        <div class="message-bubble">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========================================
// AI INTEGRATION (Azure OpenAI)
// ========================================

async function getAIResponse(userMessage) {
    // Check if Azure is configured
    if (!AZURE_CONFIG.openaiKey || !AZURE_CONFIG.openaiEndpoint || !AZURE_CONFIG.openaiDeployment) {
        console.error('Azure OpenAI not configured:', {
            hasKey: !!AZURE_CONFIG.openaiKey,
            hasEndpoint: !!AZURE_CONFIG.openaiEndpoint,
            hasDeployment: !!AZURE_CONFIG.openaiDeployment
        });
        throw new Error('Azure OpenAI not configured');
    }

    const url = `${AZURE_CONFIG.openaiEndpoint}/openai/deployments/${AZURE_CONFIG.openaiDeployment}/chat/completions?api-version=${AZURE_CONFIG.openaiApiVersion}`;

    // Adjust difficulty based on user's HSK level
    const levelGuidance = {
        1: 'HSK 1 (beginner): Use only very simple vocabulary and basic sentence structures. Stick to present tense. Use common everyday words like 你好, 谢谢, 吃, 喝, 好.',
        2: 'HSK 2 (elementary): Use simple vocabulary and basic grammar. Include some time expressions and simple conjunctions like 和, 但是. Keep sentences short.',
        3: 'HSK 3 (intermediate): Use more varied vocabulary and moderately complex sentences. You can use common idioms and everyday expressions.',
        4: 'HSK 4 (upper intermediate): Use sophisticated vocabulary and complex sentence structures. Include idiomatic expressions and varied grammar patterns.',
        5: 'HSK 5 (advanced): Use advanced vocabulary, idioms, and complex grammatical structures. Discuss abstract topics naturally.'
    };

    const systemPrompt = `You are a friendly Chinese language conversation partner helping someone learn Chinese.

User's proficiency: ${levelGuidance[userHSKLevel]}

Guidelines:
- PERSONA: you are 小饼, the user's friendly younger-sister like friend
- Always respond in Chinese (Simplified characters) ONLY
- Adjust your vocabulary and grammar complexity to match the user's HSK ${userHSKLevel} level
- Keep responses conversational and natural for their level
- Be encouraging and supportive
- Keep responses brief (1-3 sentences)
- If the user makes mistakes, gently correct them by using the correct form in your response
- Use topics and vocabulary appropriate for HSK ${userHSKLevel}`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_CONFIG.openaiKey
            },
            body: JSON.stringify({
                messages: messages,
                max_completion_tokens: 150
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Azure OpenAI API error:', response.status, errorText);
            throw new Error(`Azure OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponseText = data.choices[0].message.content;

        // Parse response (assume AI returns just Chinese text)
        return {
            chinese: aiResponseText,
            pinyin: '', // Could use a pinyin library or ask AI to include pinyin
            english: '' // Could use translation API or ask AI to include translation
        };
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ========================================
// CALL MODE
// ========================================

function startCall() {
    callActive = true;
    callStartTime = Date.now();

    // Update UI
    document.getElementById('startCallButton').classList.add('hidden');
    document.getElementById('endCallButton').classList.remove('hidden');
    document.getElementById('callStatus').textContent = 'Connecting...';

    // Start timer
    updateCallTimer();
    callTimerInterval = setInterval(updateCallTimer, 1000);

    // Start listening
    setTimeout(() => {
        document.getElementById('callStatus').textContent = 'In call...';
        startRecording();
    }, 1000);
}

function endCall() {
    callActive = false;

    // Stop recording
    stopRecording();

    // Stop timer
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }

    // Update UI
    document.getElementById('startCallButton').classList.remove('hidden');
    document.getElementById('endCallButton').classList.add('hidden');
    document.getElementById('callStatus').textContent = 'Call ended';

    // Reset after delay
    setTimeout(() => {
        document.getElementById('callStatus').textContent = 'Ready to call Cookie';
        document.getElementById('callTimer').textContent = '00:00';
        document.getElementById('callTranscript').innerHTML = '';
    }, 2000);
}

function updateCallTimer() {
    if (!callActive || !callStartTime) return;

    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');

    document.getElementById('callTimer').textContent = `${minutes}:${seconds}`;
}

function addToCallTranscript(text, speaker) {
    const transcript = document.getElementById('callTranscript');

    const line = document.createElement('div');
    line.className = `transcript-line ${speaker}`;
    line.textContent = text;

    transcript.appendChild(line);
    transcript.scrollTop = transcript.scrollHeight;
}

// ========================================
// PROGRESS TRACKING
// ========================================

function updateCookiesDisplay() {
    document.getElementById('cookiesEarned').textContent = cookiesEarned;
}

function saveProgress() {
    // Update user data
    const userData = JSON.parse(localStorage.getItem('bitelingData') || '{"cookies":0}');
    userData.cookies += 5;
    localStorage.setItem('bitelingData', JSON.stringify(userData));
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// PARTNER MATCHING SYSTEM
// ========================================

async function startMatchmaking() {
    // Check if Firebase is initialized
    if (!db || !firebaseService.isSignedIn()) {
        alert('Please sign in to match with other users.');
        return;
    }

    // Get match preferences
    const wantsText = document.getElementById('matchText')?.checked || false;
    const wantsVoice = document.getElementById('matchVoice')?.checked || false;

    if (!wantsText && !wantsVoice) {
        alert('Please select at least one conversation type (Text Chat or Voice Call).');
        return;
    }

    isSearchingForMatch = true;

    // Show searching status
    document.getElementById('findMatchButton').classList.add('hidden');
    document.getElementById('matchingStatus').classList.remove('hidden');
    document.getElementById('matchingIcon').textContent = '🔍';
    document.getElementById('matchingTitle').textContent = 'Searching for Partner...';

    try {
        const currentUser = firebaseService.getCurrentUser();

        // Create matchmaking entry
        const matchData = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            displayName: currentUser.displayName || 'User',
            hskLevel: userHSKLevel,
            wantsText: wantsText,
            wantsVoice: wantsVoice,
            timestamp: serverTimestamp(),
            matched: false
        };

        // Add to matchmaking queue
        const matchQueueRef = collection(db, 'matchmaking');
        const matchDocRef = await addDoc(matchQueueRef, matchData);

        console.log('Added to matchmaking queue:', matchDocRef.id);

        // Look for existing matches
        await findExistingMatch(matchDocRef.id, matchData);

        // Listen for incoming matches
        startMatchListener(matchDocRef.id);

        // Set timeout for "no match found"
        setTimeout(() => {
            if (isSearchingForMatch && !currentMatch) {
                showNoMatchFound();
            }
        }, 30000); // 30 seconds timeout

    } catch (error) {
        console.error('Error starting matchmaking:', error);
        alert('Failed to start matchmaking. Please try again.');
        resetMatchmakingUI();
    }
}

async function findExistingMatch(myMatchId, myMatchData) {
    try {
        // Query for waiting users at same HSK level
        const matchQueueRef = collection(db, 'matchmaking');
        const q = query(
            matchQueueRef,
            where('hskLevel', '==', userHSKLevel),
            where('matched', '==', false)
        );

        const querySnapshot = await getDocs(q);

        for (const docSnapshot of querySnapshot.docs) {
            const otherMatch = docSnapshot.data();
            const otherMatchId = docSnapshot.id;

            // Skip own match entry
            if (otherMatchId === myMatchId) continue;

            // Skip if user is matching with themselves
            if (otherMatch.userId === myMatchData.userId) continue;

            // Check if preferences are compatible
            const hasCompatiblePreference =
                (myMatchData.wantsText && otherMatch.wantsText) ||
                (myMatchData.wantsVoice && otherMatch.wantsVoice);

            if (hasCompatiblePreference) {
                // Found a match!
                await createMatch(myMatchId, otherMatchId, myMatchData, otherMatch);
                return true;
            }
        }

        return false; // No match found
    } catch (error) {
        console.error('Error finding match:', error);
        return false;
    }
}

async function createMatch(myMatchId, otherMatchId, myMatchData, otherMatchData) {
    try {
        // Determine conversation type
        const conversationType = (myMatchData.wantsText && otherMatchData.wantsText) ? 'text' : 'voice';

        // Create conversation room
        const conversationRef = collection(db, 'conversations');
        const conversationDoc = await addDoc(conversationRef, {
            users: [myMatchData.userId, otherMatchData.userId],
            userEmails: [myMatchData.userEmail, otherMatchData.userEmail],
            displayNames: [myMatchData.displayName, otherMatchData.displayName],
            hskLevel: userHSKLevel,
            type: conversationType,
            createdAt: serverTimestamp(),
            active: true
        });

        // Mark both matchmaking entries as matched
        await setDoc(doc(db, 'matchmaking', myMatchId), { matched: true }, { merge: true });
        await setDoc(doc(db, 'matchmaking', otherMatchId), { matched: true }, { merge: true });

        // Store match info
        currentMatch = {
            conversationId: conversationDoc.id,
            partnerId: otherMatchData.userId,
            partnerEmail: otherMatchData.userEmail,
            partnerName: otherMatchData.displayName,
            type: conversationType
        };

        // Show match found
        showMatchFound(otherMatchData.displayName, conversationType);

        // Start conversation listener
        startConversationListener(conversationDoc.id);

    } catch (error) {
        console.error('Error creating match:', error);
        alert('Failed to create match. Please try again.');
        resetMatchmakingUI();
    }
}

function startMatchListener(myMatchId) {
    // Listen for updates to our matchmaking entry
    const matchDocRef = doc(db, 'matchmaking', myMatchId);

    matchListener = onSnapshot(matchDocRef, async (docSnapshot) => {
        const data = docSnapshot.data();

        if (data && data.matched && !currentMatch) {
            // We got matched by someone else!
            // Find the conversation we're part of
            const conversationsRef = collection(db, 'conversations');
            const q = query(
                conversationsRef,
                where('users', 'array-contains', firebaseService.getCurrentUser().uid),
                where('active', '==', true)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const conversationDoc = querySnapshot.docs[0];
                const conversationData = conversationDoc.data();

                // Find partner info
                const currentUserId = firebaseService.getCurrentUser().uid;
                const partnerIndex = conversationData.users.findIndex(id => id !== currentUserId);

                if (partnerIndex !== -1) {
                    currentMatch = {
                        conversationId: conversationDoc.id,
                        partnerId: conversationData.users[partnerIndex],
                        partnerEmail: conversationData.userEmails[partnerIndex],
                        partnerName: conversationData.displayNames[partnerIndex],
                        type: conversationData.type
                    };

                    showMatchFound(currentMatch.partnerName, currentMatch.type);
                    startConversationListener(conversationDoc.id);
                }
            }
        }
    });
}

function startConversationListener(conversationId) {
    // Listen for new messages in the conversation
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    matchConversationListener = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                const currentUserId = firebaseService.getCurrentUser().uid;

                // Only display messages from partner
                if (messageData.userId !== currentUserId) {
                    displayPartnerMessage(messageData.text);
                }
            }
        });
    });
}

async function sendPartnerMessage(text) {
    if (!currentMatch) return;

    try {
        const messagesRef = collection(db, `conversations/${currentMatch.conversationId}/messages`);
        await addDoc(messagesRef, {
            userId: firebaseService.getCurrentUser().uid,
            text: text,
            timestamp: serverTimestamp()
        });

        // Display own message
        addUserMessage(text);
    } catch (error) {
        console.error('Error sending partner message:', error);
        alert('Failed to send message. Please check your connection.');
    }
}

function displayPartnerMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';

    messageDiv.innerHTML = `
        <div class="message-bubble">
            <div class="message-chinese">${escapeHtml(text)}</div>
            <div class="message-english" style="font-size: 0.85em; opacity: 0.7;">From ${escapeHtml(currentMatch.partnerName)}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showMatchFound(partnerName, conversationType) {
    isSearchingForMatch = false;

    document.getElementById('matchingIcon').textContent = '✅';
    document.getElementById('matchingTitle').textContent = 'Match Found!';
    document.getElementById('matchingMessage').textContent = `Connected with ${partnerName} for ${conversationType} conversation.`;
    document.getElementById('matchingStatus').classList.add('hidden');

    // Switch to chat mode to start conversation
    setTimeout(() => {
        switchMode('chat');
        alert(`You're now connected with ${partnerName}! Start chatting in Chinese.`);
    }, 2000);
}

function showNoMatchFound() {
    isSearchingForMatch = false;

    document.getElementById('matchingIcon').textContent = '😔';
    document.getElementById('matchingTitle').textContent = 'No Match Found';
    document.getElementById('matchingMessage').textContent = 'No users at your level are currently available. Please try again later!';
    document.getElementById('matchingStatus').classList.add('hidden');

    setTimeout(() => {
        resetMatchmakingUI();
    }, 3000);
}

async function cancelMatchmaking() {
    isSearchingForMatch = false;

    // Stop listener
    if (matchListener) {
        matchListener();
        matchListener = null;
    }

    // Remove from matchmaking queue
    try {
        const currentUser = firebaseService.getCurrentUser();
        const matchQueueRef = collection(db, 'matchmaking');
        const q = query(
            matchQueueRef,
            where('userId', '==', currentUser.uid),
            where('matched', '==', false)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, 'matchmaking', docSnapshot.id));
        });
    } catch (error) {
        console.error('Error canceling matchmaking:', error);
    }

    resetMatchmakingUI();
}

function resetMatchmakingUI() {
    document.getElementById('findMatchButton').classList.remove('hidden');
    document.getElementById('matchingStatus').classList.add('hidden');
    document.getElementById('matchingIcon').textContent = '🔍';
    document.getElementById('matchingTitle').textContent = 'Find a Conversation Partner';
    document.getElementById('matchingMessage').textContent = 'Match with another user at your level for real conversation practice!';
}
