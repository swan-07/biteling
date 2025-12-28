# Firebase Setup Guide

Your BiteLing app now supports user accounts with Firebase Authentication and Cloud Firestore!

## What You Can Do

✅ **Google Sign-In** - Users can sign in with their Google account
✅ **Email/Password** - Traditional email/password authentication
✅ **Data Sync** - Cookies, HSK level, reviews, and watch history sync across devices
✅ **Guest Mode** - Works offline without an account (localStorage only)
✅ **Auto-Save** - All progress automatically synced to Firebase when signed in

## Firebase Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" (or select existing project)
3. Enter project name (e.g., "BiteLing")
4. Disable Google Analytics (optional, not needed)
5. Click "Create project"

### 2. Register Your Web App

1. In Firebase project, click the **web icon** (</>)
2. App nickname: "BiteLing"
3. **Do NOT** check "Firebase Hosting" (we use Vercel)
4. Click "Register app"
5. **Copy the firebaseConfig object** - you'll need this!

### 3. Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Google** sign-in:
   - Click "Google"
   - Toggle "Enable"
   - Enter support email
   - Save
5. Enable **Email/Password** sign-in:
   - Click "Email/Password"
   - Toggle "Enable" (first option only, not email link)
   - Save

### 4. Create Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click "Create database"
3. **Start in production mode** (recommended)
4. Choose location (select closest to your users)
5. Click "Enable"

### 5. Set Up Firestore Security Rules

1. In Firestore, go to **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User's review sessions
      match /reviews/{reviewId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // User's watch history
      match /watchHistory/{videoId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click "Publish"

### 6. Add Firebase Config to Your App

#### Local Development

1. Open `firebase-config.local.js`
2. Paste your Firebase config values:

```javascript
window.FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Save the file - it's already in `.gitignore`!

#### Vercel Deployment

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add these variables:
   - `FIREBASE_API_KEY` = your apiKey
   - `FIREBASE_AUTH_DOMAIN` = your authDomain
   - `FIREBASE_PROJECT_ID` = your projectId
   - `FIREBASE_STORAGE_BUCKET` = your storageBucket
   - `FIREBASE_MESSAGING_SENDER_ID` = your messagingSenderId
   - `FIREBASE_APP_ID` = your appId

3. Update your Vercel build script in `vercel-build.sh` (already configured!)

4. Redeploy your site

### 7. Configure Authorized Domains

1. In Firebase Console, go to **Authentication → Settings**
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (already there)
   - `your-site.vercel.app`
   - Your custom domain (if any)

## How It Works

### Database Structure

```
users/
  {userId}/
    - email: string
    - displayName: string
    - cookies: number
    - hskLevel: number
    - createdAt: timestamp
    - lastActive: timestamp

    reviews/
      {sessionId}/
        - cardId: string
        - quality: number
        - timestamp: timestamp
        - ... session data

    watchHistory/
      {videoId}/
        - youtubeId: string
        - title: string
        - hskLevel: number
        - timestamp: timestamp
```

### Authentication Flow

1. **Not Signed In**: Data saved to localStorage only
2. **Sign In**: Firebase syncs localStorage → Firestore
3. **Return Visit**: Firestore → localStorage (download latest data)
4. **Sign Out**: Data stays in localStorage (offline mode)

### Features

- **Automatic Sync**: All changes automatically sync to Firebase when signed in
- **Offline Support**: Works without internet (localStorage fallback)
- **Cross-Device**: Sign in on any device to access your data
- **Guest Mode**: Use the app without signing in

## User Features

### Sign In Page

Users can access the login page:
- Click the user icon (👤) on the homepage
- Direct link: `/pages/login.html`

### Sign In Options

1. **Google Sign-In** (Recommended)
   - One-click authentication
   - Uses existing Google account
   - No password to remember

2. **Email/Password**
   - Create account with email
   - Password must be 6+ characters
   - Traditional auth method

3. **Guest Mode**
   - Click "Continue as Guest"
   - No account required
   - Data saved locally only

### Account Management

- **User Icon**: Shows first initial when signed in
- **Click Icon**:
  - If signed out → Go to login page
  - If signed in → Option to sign out
- **Auto-Sync**: All progress syncs automatically

## Security Notes

⚠️ **Client-side Firebase keys are public** - This is normal and expected!

Firebase security comes from:
1. **Firestore Rules** - Only authenticated users can access their own data
2. **Authentication** - Firebase verifies user identity
3. **Domain Restrictions** - Limit which domains can use your Firebase project

To enhance security:
1. Restrict your Firebase API key to specific domains in Google Cloud Console
2. Review Firestore security rules regularly
3. Monitor authentication activity
4. Set up billing alerts to prevent abuse

## Testing

1. Start your local server
2. Click user icon → Go to login
3. Sign in with Google or create email account
4. Verify data syncs:
   - Earn cookies
   - Change HSK level
   - Sign out and sign back in
   - Data should persist!

## Troubleshooting

**Login button doesn't work**
- Check browser console for errors
- Verify Firebase config is set
- Check authorized domains

**Data not syncing**
- Check Firestore security rules
- Verify user is authenticated
- Check browser network tab

**"Firebase not configured" message**
- Add config to `firebase-config.local.js`
- App will still work in guest mode (localStorage)

## Cost

Firebase free tier includes:
- **Authentication**: Unlimited users
- **Firestore**: 50K reads + 20K writes per day
- **Storage**: 1 GB

For a learning app with ~1000 users, you'll stay well within free tier!

## Next Steps

✅ Set up Firebase project
✅ Configure authentication
✅ Deploy to Vercel with environment variables
✅ Test sign-in flow
✅ Share with users!

Your app now has full user account support! 🎉
