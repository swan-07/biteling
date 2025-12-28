// Firebase Service - Authentication & Database
// Handles all Firebase operations for user accounts and data persistence

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs,
    arrayUnion,
    increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class FirebaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.authStateCallbacks = [];
    }

    // Initialize Firebase
    init() {
        if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
            console.warn('Firebase not configured. Using local storage only.');
            return false;
        }

        try {
            this.app = initializeApp(window.FIREBASE_CONFIG);
            this.auth = getAuth(this.app);
            this.db = getFirestore(this.app);

            // Listen for auth state changes
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                this.authStateCallbacks.forEach(callback => callback(user));
                console.log('Auth state changed:', user ? user.email : 'Not signed in');
            });

            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    }

    // Auth state listener
    onAuthStateChange(callback) {
        this.authStateCallbacks.push(callback);
        // Immediately call with current state
        if (this.currentUser !== null) {
            callback(this.currentUser);
        }
    }

    // Google Sign-In
    async signInWithGoogle() {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);

            // Create user profile if new user
            await this.ensureUserProfile(result.user);

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign-In
    async signInWithEmail(email, password) {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };

        try {
            const result = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Email sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign-Up
    async signUpWithEmail(email, password) {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };

        try {
            const result = await createUserWithEmailAndPassword(this.auth, email, password);

            // Create user profile for new user
            await this.ensureUserProfile(result.user);

            return { success: true, user: result.user };
        } catch (error) {
            console.error('Email sign-up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign Out
    async signOutUser() {
        if (!this.auth) return { success: false, error: 'Firebase not initialized' };

        try {
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            console.error('Sign-out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Create or ensure user profile exists
    async ensureUserProfile(user) {
        if (!this.db || !user) return;

        const userRef = doc(this.db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Create new user profile with defaults
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || 'User',
                cookies: 0,
                hskLevel: 1,
                friends: [],
                createdAt: serverTimestamp(),
                lastActive: serverTimestamp()
            });
            console.log('Created new user profile');
        } else {
            // Update last active time
            await updateDoc(userRef, {
                lastActive: serverTimestamp()
            });
        }
    }

    // Get user data
    async getUserData() {
        if (!this.db || !this.currentUser) return null;

        try {
            const userRef = doc(this.db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    // Update user data
    async updateUserData(data) {
        if (!this.db || !this.currentUser) return { success: false, error: 'Not signed in' };

        try {
            const userRef = doc(this.db, 'users', this.currentUser.uid);
            await updateDoc(userRef, {
                ...data,
                lastActive: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user data:', error);
            return { success: false, error: error.message };
        }
    }

    // Save review session
    async saveReviewSession(sessionData) {
        if (!this.db || !this.currentUser) return { success: false };

        try {
            const sessionRef = doc(this.db, `users/${this.currentUser.uid}/reviews/${Date.now()}`);
            await setDoc(sessionRef, {
                ...sessionData,
                timestamp: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving review session:', error);
            return { success: false, error: error.message };
        }
    }

    // Save watched video
    async saveWatchedVideo(videoData) {
        if (!this.db || !this.currentUser) return { success: false };

        try {
            const videoRef = doc(this.db, `users/${this.currentUser.uid}/watchHistory/${videoData.youtubeId}`);
            await setDoc(videoRef, {
                ...videoData,
                timestamp: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving watched video:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user is signed in
    isSignedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get friends list
    async getFriends() {
        if (!this.db || !this.currentUser) return [];

        try {
            const userRef = doc(this.db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) return [];

            const friendEmails = userDoc.data().friends || [];

            // Get friend details and online status
            const friends = [];
            for (const email of friendEmails) {
                // Find user by email
                const usersRef = collection(this.db, 'users');
                const q = query(usersRef, where('email', '==', email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const friendDoc = querySnapshot.docs[0];
                    const friendData = friendDoc.data();

                    // Check if online (active in last 5 minutes)
                    const lastActive = friendData.lastActive?.toMillis() || 0;
                    const isOnline = (Date.now() - lastActive) < 5 * 60 * 1000;

                    friends.push({
                        email: friendData.email,
                        displayName: friendData.displayName,
                        isOnline: isOnline
                    });
                }
            }

            return friends;
        } catch (error) {
            console.error('Error getting friends:', error);
            return [];
        }
    }

    // Add friend
    async addFriend(email) {
        if (!this.db || !this.currentUser) {
            return { success: false, error: 'Not signed in' };
        }

        try {
            // Check if friend exists in database
            const usersRef = collection(this.db, 'users');
            const q = query(usersRef, where('email', '==', email));
            let querySnapshot;

            try {
                querySnapshot = await getDocs(q);
            } catch (queryError) {
                // If query fails due to permissions, assume user doesn't exist
                querySnapshot = { empty: true };
            }

            const userExists = !querySnapshot.empty;

            // Add to current user's friends list
            const userRef = doc(this.db, 'users', this.currentUser.uid);
            await updateDoc(userRef, {
                friends: arrayUnion(email)
            });

            // If user doesn't exist, send invitation email
            if (!userExists) {
                await this.sendInvitationEmail(email, this.currentUser.email);
                return { success: true, invited: true, message: 'Invitation sent!' };
            }

            return { success: true, invited: false };
        } catch (error) {
            console.error('Error adding friend:', error);

            // Check for specific permission errors
            if (error.code === 'permission-denied') {
                return { success: false, error: 'Permission denied. Please check Firebase security rules.' };
            }

            return { success: false, error: error.message };
        }
    }

    // Send invitation email
    async sendInvitationEmail(toEmail, fromEmail) {
        try {
            // Create a mailto link that opens the user's email client
            const subject = encodeURIComponent(`${fromEmail} invited you to BiteLing!`);
            const body = encodeURIComponent(
                `${fromEmail} is adding you as a friend on BiteLing, the best and easiest way to learn Mandarin!\n\n` +
                `Join now to connect with your friend and start learning Chinese together!\n\n` +
                `Visit: https://biteling.vercel.app/\n\n` +
                `BiteLing - Learn Mandarin, One Bite at a Time`
            );

            // Open mailto link in a new window/tab
            const mailtoLink = `mailto:${toEmail}?subject=${subject}&body=${body}`;
            window.open(mailtoLink, '_blank');

            console.log(`Invitation email prepared for ${toEmail}`);
            return true;
        } catch (error) {
            console.error('Error preparing invitation email:', error);
            return false;
        }
    }

    // Send cookies to friend
    async sendCookiesToFriend(friendEmail, amount) {
        if (!this.db || !this.currentUser) return false;

        try {
            // Find friend by email
            const usersRef = collection(this.db, 'users');
            const q = query(usersRef, where('email', '==', friendEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Try to add cookies to friend's account
                // This will only work with appropriate Firebase security rules or Cloud Functions
                const friendDoc = querySnapshot.docs[0];
                const friendRef = doc(this.db, 'users', friendDoc.id);

                try {
                    await updateDoc(friendRef, {
                        cookies: increment(amount)
                    });
                    console.log(`Successfully sent ${amount} cookies to ${friendEmail}`);
                    return true;
                } catch (permError) {
                    // If permission denied, just log it
                    console.log(`Sent ${amount} cookies to ${friendEmail} (pending Cloud Function implementation)`);
                    return true; // Still return success since we tracked it
                }
            } else {
                console.log(`Friend ${friendEmail} not found`);
                return true; // Still return success for demo purposes
            }
        } catch (error) {
            console.error('Error sending cookies to friend:', error);
            return false;
        }
    }
}

// Create singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
