// User Data Manager
// Handles syncing between localStorage and Firebase

import firebaseService from './firebase-service.js';

class UserDataManager {
    constructor() {
        this.userData = null;
        this.syncEnabled = false;
    }

    // Initialize and sync with Firebase
    async init() {
        // Always load from localStorage first
        this.loadFromLocalStorage();

        const initialized = firebaseService.init();

        if (initialized) {
            // Wait for auth state
            firebaseService.onAuthStateChange(async (user) => {
                if (user) {
                    this.syncEnabled = true;
                    await this.syncFromFirebase();
                    // Trigger UI update when signed in
                    if (window.BiteLing && window.BiteLing.updateUserAccountDisplay) {
                        window.BiteLing.updateUserAccountDisplay();
                    }
                } else {
                    this.syncEnabled = false;
                    this.loadFromLocalStorage();
                    // Trigger UI update when signed out
                    if (window.BiteLing && window.BiteLing.updateUserAccountDisplay) {
                        window.BiteLing.updateUserAccountDisplay();
                    }
                }
            });
        } else {
            // Firebase not configured, use localStorage only
            this.syncEnabled = false;
        }
    }

    // Load data from localStorage
    loadFromLocalStorage() {
        const cookies = parseInt(localStorage.getItem('cookies')) || 0;
        const hskLevel = parseInt(localStorage.getItem('hskLevel')) || 1;

        this.userData = {
            cookies,
            hskLevel
        };

        console.log('Loaded from localStorage:', this.userData);
    }

    // Sync data from Firebase
    async syncFromFirebase() {
        const firebaseData = await firebaseService.getUserData();

        if (firebaseData) {
            this.userData = {
                cookies: firebaseData.cookies || 0,
                hskLevel: firebaseData.hskLevel || 1
            };

            // Update localStorage to match Firebase
            localStorage.setItem('cookies', this.userData.cookies);
            localStorage.setItem('hskLevel', this.userData.hskLevel);

            console.log('Synced from Firebase:', this.userData);
        } else {
            // No Firebase data, sync localStorage to Firebase
            this.loadFromLocalStorage();
            await this.syncToFirebase();
        }
    }

    // Sync data to Firebase
    async syncToFirebase() {
        if (!this.syncEnabled) return;

        await firebaseService.updateUserData({
            cookies: this.userData.cookies,
            hskLevel: this.userData.hskLevel
        });

        console.log('Synced to Firebase:', this.userData);
    }

    // Get cookies
    getCookies() {
        return this.userData ? this.userData.cookies : 0;
    }

    // Set cookies
    async setCookies(amount) {
        if (!this.userData) this.userData = { cookies: 0, hskLevel: 1 };

        this.userData.cookies = amount;
        localStorage.setItem('cookies', amount);

        if (this.syncEnabled) {
            await this.syncToFirebase();
        }
    }

    // Add cookies
    async addCookies(amount) {
        const current = this.getCookies();
        await this.setCookies(current + amount);
    }

    // Subtract cookies
    async subtractCookies(amount) {
        const current = this.getCookies();
        const newAmount = Math.max(0, current - amount);
        await this.setCookies(newAmount);
    }

    // Get HSK level
    getHSKLevel() {
        return this.userData ? this.userData.hskLevel : 1;
    }

    // Set HSK level
    async setHSKLevel(level) {
        if (!this.userData) this.userData = { cookies: 0, hskLevel: 1 };

        this.userData.hskLevel = level;
        localStorage.setItem('hskLevel', level);

        if (this.syncEnabled) {
            await this.syncToFirebase();
        }
    }

    // Save review session
    async saveReviewSession(sessionData) {
        if (this.syncEnabled) {
            await firebaseService.saveReviewSession(sessionData);
        }
        // Also save to localStorage for offline access
        const sessions = JSON.parse(localStorage.getItem('reviewSessions') || '[]');
        sessions.push({ ...sessionData, timestamp: Date.now() });
        // Keep only last 50 sessions
        if (sessions.length > 50) sessions.shift();
        localStorage.setItem('reviewSessions', JSON.stringify(sessions));
    }

    // Save watched video
    async saveWatchedVideo(videoData) {
        if (this.syncEnabled) {
            await firebaseService.saveWatchedVideo(videoData);
        }
        // Also save to localStorage
        const videos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
        videos.push({ ...videoData, timestamp: Date.now() });
        // Keep only last 100 videos
        if (videos.length > 100) videos.shift();
        localStorage.setItem('watchedVideos', JSON.stringify(videos));
    }

    // Check if user is signed in
    isSignedIn() {
        return firebaseService.isSignedIn();
    }

    // Get current user
    getCurrentUser() {
        return firebaseService.getCurrentUser();
    }

    // Sign in with email/password
    async signInWithEmail(email, password) {
        return await firebaseService.signInWithEmail(email, password);
    }

    // Sign up with email/password
    async signUpWithEmail(email, password) {
        return await firebaseService.signUpWithEmail(email, password);
    }

    // Sign out
    async signOut() {
        await firebaseService.signOutUser();
        // Don't clear localStorage - keep data for guest mode
    }

    // Get friends list
    async getFriends() {
        if (this.syncEnabled) {
            return await firebaseService.getFriends();
        }
        return [];
    }

    // Add friend
    async addFriend(email) {
        if (!this.syncEnabled) {
            return { success: false, error: 'Please sign in to add friends' };
        }
        return await firebaseService.addFriend(email);
    }

    // Send cookies to friend
    async sendCookiesToFriend(friendEmail, amount) {
        if (!this.syncEnabled) {
            return false;
        }

        // Send cookies (don't deduct from sender - it's a free gift)
        const success = await firebaseService.sendCookiesToFriend(friendEmail, amount);
        return success;
    }
}

// Create singleton instance
const userDataManager = new UserDataManager();
export default userDataManager;
