// Vercel Serverless Function to fetch YouTube transcripts
// Uses youtube-transcript library to get auto-generated captions
// Install: npm install youtube-transcript

import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { videoId } = req.query;

    if (!videoId) {
        return res.status(400).json({ error: 'videoId parameter is required' });
    }

    try {
        // Fetch transcript - this gets auto-generated captions
        // Try Chinese first, then fall back to any available language
        let transcript;

        try {
            // Try to get Chinese transcript
            transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'zh-Hans' // Simplified Chinese
            });
        } catch (err) {
            try {
                // Fallback to any Chinese variant
                transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                    lang: 'zh'
                });
            } catch (err2) {
                // Last resort: get any available transcript
                transcript = await YoutubeTranscript.fetchTranscript(videoId);
            }
        }

        if (!transcript || transcript.length === 0) {
            return res.status(404).json({ error: 'No transcript available for this video' });
        }

        // Combine all transcript segments into full text
        const fullText = transcript.map(segment => segment.text).join(' ');

        return res.status(200).json({
            videoId,
            transcript: fullText,
            segments: transcript, // Include timestamped segments
            language: 'zh' // Assumed Chinese
        });

    } catch (error) {
        console.error('Error fetching transcript:', error);
        return res.status(500).json({
            error: 'Failed to fetch transcript',
            details: error.message
        });
    }
}
