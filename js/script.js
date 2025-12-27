// BiteLing - Simple Homepage Script

let userData = {
    streak: 0,
    cookies: 0,
    cardsReviewed: 0,
    dailyGoal: 20,
    level: 1
};

// Load data
function loadUserData() {
    const saved = localStorage.getItem('bitelingData');
    if (saved) {
        userData = JSON.parse(saved);
        updateUI();
    }
}

// Save data
function saveUserData() {
    localStorage.setItem('bitelingData', JSON.stringify(userData));
}

// Calculate cards due for review
function getCardsDueCount() {
    const cards = userData.cards || [];
    const now = Date.now();

    return cards.filter(card => {
        // Cards with no nextReview are new cards, always due
        if (!card.nextReview) return true;
        // Cards are due if nextReview time has passed
        return card.nextReview <= now;
    }).length;
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
    const cardsReviewedToday = userData.cardsReviewedToday || 0;

    // Check if there are no cards due
    if (cardsDue === 0 && cardsReviewedToday > 0) {
        // Change to completed state - turn green!
        startCard.classList.add('completed');
        startHeading.textContent = '✓ DONE';
        startSubtext.textContent = 'Come back tomorrow!';
        cardStatsDiv.innerHTML = `
            <div>${cardsReviewedToday} cards reviewed</div>
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
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();

    const startCard = document.querySelector('.start-card');
    startCard.addEventListener('click', () => {
        // Only allow review if not already completed today
        if (!userData.dailyReviewComplete) {
            window.location.href = 'pages/review.html';
        }
    });

    // Activity buttons
    const activityButtons = document.querySelectorAll('.activity-btn');
    const activities = ['Books', 'Watch', 'Talk', 'Roadmap'];
    const activityPages = {
        'Books': 'pages/books.html',
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
    userIcon.addEventListener('click', () => {
        alert('👤 Account\n\nProfile settings and preferences coming soon!');
    });
});

// Cookie earning (for later use)
function earnCookies(amount) {
    userData.cookies += amount;
    saveUserData();
    updateUI();
}

window.BiteLing = {
    earnCookies,
    userData,
    saveUserData,
    updateUI
};
