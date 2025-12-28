// Firebase Configuration Template
// DO NOT add your Firebase keys here! This file is committed to git.
//
// LOCAL DEVELOPMENT:
// 1. Create firebase-config.local.js (will be created for you)
// 2. Add your Firebase config there
// 3. The .local.js file overrides this and is gitignored
//
// VERCEL DEPLOYMENT:
// 1. Go to Vercel project settings → Environment Variables
// 2. Add all Firebase config values (see vercel-build.sh)
// 3. Redeploy
//
// Get your Firebase config from: https://console.firebase.google.com/

window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
    // Firebase config priority:
    // 1. firebase-config.local.js overrides this (local dev)
    // 2. window.ENV.FIREBASE_* (Vercel build-time injection)
    // 3. Empty object (default - shows setup instructions)
    apiKey: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_API_KEY) || '',
    authDomain: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_AUTH_DOMAIN) || '',
    projectId: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_PROJECT_ID) || '',
    storageBucket: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_STORAGE_BUCKET) || '',
    messagingSenderId: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_MESSAGING_SENDER_ID) || '',
    appId: (typeof window.ENV !== 'undefined' && window.ENV.FIREBASE_APP_ID) || ''
};
