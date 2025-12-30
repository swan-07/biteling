// Account Page Script
import userDataManager from './user-data.js';
import notificationManager from './notifications.js';

// Generate consistent food emoji (same as in script.js)
function getFoodEmojiForUser(email) {
    const foodEmojis = [
        '🍕', '🍔', '🍟', '🌭', '🍿', '🧀', '🥓', '🥚', '🍳',
        '🥐', '🥯', '🍞', '🥖', '🥨', '🧇', '🥞', '🧈', '🍖',
        '🍗', '🥩', '🍤', '🍣', '🍱', '🥟', '🍜', '🍲', '🍛',
        '🍝', '🥘', '🥗', '🥙', '🌮', '🌯', '🫔', '🥪', '🍕',
        '🍰', '🎂', '🧁', '🍮', '🍩', '🍪', '🍫', '🍬', '🍭',
        '🍡', '🍧', '🍨', '🍦', '🥧', '🧋', '🍵', '☕', '🥤',
        '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑',
        '🥝', '🍍', '🥭', '🥥', '🍅', '🥑', '🫒', '🥕', '🌽'
    ];

    let hash = 0;
    for (let i = 0; i < email.length; i++) {
        hash = ((hash << 5) - hash) + email.charCodeAt(i);
        hash = hash & hash;
    }

    const index = Math.abs(hash) % foodEmojis.length;
    return foodEmojis[index];
}

// Calculate words learned (cards that have been reviewed)
function getWordsLearned() {
    const cardStates = JSON.parse(localStorage.getItem('cardStates') || '{}');
    return Object.keys(cardStates).length;
}

// Set initial icon immediately from localStorage (no delay)
function setInitialAccountIcon() {
    const lastUserEmail = localStorage.getItem('lastUserEmail');

    if (lastUserEmail) {
        const foodEmoji = getFoodEmojiForUser(lastUserEmail);
        document.getElementById('userIconLarge').textContent = foodEmoji;
        document.getElementById('userEmail').textContent = lastUserEmail;
    }
}

// Load user data
async function loadAccountData() {
    await userDataManager.init();

    // Wait for Firebase auth to restore session with retry logic
    let retries = 0;
    const maxRetries = 20; // 20 * 100ms = 2 seconds max wait

    while (!userDataManager.isSignedIn() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    if (!userDataManager.isSignedIn()) {
        // Still not signed in after waiting, redirect to home
        window.location.href = '../index.html';
        return;
    }

    const user = userDataManager.getCurrentUser();
    const foodEmoji = getFoodEmojiForUser(user.email);
    const cookies = userDataManager.getCookies();
    const hskLevel = userDataManager.getHSKLevel();
    const wordsLearned = getWordsLearned();

    // Get streak from localStorage
    const bitelingData = JSON.parse(localStorage.getItem('bitelingData') || '{}');
    const streak = bitelingData.streak || 0;

    // Update UI
    document.getElementById('userIconLarge').textContent = foodEmoji;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userLevel').textContent = hskLevel;
    document.getElementById('userStreak').textContent = `🔥 ${streak}`;
    document.getElementById('wordsLearned').textContent = wordsLearned;
    document.getElementById('userCookies').textContent = `🍪 ${cookies}`;

    // Load reminder time from localStorage
    loadReminderTime();
}

// Load reminder time
function loadReminderTime() {
    const reminderTime = JSON.parse(localStorage.getItem('reminderTime') || '{"hour":"8","minute":"00","period":"PM"}');

    document.getElementById('reminderHour').value = reminderTime.hour;
    document.getElementById('reminderMinute').value = reminderTime.minute;
    document.getElementById('reminderPeriod').value = reminderTime.period;
}

// Save reminder time
async function saveReminderTime() {
    const reminderTime = {
        hour: document.getElementById('reminderHour').value,
        minute: document.getElementById('reminderMinute').value,
        period: document.getElementById('reminderPeriod').value
    };

    localStorage.setItem('reminderTime', JSON.stringify(reminderTime));
    console.log('Reminder time saved:', reminderTime);

    // Request notification permission if not already granted
    await notificationManager.requestPermission();

    // Restart daily check with new time
    notificationManager.startDailyCheck();
}

// Load friends list
async function loadFriends() {
    const friends = await userDataManager.getFriends();
    const friendsList = document.getElementById('friendsList');
    const noFriends = document.getElementById('noFriends');

    if (!friends || friends.length === 0) {
        noFriends.style.display = 'block';
        return;
    }

    noFriends.style.display = 'none';

    // Clear existing friends (except the no-friends message)
    const existingCards = friendsList.querySelectorAll('.friend-card');
    existingCards.forEach(card => card.remove());

    // Get cookie sending data for today
    const today = new Date().toDateString();
    const cookiesSentToday = JSON.parse(localStorage.getItem('cookiesSentToday') || '{}');

    // Reset if it's a new day
    if (cookiesSentToday.date !== today) {
        localStorage.setItem('cookiesSentToday', JSON.stringify({ date: today, sent: {} }));
    }

    // Add friend cards
    for (const friend of friends) {
        const friendCard = document.createElement('div');
        friendCard.className = 'friend-card';

        const foodEmoji = getFoodEmojiForUser(friend.email);
        const isOnline = friend.isOnline || false;
        const sentToday = cookiesSentToday.sent?.[friend.email] || 0;
        const canSend = sentToday < 10;

        friendCard.innerHTML = `
            <div class="friend-info">
                <div class="friend-icon-wrapper">
                    <div class="friend-icon">${foodEmoji}</div>
                    <div class="online-status ${isOnline ? 'online' : 'offline'}"></div>
                </div>
                <div class="friend-email">${friend.email}</div>
            </div>
            <button class="send-cookies-btn" data-friend-email="${friend.email}" ${!canSend ? 'disabled' : ''}>
                ${canSend ? 'Send 🍪' : 'Sent (10/10)'}
            </button>
        `;

        friendsList.appendChild(friendCard);
    }

    // Add event listeners to send cookie buttons
    const sendButtons = friendsList.querySelectorAll('.send-cookies-btn');
    sendButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const friendEmail = e.target.dataset.friendEmail;
            await sendCookiesToFriend(friendEmail);
        });
    });
}

// Send cookies to a friend
async function sendCookiesToFriend(friendEmail) {
    const today = new Date().toDateString();
    const cookiesSentToday = JSON.parse(localStorage.getItem('cookiesSentToday') || '{}');

    // Initialize if needed
    if (cookiesSentToday.date !== today) {
        cookiesSentToday.date = today;
        cookiesSentToday.sent = {};
    }

    // Check daily limit
    const sentToday = cookiesSentToday.sent[friendEmail] || 0;
    if (sentToday >= 10) {
        return;
    }

    // Send 1 cookie
    const success = await userDataManager.sendCookiesToFriend(friendEmail, 1);

    if (success) {
        // Update local tracking
        cookiesSentToday.sent[friendEmail] = sentToday + 1;
        localStorage.setItem('cookiesSentToday', JSON.stringify(cookiesSentToday));

        // Reload friends to update button state
        await loadFriends();
    }
}

// Add friend
async function addFriend(email) {
    const currentUser = userDataManager.getCurrentUser();

    // Validate
    if (email === currentUser.email) {
        return { success: false, error: "You can't add yourself as a friend" };
    }

    const result = await userDataManager.addFriend(email);
    return result;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Set icon immediately from localStorage (no delay)
    setInitialAccountIcon();

    await loadAccountData();
    await loadFriends();

    // Initialize notification system
    await notificationManager.init();

    // Sign out button
    document.getElementById('signOutBtn').addEventListener('click', async () => {
        await userDataManager.signOut();
        window.location.href = '../index.html';
    });

    // Save reminder time when changed
    document.getElementById('reminderHour').addEventListener('change', saveReminderTime);
    document.getElementById('reminderMinute').addEventListener('change', saveReminderTime);
    document.getElementById('reminderPeriod').addEventListener('change', saveReminderTime);

    // Test notification button
    const testNotificationBtn = document.getElementById('testNotificationBtn');
    console.log('Test notification button found:', testNotificationBtn);

    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', async () => {
            console.log('Button clicked!');
            try {
                await notificationManager.testNotification();
            } catch (error) {
                console.error('Error in test notification:', error);
                alert('Error: ' + error.message);
            }
        });
    } else {
        console.error('Test notification button not found!');
    }

    // Add friend modal
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFriendModal = document.getElementById('addFriendModal');
    const closeAddFriendModal = document.getElementById('closeAddFriendModal');
    const addFriendForm = document.getElementById('addFriendForm');
    const addFriendError = document.getElementById('addFriendError');

    addFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
        addFriendError.classList.add('hidden');
    });

    closeAddFriendModal.addEventListener('click', () => {
        addFriendModal.classList.add('hidden');
        addFriendForm.reset();
        addFriendError.classList.add('hidden');
    });

    addFriendModal.addEventListener('click', (e) => {
        if (e.target === addFriendModal) {
            addFriendModal.classList.add('hidden');
            addFriendForm.reset();
            addFriendError.classList.add('hidden');
        }
    });

    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        addFriendError.classList.add('hidden');

        const email = document.getElementById('friendEmail').value.trim();
        const result = await addFriend(email);

        if (result.success) {
            // Close modal and reload friends
            addFriendModal.classList.add('hidden');
            addFriendForm.reset();
            await loadFriends();

            // Show success message
            if (result.invited) {
                // Show invitation sent message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-toast';
                successMsg.textContent = `Invitation email sent to ${email}!`;
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 3000);
            } else {
                // Show friend added message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-toast';
                successMsg.textContent = `${email} added as friend!`;
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 3000);
            }
        } else {
            addFriendError.textContent = result.error || 'Failed to add friend';
            addFriendError.classList.remove('hidden');
        }
    });
});
