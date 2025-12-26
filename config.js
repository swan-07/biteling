// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================

// Supports multiple deployment methods:
// - Vercel: Loads from /api/config endpoint (serverless function)
// - Local: Loads from localStorage (browser console)
// - GitHub Pages: Loads from localStorage (browser console)

const ENV_CONFIG = {
    // Azure Speech Services
    AZURE_SPEECH_KEY: '',
    AZURE_SPEECH_REGION: '',

    // Azure OpenAI
    AZURE_OPENAI_KEY: '',
    AZURE_OPENAI_ENDPOINT: '',
    AZURE_OPENAI_DEPLOYMENT: '',
    AZURE_OPENAI_API_VERSION: '2024-02-01'
};

// Load config from Vercel API endpoint or localStorage
async function loadConfig() {
    // Try to load from Vercel serverless function first
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            Object.assign(ENV_CONFIG, config);
            console.log('✅ Loaded config from Vercel environment variables');
            return;
        }
    } catch (error) {
        // Not on Vercel or API not available, continue to localStorage
        console.log('⚠️ Vercel API not available, using localStorage');
    }

    // Fallback to localStorage for local development
    const savedConfig = localStorage.getItem('bitelingConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        Object.assign(ENV_CONFIG, parsed);
        console.log('✅ Loaded config from localStorage');
    } else {
        console.log('ℹ️ No config found. Use saveConfig() in console to set API keys.');
    }
}

// Function to save config to localStorage (for local development)
function saveConfig(config) {
    localStorage.setItem('bitelingConfig', JSON.stringify(config));
    Object.assign(ENV_CONFIG, config);
    console.log('✅ Config saved to localStorage');
    console.log('Azure Speech configured:', isAzureSpeechConfigured());
    console.log('Azure OpenAI configured:', isAzureOpenAIConfigured());
}

// Helper to check if Azure Speech is configured
function isAzureSpeechConfigured() {
    return !!(ENV_CONFIG.AZURE_SPEECH_KEY && ENV_CONFIG.AZURE_SPEECH_REGION);
}

// Helper to check if Azure OpenAI is configured
function isAzureOpenAIConfigured() {
    return !!(ENV_CONFIG.AZURE_OPENAI_KEY && ENV_CONFIG.AZURE_OPENAI_ENDPOINT && ENV_CONFIG.AZURE_OPENAI_DEPLOYMENT);
}

// Initialize config asynchronously
loadConfig().then(() => {
    // Export after loading
    window.ENV_CONFIG = ENV_CONFIG;
    window.saveConfig = saveConfig;
    window.isAzureSpeechConfigured = isAzureSpeechConfigured;
    window.isAzureOpenAIConfigured = isAzureOpenAIConfigured;

    console.log('🍪 BiteLing Config Loaded');
    console.log('🎤 Azure Speech:', isAzureSpeechConfigured() ? '✅ Ready' : '❌ Not configured');
    console.log('🤖 Azure OpenAI:', isAzureOpenAIConfigured() ? '✅ Ready' : '❌ Not configured');
});

// Export immediately for synchronous access (may be empty initially)
window.ENV_CONFIG = ENV_CONFIG;
window.saveConfig = saveConfig;
window.isAzureSpeechConfigured = isAzureSpeechConfigured;
window.isAzureOpenAIConfigured = isAzureOpenAIConfigured;
