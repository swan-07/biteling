// Load completion data from URL parameters or localStorage
document.addEventListener('DOMContentLoaded', () => {
    // Get stats from localStorage
    const userData = JSON.parse(localStorage.getItem('bitelingData') || '{"streak":0,"cookies":0,"cardsReviewed":0,"dailyGoal":20,"level":1}');

    // Get session data
    const sessionData = JSON.parse(sessionStorage.getItem('reviewSession') || '{"cardsReviewed":0,"cookiesEarned":0}');

    // Update display
    document.getElementById('cardsReviewed').textContent = sessionData.cardsReviewed;
    document.getElementById('cookiesEarned').textContent = sessionData.cookiesEarned;
    document.getElementById('currentStreak').textContent = userData.streak;

    // Custom messages based on performance
    const messageElement = document.getElementById('progressMessage');

    if (userData.streak >= 7) {
        messageElement.textContent = `🔥 Amazing! You've maintained a ${userData.streak}-day streak! Keep the momentum going!`;
    } else if (userData.streak >= 3) {
        messageElement.textContent = `Great job! ${userData.streak} days in a row. You're building a strong habit!`;
    } else if (sessionData.cardsReviewed >= userData.dailyGoal) {
        messageElement.textContent = "Perfect! You've completed your daily goal. Come back tomorrow!";
    } else {
        messageElement.textContent = "Good progress! Keep reviewing to maintain your streak.";
    }

    // Clear session data
    sessionStorage.removeItem('reviewSession');
});
