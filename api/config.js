// Vercel Serverless Function to securely serve environment variables
// This runs on the server, not in the browser

export default function handler(req, res) {
  // CORS - Allow requests from your Vercel domain
  const allowedOrigins = [
    'http://localhost:8000',           // Local development
    'http://localhost:3000',           // Vercel dev
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'https://biteling.vercel.app'      // Update with your actual domain
  ].filter(Boolean);

  const origin = req.headers.origin || req.headers.referer;

  // Check if request is from allowed origin
  const isAllowed = allowedOrigins.some(allowed =>
    origin && origin.includes(allowed.replace('https://', '').replace('http://', ''))
  );

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment variables
  // These are set in Vercel dashboard under Settings → Environment Variables
  res.status(200).json({
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY || '',
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION || '',
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY || '',
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT || '',
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT || '',
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
  });
}
