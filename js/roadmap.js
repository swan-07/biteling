// Load user data and update roadmap
document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('bitelingData') || '{"streak":0,"cookies":0,"cardsReviewed":0,"dailyGoal":20,"level":1,"wordsLearned":0}');

    // Update user level display
    document.getElementById('userLevel').textContent = `Level ${userData.level}`;

    // HSK vocabulary counts (cumulative)
    const hskVocab = {
        1: 150,
        2: 300,
        3: 600,
        4: 1200,
        5: 2500,
        6: 5000
    };

    // Load card states to count mastered words
    const cardStates = JSON.parse(localStorage.getItem('cardStates') || '{}');
    const MASTERY_THRESHOLD = 4;

    // Count only truly mastered words (mastery level 4)
    const masteredWords = Object.values(cardStates).filter(state =>
        state.masteryLevel === MASTERY_THRESHOLD
    ).length;

    const totalWordsLearned = masteredWords;

    // Update all level nodes
    for (let level = 1; level <= 6; level++) {
        const node = document.querySelector(`.level-node[data-level="${level}"]`);
        if (!node) continue;

        const progressBar = node.querySelector('.progress-fill');
        const progressText = node.querySelector('.progress-text');

        // Calculate progress for this level
        const prevVocab = level > 1 ? hskVocab[level - 1] : 0;
        const currentLevelVocab = hskVocab[level] - prevVocab;
        const wordsInThisLevel = Math.max(0, Math.min(currentLevelVocab, totalWordsLearned - prevVocab));
        const progress = (wordsInThisLevel / currentLevelVocab) * 100;

        // Level is only completed if ALL words in it are mastered
        const isLevelFullyMastered = totalWordsLearned >= hskVocab[level];
        const canAccessLevel = totalWordsLearned >= prevVocab;

        // Update node state
        if (isLevelFullyMastered) {
            // Completed level - mastered ALL words
            node.classList.remove('active', 'locked');
            node.classList.add('completed');
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = `${currentLevelVocab}/${currentLevelVocab} words ✓`;

            // Add checkmark to icon
            const nodeIcon = node.querySelector('.node-icon');
            const nodeNumber = node.querySelector('.node-number');
            if (nodeNumber) nodeNumber.textContent = '✓';
        } else if (canAccessLevel) {
            // Current active level - working on it but not all mastered yet
            node.classList.remove('completed', 'locked');
            node.classList.add('active');
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${wordsInThisLevel}/${currentLevelVocab} words`;
        } else {
            // Locked level - haven't mastered previous level yet
            node.classList.remove('active', 'completed');
            node.classList.add('locked');
            if (progressBar) progressBar.style.width = '0%';
        }
    }

    // Make active and completed nodes clickable
    const nodes = document.querySelectorAll('.level-node');
    nodes.forEach(node => {
        if (node.classList.contains('active') || node.classList.contains('completed')) {
            node.style.cursor = 'pointer';
            node.addEventListener('click', () => {
                const level = node.dataset.level;
                // Could navigate to level-specific review
                alert(`HSK ${level} Level\n\nClick START on the home page to review your current level cards!`);
            });
        }
    });
});
