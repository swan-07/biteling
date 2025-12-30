// Import user data manager
import userDataManager from './user-data.js';

// ========================================
// STATE MANAGEMENT
// ========================================

let userData = {};
let currentVideoIndex = 0;
let currentVideo = null;
let userHSKLevel = 1;
let playbackSpeed = 1.0;
let activeSubtitles = [];

// ========================================
// YOUTUBE VIDEO DATABASE (DYNAMIC FETCH)
// ========================================

// Video cache - stores fetched videos for each HSK level
let videoCache = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
};

// Fetch state
let isFetchingVideos = false;
let nextPageTokens = {}; // Store pagination tokens for each level

// YouTube Player instance
let player = null;

// ========================================
// YOUTUBE API FETCHING
// ========================================

async function fetchYouTubeVideos(hskLevel, pageToken = '') {
    const config = window.YOUTUBE_CONFIG;

    if (!config || !config.apiKey) {
        console.warn('YouTube API key not configured. Add your key in youtube-config.js');
        return [];
    }

    // Get the search queries and randomly select with weighted probability
    // Educational content has 10x higher probability than entertaining
    const queries = config.searchQueries[hskLevel] || config.searchQueries[1];

    // Create weighted array: educational terms appear 10 times, entertaining once
    const weightedQueries = [];

    // Add educational queries 10 times each (10x weight)
    if (queries.educational) {
        queries.educational.forEach(term => {
            for (let i = 0; i < 10; i++) {
                weightedQueries.push(term);
            }
        });
    }

    // Add entertaining queries once each (1x weight)
    if (queries.entertaining) {
        queries.entertaining.forEach(term => {
            weightedQueries.push(term);
        });
    }

    // Randomly select from weighted array
    const query = weightedQueries[Math.floor(Math.random() * weightedQueries.length)];

    const url = new URL('https://www.googleapis.com/youtube/v3/search');

    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'video');
    url.searchParams.append('videoDuration', config.videoDuration);
    url.searchParams.append('maxResults', config.maxResults);
    url.searchParams.append('key', config.apiKey);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('relevanceLanguage', 'zh');
    url.searchParams.append('videoDefinition', 'any');

    if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();

        // Store next page token for infinite scroll
        if (data.nextPageToken) {
            nextPageTokens[hskLevel] = data.nextPageToken;
        }

        // Get video IDs to fetch statistics
        const videoIds = data.items.map(item => item.id.videoId).join(',');

        // Fetch video statistics to filter by view count
        const statsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
        statsUrl.searchParams.append('part', 'statistics');
        statsUrl.searchParams.append('id', videoIds);
        statsUrl.searchParams.append('key', config.apiKey);

        try {
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();

            // Create a map of video ID to view count
            const viewCounts = {};
            statsData.items.forEach(item => {
                viewCounts[item.id] = parseInt(item.statistics.viewCount || 0);
            });

            // Convert to our video format and filter by 100k+ views
            const videos = data.items
                .filter(item => {
                    const views = viewCounts[item.id.videoId] || 0;
                    return views >= 100000; // 100k minimum views
                })
                .map(item => ({
                    youtubeId: item.id.videoId,
                    title: item.snippet.title
                }));

            console.log(`Fetched ${videos.length} videos for HSK ${hskLevel} (filtered to 100k+ views)`);
            return videos;
        } catch (statsError) {
            console.warn('Failed to fetch video statistics, returning unfiltered results:', statsError);

            // Fallback: return videos without filtering
            const videos = data.items.map(item => ({
                youtubeId: item.id.videoId,
                title: item.snippet.title
            }));

            console.log(`Fetched ${videos.length} videos for HSK ${hskLevel}`);
            return videos;
        }

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}

async function ensureVideosLoaded(hskLevel) {
    // If we already have videos in cache, return
    if (videoCache[hskLevel].length > 0) {
        return;
    }

    // If already fetching, wait
    if (isFetchingVideos) {
        return;
    }

    isFetchingVideos = true;

    const videos = await fetchYouTubeVideos(hskLevel);

    if (videos.length > 0) {
        videoCache[hskLevel] = videos;
    } else {
        // Fallback to demo video if API fails
        console.log('Using fallback demo video');
        videoCache[hskLevel] = [
            { youtubeId: 'jNQXAC9IVRw', title: `Demo Video - Add YouTube API key for real content` }
        ];
    }

    isFetchingVideos = false;
}

async function loadMoreVideos(hskLevel) {
    if (isFetchingVideos) return;

    isFetchingVideos = true;

    const pageToken = nextPageTokens[hskLevel] || '';
    const videos = await fetchYouTubeVideos(hskLevel, pageToken);

    if (videos.length > 0) {
        videoCache[hskLevel].push(...videos);
        console.log(`Total videos for HSK ${hskLevel}: ${videoCache[hskLevel].length}`);
    }

    isFetchingVideos = false;
}

// ========================================
// INITIALIZATION
// ========================================

// YouTube API ready callback
let isYouTubeAPIReady = false;
window.onYouTubeIframeAPIReady = function() {
    isYouTubeAPIReady = true;
    console.log('YouTube API ready');
    if (currentVideo) {
        renderVideo();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    determineHSKLevel();

    // Load videos for current level
    await ensureVideosLoaded(userHSKLevel);

    initializeVideo();
    setupEventListeners();
    updateCookiesDisplay();
});

async function loadUserData() {
    // Initialize user data manager
    await userDataManager.init();

    // Get cookies from userDataManager (Firebase-first)
    const cookies = userDataManager.getCookies();

    // Load old bitelingData for other fields
    const saved = localStorage.getItem('bitelingData');
    if (saved) {
        userData = JSON.parse(saved);
    } else {
        userData = {
            cookies: 0,
            cards: [],
            watchProgress: {}
        };
    }

    // Override cookies with userDataManager value
    userData.cookies = cookies;
}

function saveUserData() {
    localStorage.setItem('bitelingData', JSON.stringify(userData));
}

function determineHSKLevel() {
    const cards = userData.cards || [];
    const masteredCount = cards.filter(card => card.masteryLevel === 4).length;

    if (masteredCount >= 2500) userHSKLevel = 5;
    else if (masteredCount >= 1200) userHSKLevel = 4;
    else if (masteredCount >= 600) userHSKLevel = 3;
    else if (masteredCount >= 300) userHSKLevel = 2;
    else userHSKLevel = 1;

    console.log(`User HSK Level: ${userHSKLevel} (${masteredCount} mastered words)`);
    document.getElementById('hskBadge').textContent = `HSK ${userHSKLevel}`;
}

// ========================================
// VIDEO PLAYBACK
// ========================================

function initializeVideo() {
    // Get videos for user's level from cache
    const videos = videoCache[userHSKLevel] || [];

    if (videos.length === 0) {
        showLoadingPlaceholder();
        return;
    }

    // Restore progress or start from beginning
    const watchProgress = userData.watchProgress || {};
    currentVideoIndex = watchProgress[userHSKLevel] || 0;

    // Loop back to start if reached end
    if (currentVideoIndex >= videos.length) {
        currentVideoIndex = 0;
    }

    loadVideo(currentVideoIndex);
}

async function loadVideo(index) {
    const videos = videoCache[userHSKLevel] || [];

    // If we're near the end, load more videos
    if (index >= videos.length - 3 && !isFetchingVideos) {
        loadMoreVideos(userHSKLevel);
    }

    currentVideo = videos[index];

    if (!currentVideo) {
        showNoVideosPlaceholder();
        return;
    }

    renderVideo();
    startSubtitleLoop();
}

function renderVideo() {
    const container = document.getElementById('feedContainer');

    // Create YouTube player container
    container.innerHTML = `
        <div id="youtubePlayer"></div>
    `;

    // Wait for YouTube API to be ready
    if (!window.YT || !window.YT.Player) {
        console.log('Waiting for YouTube API...');
        return;
    }

    // Destroy existing player if any
    if (player) {
        player.destroy();
    }

    // Create new YouTube player
    player = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: currentVideo.youtubeId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'loop': 1,
            'modestbranding': 1,
            'playsinline': 1,
            'rel': 0,
            'showinfo': 0,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'playlist': currentVideo.youtubeId
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.setPlaybackRate(playbackSpeed);
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // Auto-loop is handled by playerVars
}

function showLoadingPlaceholder() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = `
        <div class="video-placeholder">
            <div class="placeholder-icon">⏳</div>
            <div class="placeholder-text">Loading videos...</div>
            <div class="placeholder-text" style="font-size: 0.9rem;">
                Fetching Chinese learning content
            </div>
        </div>
    `;
}

function showNoVideosPlaceholder() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = `
        <div class="video-placeholder">
            <div class="placeholder-icon">🔑</div>
            <div class="placeholder-text">Add YouTube API Key</div>
            <div class="placeholder-text" style="font-size: 0.9rem;">
                Edit youtube-config.js to enable infinite video feed
            </div>
        </div>
    `;
}

// ========================================
// SUBTITLE SYSTEM
// ========================================

let subtitleLoopInterval = null;
let currentSubtitleTime = 0;

function startSubtitleLoop() {
    // Clear any existing loop
    if (subtitleLoopInterval) {
        clearInterval(subtitleLoopInterval);
    }

    currentSubtitleTime = 0;

    // Simulate subtitle timing (in real app, would sync with video)
    subtitleLoopInterval = setInterval(() => {
        updateSubtitles(currentSubtitleTime);
        currentSubtitleTime += 1;

        // Loop subtitles
        if (currentSubtitleTime > currentVideo.duration) {
            currentSubtitleTime = 0;
        }
    }, 1000);
}

function updateSubtitles(time) {
    const subtitle = currentVideo.subtitles.find(sub =>
        sub.time <= time && (!currentVideo.subtitles.find(s => s.time > sub.time && s.time <= time))
    );

    if (subtitle) {
        document.getElementById('chineseSubtitle').textContent = subtitle.chinese;
        document.getElementById('pinyinSubtitle').textContent = subtitle.pinyin;
        document.getElementById('englishSubtitle').textContent = subtitle.english;
    }
}

window.toggleSubtitles = function(type) {
    const buttons = {
        'chinese': document.getElementById('chineseBtn'),
        'pinyin': document.getElementById('pinyinBtn'),
        'english': document.getElementById('englishBtn')
    };

    const subtitles = {
        'chinese': document.getElementById('chineseSubtitle'),
        'pinyin': document.getElementById('pinyinSubtitle'),
        'english': document.getElementById('englishSubtitle')
    };

    // Toggle button state
    buttons[type].classList.toggle('active');

    // Toggle subtitle visibility
    if (subtitles[type].classList.contains('hidden')) {
        subtitles[type].classList.remove('hidden');
        activeSubtitles.push(type);
    } else {
        subtitles[type].classList.add('hidden');
        activeSubtitles = activeSubtitles.filter(t => t !== type);
    }
};

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Replay button
    document.getElementById('replayBtn').addEventListener('click', () => {
        if (player && player.seekTo) {
            player.seekTo(0);
            player.playVideo();
        }
        currentSubtitleTime = 0;
        console.log('Replaying video...');
    });

    // Swipe detection for next video
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    // Keyboard for desktop
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            nextVideo();
        }
    });

    // Mouse wheel for desktop - scroll down to go to next video (like TikTok)
    let lastScrollTime = 0;
    let accumulatedDelta = 0;
    let isChangingVideo = false; // Prevent multiple triggers

    document.addEventListener('wheel', (e) => {
        const now = Date.now();

        // Ignore if we're currently changing videos
        if (isChangingVideo) {
            return;
        }

        console.log('Wheel event detected, deltaY:', e.deltaY, 'accumulated:', accumulatedDelta);

        // Reset accumulated delta if too much time has passed
        if (now - lastScrollTime > 300) {
            accumulatedDelta = 0;
        }

        accumulatedDelta += e.deltaY;

        // Scroll DOWN (positive deltaY) = next video (like TikTok)
        // Threshold: 50 for accumulated scroll
        if (accumulatedDelta > 50) {
            console.log('Scroll DOWN threshold reached! Going to next video');
            isChangingVideo = true;
            accumulatedDelta = 0;
            nextVideo();

            // Reset cooldown after 800ms
            setTimeout(() => {
                isChangingVideo = false;
            }, 800);
        }
        // Scroll up could go to previous video in the future
        else if (accumulatedDelta < -50) {
            console.log('Scroll UP detected');
            accumulatedDelta = 0;
        }

        lastScrollTime = now;
    }, { passive: true });

    // Mouse drag for desktop
    let mouseStartY = 0;
    let mouseEndY = 0;
    let isDragging = false;

    document.addEventListener('mousedown', (e) => {
        isDragging = true;
        mouseStartY = e.screenY;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            mouseEndY = e.screenY;
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            mouseEndY = e.screenY;
            const dragDistance = mouseStartY - mouseEndY;

            // Drag up to go to next video
            if (dragDistance > 100) {
                nextVideo();
            }
        }
        isDragging = false;
    });
}

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;

    // Swipe up to go to next video
    if (swipeDistance > 50) {
        nextVideo();
    }
}

async function nextVideo() {
    // Move to next video (no longer costs cookies!)
    const videos = videoCache[userHSKLevel] || [];
    currentVideoIndex++;

    // If we reach the end and have more videos loading, wrap around
    if (currentVideoIndex >= videos.length) {
        currentVideoIndex = 0; // Loop back
    }

    // Save progress
    if (!userData.watchProgress) userData.watchProgress = {};
    userData.watchProgress[userHSKLevel] = currentVideoIndex;
    saveUserData();

    // Load next video
    loadVideo(currentVideoIndex);
}

function toggleSpeed() {
    const speeds = [1.0, 0.75, 0.5, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    playbackSpeed = speeds[nextIndex];

    // Update YouTube player speed if available
    if (player && player.setPlaybackRate) {
        player.setPlaybackRate(playbackSpeed);
    }

    document.querySelector('.speed-label').textContent = `${playbackSpeed}x`;
    console.log(`Playback speed: ${playbackSpeed}x`);
}

function showCookieWarning() {
    const warning = document.getElementById('cookieWarning');
    warning.classList.remove('hidden');

    setTimeout(() => {
        warning.classList.add('hidden');
    }, 3000);
}

function updateCookiesDisplay() {
    document.getElementById('cookiesCount').textContent = userData.cookies || 0;
}

function toggleSubtitlePanel() {
    const panel = document.getElementById('subtitlePanel');
    panel.classList.toggle('hidden');
}
