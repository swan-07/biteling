// YouTube API Configuration Template
// DO NOT add your API key here! This file is committed to git.
//
// LOCAL DEVELOPMENT:
// 1. Create youtube-config.local.js (already exists)
// 2. Add your API key there
// 3. The .local.js file overrides this and is gitignored
//
// VERCEL DEPLOYMENT:
// 1. Go to Vercel project settings → Environment Variables
// 2. Add YOUTUBE_API_KEY = your key
// 3. Run: bash vercel-build.sh (or let Vercel run it)
// 4. Redeploy
//
// Get your API key from: https://console.cloud.google.com/apis/credentials

window.YOUTUBE_CONFIG = window.YOUTUBE_CONFIG || {
    // API key priority:
    // 1. youtube-config.local.js overrides this (local dev)
    // 2. window.ENV.YOUTUBE_API_KEY (Vercel build-time injection)
    // 3. Empty string (default - shows instructions)
    apiKey: (typeof window.ENV !== 'undefined' && window.ENV.YOUTUBE_API_KEY) || '',

    // Search queries for each HSK level
    // Each level has educational (10x weight) and entertaining (1x weight) content
    searchQueries: {
        1: {
            educational: ['中文学习', '中文教学', '汉语对话', '中文课程', '学中文'],
            entertaining: ['中文搞笑', '抖音搞笑']
        },
        2: {
            educational: ['中文听力', '汉语学习', '中文对话练习', '中文教材', '学习中文'],
            entertaining: ['中国美食', '中国旅游']
        },
        3: {
            educational: ['中文口语', '汉语教学', '中文会话', '中文练习', 'HSK学习'],
            entertaining: ['中文短剧', '旅游vlog']
        },
        4: {
            educational: ['中文新闻', '中文播客', '汉语访谈', '中文讲座', '学习汉语'],
            entertaining: ['中文综艺', '娱乐节目']
        },
        5: {
            educational: ['中文纪录片', '中文演讲', '汉语讲座', '中文辩论', '中文访谈节目'],
            entertaining: ['中国历史', '文化节目']
        }
    },

    // Video duration - 'short' for YouTube Shorts (under 60 seconds)
    videoDuration: 'short',

    // Maximum results per API call
    maxResults: 20
};
