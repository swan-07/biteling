// Daily Bites Notification System

class NotificationManager {
    constructor() {
        this.checkInterval = null;
        this.hasPermission = false;
    }

    // Request notification permission from user
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.hasPermission = true;
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.hasPermission = permission === 'granted';
            return this.hasPermission;
        }

        return false;
    }

    // Initialize notification system
    async init() {
        // Register service worker for better notification support
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw-notification.js');
                console.log('Notification Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }

        // Request permission if not already granted
        await this.requestPermission();

        // Start checking for notification time
        this.startDailyCheck();

        // Listen for changes to reminder time
        window.addEventListener('storage', (e) => {
            if (e.key === 'reminderTime') {
                console.log('Reminder time changed, restarting checks');
                this.startDailyCheck();
            }
        });
    }

    // Convert 12-hour time to 24-hour format
    convertTo24Hour(hour, period) {
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        return hour24;
    }

    // Check if it's time to send notification
    shouldNotifyNow() {
        const reminderTime = JSON.parse(localStorage.getItem('reminderTime') || '{"hour":"8","minute":"00","period":"PM"}');
        const lastNotification = localStorage.getItem('lastNotificationDate');
        const today = new Date().toDateString();

        // Don't notify if we already notified today
        if (lastNotification === today) {
            return false;
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const targetHour = this.convertTo24Hour(reminderTime.hour, reminderTime.period);
        const targetMinute = parseInt(reminderTime.minute);

        // Check if current time matches target time (within 1 minute window)
        const isRightHour = currentHour === targetHour;
        const isRightMinute = currentMinute === targetMinute;

        return isRightHour && isRightMinute;
    }

    // Send the daily Bites notification
    async sendDailyNotification() {
        if (!this.hasPermission) {
            console.log('No notification permission');
            return;
        }

        // Get user's streak
        const bitelingData = JSON.parse(localStorage.getItem('bitelingData') || '{}');
        const streak = bitelingData.streak || 0;

        // Create notification
        const notification = new Notification('Time for your daily Bites! 🍪', {
            body: `Keep your ${streak} day streak going! Practice some Chinese now.`,
            icon: '/assets/favicon.svg',
            badge: '/assets/favicon.svg',
            tag: 'daily-bites',
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200]
        });

        // Click handler - open BiteLing
        notification.onclick = () => {
            window.focus();
            window.location.href = '/index.html';
            notification.close();
        };

        // Mark as notified today
        localStorage.setItem('lastNotificationDate', new Date().toDateString());

        // Also show in-page banner if page is open
        this.showInPageBanner(`Time for your daily Bites! Keep your ${streak} day streak going!`);
        this.playNotificationSound();

        console.log('Daily Bites notification sent!');
    }

    // Start checking every minute for notification time
    startDailyCheck() {
        // Clear existing interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Check immediately
        if (this.shouldNotifyNow()) {
            this.sendDailyNotification();
        }

        // Check every minute
        this.checkInterval = setInterval(() => {
            if (this.shouldNotifyNow()) {
                this.sendDailyNotification();
            }
        }, 60000); // 60 seconds

        console.log('Daily notification check started');
    }

    // Stop checking
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Show in-page notification banner
    showInPageBanner(message) {
        // Create banner element
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
            color: #6B5D4F;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
            z-index: 10000;
            font-family: 'Quicksand', sans-serif;
            font-weight: 600;
            font-size: 16px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;
        banner.textContent = '🍪 ' + message;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(banner);

        // Remove after 5 seconds
        setTimeout(() => {
            banner.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => banner.remove(), 300);
        }, 5000);
    }

    // Play notification sound
    playNotificationSound() {
        // Create a simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('Could not play sound:', error);
        }
    }

    // Test notification immediately (for testing purposes)
    async testNotification() {
        console.log('Test notification clicked');
        console.log('Current permission:', Notification.permission);

        // Check if browser supports notifications
        if (!('Notification' in window)) {
            alert('Your browser does not support notifications');
            return;
        }

        // Request permission if needed
        if (Notification.permission === 'default') {
            console.log('Requesting permission...');
            const permission = await Notification.requestPermission();
            console.log('Permission result:', permission);

            if (permission !== 'granted') {
                alert('Please allow notifications to use this feature');
                return;
            }
            this.hasPermission = true;
        } else if (Notification.permission === 'denied') {
            alert('Notifications are blocked. Please enable them in your browser settings.');
            return;
        } else {
            this.hasPermission = true;
        }

        try {
            const bitelingData = JSON.parse(localStorage.getItem('bitelingData') || '{}');
            const streak = bitelingData.streak || 0;

            console.log('Creating notification with streak:', streak);

            const notification = new Notification('Time for your daily Bites! 🍪', {
                body: `Keep your ${streak} day streak going! Practice some Chinese now.`,
                icon: '/assets/favicon.svg',
                badge: '/assets/favicon.svg',
                tag: 'daily-bites-test',
                requireInteraction: true,  // Make it stay visible
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            console.log('✅ Test notification sent!');

            // Also show a visual banner on the page
            this.showInPageBanner('Test notification created! If you don\'t see a system notification, check your browser/system settings.');

            // Play a sound to confirm
            this.playNotificationSound();
        } catch (error) {
            console.error('Error creating notification:', error);
            alert('Error creating notification: ' + error.message);
        }
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export for use in other modules
export default notificationManager;
