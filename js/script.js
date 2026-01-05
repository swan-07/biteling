// BiteLing - Simple Homepage Script
import userDataManager from './user-data.js';
import notificationManager from './notifications.js';

let userData = {
    streak: 0,
    cookies: 100,
    cardsReviewed: 0,
    dailyGoal: 20,
    level: 1
};

// Load data
async function loadUserData() {
    // Initialize user data manager (syncs with Firebase if available)
    await userDataManager.init();

    // Get data from userDataManager (Firebase-first)
    const cookies = userDataManager.getCookies();
    const hskLevel = userDataManager.getHSKLevel();

    userData.cookies = cookies;
    userData.level = hskLevel;

    updateUI();
    updateUserAccountDisplay();
}

// Save data
async function saveUserData() {
    // Save to Firebase only (userDataManager handles localStorage as backup)
    await userDataManager.setCookies(userData.cookies);
    await userDataManager.setHSKLevel(userData.level);
}

// Get user profile icon (custom or default)
function getFoodEmojiForUser(email) {
    // Check if user has a custom icon selected from the shop
    const customIcon = localStorage.getItem('userProfileIcon');
    if (customIcon) {
        return customIcon;
    }

    // Default to cookie emoji for all new users
    return '🍪';
}

// Update user account display
function updateUserAccountDisplay() {
    const userIcon = document.querySelector('.user-icon');
    const isPremium = localStorage.getItem('isPremium') === 'true';

    if (userDataManager.isSignedIn()) {
        const user = userDataManager.getCurrentUser();
        const displayName = user.displayName || user.email;

        // Show crown for premium users, food emoji for free users
        if (isPremium) {
            userIcon.textContent = '👑';
            userIcon.title = displayName + ' (BiteLing+)';
        } else {
            const foodEmoji = getFoodEmojiForUser(user.email);
            userIcon.textContent = foodEmoji;
            userIcon.title = displayName;
        }

        userIcon.style.background = '';
        userIcon.style.fontSize = '1.5rem';

        // Store email in localStorage for instant icon on reload
        localStorage.setItem('lastUserEmail', user.email);
    } else {
        userIcon.textContent = '👤';
        userIcon.title = 'Sign in to save progress';
        userIcon.style.background = '';
        userIcon.style.fontSize = '';

        // Clear stored email
        localStorage.removeItem('lastUserEmail');
    }
}

// Set initial icon from localStorage (instant, no delay)
function setInitialIcon() {
    const userIcon = document.querySelector('.user-icon');
    const lastUserEmail = localStorage.getItem('lastUserEmail');
    const isPremium = localStorage.getItem('isPremium') === 'true';

    if (lastUserEmail) {
        // Show crown for premium users, food emoji for free users
        if (isPremium) {
            userIcon.textContent = '👑';
        } else {
            const foodEmoji = getFoodEmojiForUser(lastUserEmail);
            userIcon.textContent = foodEmoji;
        }
        userIcon.style.fontSize = '1.5rem';
    }
}

// Calculate cards due for review
function getCardsDueCount() {
    // Get card states from review.js storage
    const cardStates = JSON.parse(localStorage.getItem('cardStates') || '{}');
    const now = Date.now();

    // Count cards that are due for review
    const dueCards = Object.values(cardStates).filter(state => {
        return state.dueDate <= now;
    }).length;

    // If no due cards, check if there are any new cards
    if (dueCards === 0) {
        // Get HSK1 deck size (20 words) + custom deck
        const customDeck = JSON.parse(localStorage.getItem('customDeck') || '[]');
        const totalPossibleCards = 20 + customDeck.length;

        // Count cards that have been reviewed
        const reviewedCards = Object.keys(cardStates).length;

        // If there are unreviewed cards, return new cards available
        if (reviewedCards < totalPossibleCards) {
            return Math.min(20, totalPossibleCards - reviewedCards);
        }
    }

    return dueCards;
}

// Update display
function updateUI() {
    document.querySelector('.level').textContent = `Level ${userData.level}`;
    document.querySelector('.streak').textContent = `🔥 ${userData.streak}`;
    document.querySelector('.cookies').textContent = `🍪 ${userData.cookies}`;

    const cardStatsDiv = document.querySelector('.card-stats');
    const startCard = document.querySelector('.start-content');
    const startHeading = startCard.querySelector('h1');
    const startSubtext = startCard.querySelector('p');

    // Get actual cards due for review
    const cardsDue = getCardsDueCount();

    // Check if user completed review today
    const today = new Date().toDateString();
    const lastReviewDate = userData.lastReviewDate || '';
    const completedToday = (lastReviewDate === today) && (userData.cardsReviewed >= 20);

    // Check if there are no cards due
    if (cardsDue === 0 && completedToday) {
        // Change to completed state - turn green!
        startCard.classList.add('completed');
        startHeading.textContent = '✓ DONE';
        startSubtext.textContent = 'Come back tomorrow!';
        cardStatsDiv.innerHTML = `
            <div>${userData.cardsReviewed} cards reviewed</div>
            <div>Review complete! 🎉</div>
        `;
    } else if (cardsDue === 0) {
        // No cards to review at all - also turn green!
        startCard.classList.add('completed');
        startHeading.textContent = '✓ DONE';
        startSubtext.textContent = 'No cards due yet';
        cardStatsDiv.innerHTML = `
            <div>0 cards</div>
            <div>Add words from Books! 📚</div>
        `;
    } else {
        // Normal state - cards are due
        startCard.classList.remove('completed');
        startHeading.textContent = 'START';
        startSubtext.textContent = 'Daily Review';
        cardStatsDiv.innerHTML = `
            <div>${cardsDue} cards due</div>
            <div>Earn +${Math.min(cardsDue, 20)} 🍪</div>
        `;
    }

    // Update custom words badge
    updateCustomWordsBadge();
}

// Update custom words badge
function updateCustomWordsBadge() {
    const customDeck = JSON.parse(localStorage.getItem('customDeck') || '[]');
    const customWordsBadge = document.getElementById('customWordsBadge');
    const customWordsCount = document.getElementById('customWordsCount');

    if (customDeck.length > 0) {
        customWordsCount.textContent = customDeck.length;
        customWordsBadge.style.display = 'inline-flex';
    } else {
        customWordsBadge.style.display = 'none';
    }
}

// START card click
document.addEventListener('DOMContentLoaded', async () => {
    // Set icon immediately from localStorage (no delay)
    setInitialIcon();

    await loadUserData();

    // Initialize notification system for daily Bites reminders
    await notificationManager.init();

    const startCard = document.querySelector('.start-card');
    startCard.addEventListener('click', () => {
        // Only allow review if there are cards due
        const cardsDue = getCardsDueCount();
        if (cardsDue > 0) {
            window.location.href = 'pages/review.html';
        }
    });

    // Activity buttons
    const activityButtons = document.querySelectorAll('.activity-btn');
    const activities = ['Books', 'Watch', 'Camera', 'Talk', 'Roadmap'];
    const activityPages = {
        'Books': 'pages/books.html',
        'Watch': 'pages/watch.html',
        'Camera': 'pages/camera.html',
        'Talk': 'pages/talk.html',
        'Roadmap': 'pages/roadmap.html'
    };

    activityButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const activityName = activities[index];
            if (activityPages[activityName]) {
                window.location.href = activityPages[activityName];
            } else {
                alert(`${button.querySelector('.btn-icon').textContent} ${activityName}\n\nComing soon!`);
            }
        });
    });

    // User icon
    const userIcon = document.querySelector('.user-icon');
    const loginModal = document.getElementById('loginModal');
    const accountModal = document.getElementById('accountModal');

    userIcon.addEventListener('click', async () => {
        if (userDataManager.isSignedIn()) {
            const user = userDataManager.getCurrentUser();
            const isPremium = localStorage.getItem('isPremium') === 'true';

            // Show crown for premium users, custom/default icon for free users
            const displayIcon = isPremium ? '👑' : getFoodEmojiForUser(user.email);

            // Show account modal
            document.getElementById('accountEmoji').textContent = displayIcon;
            document.getElementById('accountEmail').textContent = user.email;
            accountModal.classList.remove('hidden');
        } else {
            // Show login modal
            loginModal.classList.remove('hidden');
        }
    });

    // Modal controls
    const closeModal = document.getElementById('closeModal');
    const closeAccountModal = document.getElementById('closeAccountModal');
    const accountBtn = document.getElementById('accountBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const showSignUpBtn = document.getElementById('showSignUp');
    const showSignInBtn = document.getElementById('showSignIn');
    const signInFormDiv = document.getElementById('signInForm');
    const signUpFormDiv = document.getElementById('signUpForm');
    const emailSignInForm = document.getElementById('emailSignInForm');
    const emailSignUpForm = document.getElementById('emailSignUpForm');
    const errorMessage = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Close login modal
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        hideError();
    });

    // Close account modal
    closeAccountModal.addEventListener('click', () => {
        accountModal.classList.add('hidden');
    });

    // Account button
    accountBtn.addEventListener('click', () => {
        accountModal.classList.add('hidden');
        window.location.href = 'pages/account.html';
    });

    // Sign out button
    signOutBtn.addEventListener('click', async () => {
        await userDataManager.signOut();
        accountModal.classList.add('hidden');
        updateUserAccountDisplay();
    });

    // Click outside to close login modal
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
            hideError();
        }
    });

    // Click outside to close account modal
    accountModal.addEventListener('click', (e) => {
        if (e.target === accountModal) {
            accountModal.classList.add('hidden');
        }
    });

    // Toggle between sign in and sign up
    showSignUpBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signInFormDiv.classList.add('hidden');
        signUpFormDiv.classList.remove('hidden');
        hideError();
    });

    showSignInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signUpFormDiv.classList.add('hidden');
        signInFormDiv.classList.remove('hidden');
        hideError();
    });

    // Email/Password Sign-In
    emailSignInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        hideError();

        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;

        const result = await userDataManager.signInWithEmail(email, password);

        hideLoading();

        if (result.success) {
            loginModal.classList.add('hidden');
            updateUserAccountDisplay();
            emailSignInForm.reset();
        } else {
            showError(result.error);
        }
    });

    // Email/Password Sign-Up
    emailSignUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        hideError();

        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const confirmPassword = document.getElementById('signUpPasswordConfirm').value;

        // Validate password match
        if (password !== confirmPassword) {
            hideLoading();
            showError('Passwords do not match');
            return;
        }

        const result = await userDataManager.signUpWithEmail(email, password);

        hideLoading();

        if (result.success) {
            loginModal.classList.add('hidden');
            updateUserAccountDisplay();
            emailSignUpForm.reset();
        } else {
            showError(result.error);
        }
    });

    // Helper functions for modal
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function showLoading() {
        loadingSpinner.classList.remove('hidden');
    }

    function hideLoading() {
        loadingSpinner.classList.add('hidden');
    }

    // Cheat code for dev mode: Click logo 5 times quickly to get 100 cookies
    let clickCount = 0;
    let clickTimer = null;
    const logo = document.querySelector('.logo');

    logo.addEventListener('click', () => {
        clickCount++;

        if (clickTimer) clearTimeout(clickTimer);

        if (clickCount === 5) {
            userData.cookies += 100;
            saveUserData();
            updateUI();

            // Show success message
            logo.textContent = '🍪 +100!';
            setTimeout(() => {
                logo.textContent = 'BiteLing';
            }, 1000);

            clickCount = 0;
        } else {
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
        }
    });

    // Purchase modal
    const cookiesBtn = document.getElementById('cookiesBtn');
    const purchaseModal = document.getElementById('purchaseModal');
    const closePurchaseModal = document.getElementById('closePurchaseModal');
    const purchaseBtns = document.querySelectorAll('.purchase-btn');

    cookiesBtn.addEventListener('click', () => {
        purchaseModal.classList.remove('hidden');
    });

    closePurchaseModal.addEventListener('click', () => {
        purchaseModal.classList.add('hidden');
    });

    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            purchaseModal.classList.add('hidden');
        }
    });

    purchaseBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.type;

            if (type === 'cookies') {
                // Purchase 500 cookies for $5
                alert('Cookie purchase coming soon! This will integrate with Stripe payment processing.');
                // TODO: Integrate Stripe for cookie purchase
                // await userDataManager.addCookies(500);
            } else if (type === 'plus') {
                // Purchase BiteLing+ for $20
                const confirmed = confirm('Upgrade to BiteLing+ for $20?\n\nYou will get:\n👑 Crown icon badge\n🍪 100 cookies daily\n\nPayment integration coming soon!');

                if (confirmed) {
                    // Set premium status
                    localStorage.setItem('isPremium', 'true');
                    purchaseModal.classList.add('hidden');

                    // Update icon to crown
                    updateUserAccountDisplay();

                    alert('Welcome to BiteLing+! 👑\n\nYour icon is now a crown!');
                }
            }
        });
    });
});

// Cookie earning (for later use)
async function earnCookies(amount) {
    userData.cookies += amount;
    await saveUserData();
    updateUI();
}

window.BiteLing = {
    earnCookies,
    userData,
    saveUserData,
    updateUI,
    updateUserAccountDisplay
};
