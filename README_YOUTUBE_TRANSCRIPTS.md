# YouTube Transcripts Setup

## Overview
The Watch page now fetches real YouTube video transcripts using a Vercel serverless function.

## Setup Instructions

### 1. Install Dependencies

On Vercel, the dependencies will be installed automatically from `package.json`.

For local testing, run:
```bash
npm install
```

This installs:
- `youtube-transcript` - Library to fetch YouTube auto-generated captions

### 2. Deploy to Vercel

The API endpoint is at `/api/captions.js` and will be automatically deployed when you push to Vercel.

### 3. How It Works

1. **User clicks transcript button** (📝) on Watch page
2. **Frontend calls** `/api/captions?videoId=VIDEO_ID`
3. **Serverless function** (`/api/captions.js`) fetches the transcript using `youtube-transcript` library
4. **Transcript is returned** as JSON with full text and timestamped segments
5. **Frontend displays** transcript with clickable Chinese words
6. **User clicks words** to see dictionary definitions and add to SRS

### 4. API Response Format

```json
{
  "videoId": "abc123",
  "transcript": "完整的字幕文本...",
  "segments": [
    {
      "text": "你好",
      "duration": 2.5,
      "offset": 0.0
    }
  ],
  "language": "zh"
}
```

### 5. Fallback Behavior

If the API fails or transcripts aren't available:
- Falls back to placeholder Chinese text
- User can still click words and add to SRS
- No error shown to user (graceful degradation)

### 6. Language Priority

The API tries to fetch transcripts in this order:
1. Simplified Chinese (`zh-Hans`)
2. Any Chinese variant (`zh`)
3. Any available language (fallback)

## Notes

- Only works with videos that have auto-generated or manual captions
- Transcripts are fetched in real-time (not cached)
- CORS is enabled for cross-origin requests
- No YouTube API key required for this method!
