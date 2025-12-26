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

// Update display
function updateUI() {
    document.querySelector('.level').textContent = `Level ${userData.level}`;
    document.querySelector('.streak').textContent = `🔥 ${userData.streak}`;
    document.querySelector('.cookies').textContent = `🍪 ${userData.cookies}`;

    const cardStatsDiv = document.querySelector('.card-stats');
    const startCard = document.querySelector('.start-content');
    const startHeading = startCard.querySelector('h1');
    const startSubtext = startCard.querySelector('p');

    // Check if daily review is complete
    if (userData.dailyReviewComplete) {
        // Change to completed state
        startCard.classList.add('completed');
        startHeading.textContent = '✓ DONE';
        startSubtext.textContent = 'Come back tomorrow!';
        cardStatsDiv.innerHTML = `
            <div>${userData.cardsReviewed}/${userData.dailyGoal} cards</div>
            <div>Review complete! 🎉</div>
        `;
    } else {
        // Normal state
        startCard.classList.remove('completed');
        startHeading.textContent = 'START';
        startSubtext.textContent = 'Daily Review';
        cardStatsDiv.innerHTML = `
            <div>${userData.cardsReviewed}/${userData.dailyGoal} cards</div>
            <div>Earn +5 🍪</div>
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
