# Firebase Security Rules for BiteLing

To enable the Friends feature and other functionality, you need to update your Firebase Security Rules.

## How to Update Security Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your BiteLing project
3. Click on "Firestore Database" in the left sidebar
4. Click on the "Rules" tab at the top
5. Replace the existing rules with the rules below
6. Click "Publish"

## Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Allow authenticated users to read user documents (needed for friends feature)
      allow read: if request.auth != null;

      // Allow users to create their own document on sign up
      allow create: if request.auth != null && request.auth.uid == userId;

      // Allow users to update their own document
      allow update: if request.auth != null && request.auth.uid == userId;

      // Allow users to delete their own document
      allow delete: if request.auth != null && request.auth.uid == userId;

      // Subcollections (reviews, watchHistory)
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## What These Rules Allow

- **Read**: Authenticated users can read any user document (needed for friends feature to check if users exist and display friend info)
- **Create**: Users can create their own user document when signing up
- **Update**: Users can only update their own user document (including the `friends` array)
- **Delete**: Users can only delete their own account
- **Subcollections**: Users can read/write their own review sessions and watch history

## Security Features

✅ Users cannot modify other users' documents (only their own)
✅ Users can view other users' basic info for friends feature
✅ Anonymous users cannot access any data
✅ All operations require authentication

## Note

Currently, adding friends and sending cookies only updates your own friend list. To implement mutual friendships or actual cookie transfers between users, you would need:

1. **Cloud Functions** to handle server-side logic that can update multiple users
2. **More complex security rules** with resource validation
3. **A pending requests system** where Friend B must accept Friend A's request

For this demo/prototype, the current one-way friendship works fine!
