# Required Environment Variables

Create a `.env.local` file in the root directory with these variables:

```env
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > General > Your apps > Web app config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI (for the AI features)
# Get this from Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
```

## How to get Firebase credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon `</>`
6. Copy the config object values to your `.env.local` file

## Important Notes:

- Make sure you have enabled **Email/Password** authentication in Firebase Console
- Go to Authentication > Sign-in method > Email/Password and enable it
- Disable Google sign-in method if you don't want it
- All `NEXT_PUBLIC_` variables are exposed to the client side
- Keep `GOOGLE_GENAI_API_KEY` private (no NEXT_PUBLIC prefix) 