// EmailJS Configuration
// Sign up at https://www.emailjs.com/ to get your credentials

// TEMPLATE: Copy this file to emailjs-config.local.js and add your real credentials
// emailjs-config.local.js is gitignored and won't be committed

window.EMAILJS_CONFIG = {
    serviceId: 'YOUR_SERVICE_ID',     // From EmailJS dashboard > Email Services
    templateId: 'YOUR_TEMPLATE_ID',   // From EmailJS dashboard > Email Templates
    publicKey: 'YOUR_PUBLIC_KEY'      // From EmailJS dashboard > Account > API Keys
};

// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an email service (Gmail, Outlook, etc.)
// 3. Create an email template with these variables:
//    - {{to_email}} - recipient's email
//    - {{from_email}} - sender's email (your friend)
//    - {{app_url}} - BiteLing URL
// 4. Copy your Service ID, Template ID, and Public Key
// 5. Create emailjs-config.local.js with your real credentials
