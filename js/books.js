// Import user data manager
import userDataManager from './user-data.js';

// Book catalog - Chinese graded readers
const bookCatalog = [
    {
        id: 'book1',
        title: '小猫钓鱼',
        titleEn: 'The Kitten Goes Fishing',
        level: 'HSK 1',
        icon: '🐱',
        price: 10,
        description: 'A simple story about a kitten learning patience while fishing.',
        chapters: 3
    },
    {
        id: 'book2',
        title: '我的家',
        titleEn: 'My Family',
        level: 'HSK 1',
        icon: '🏠',
        price: 10,
        description: 'Learn about family members and daily routines at home.',
        chapters: 4
    },
    {
        id: 'book3',
        title: '小红帽',
        titleEn: 'Little Red Riding Hood',
        level: 'HSK 2',
        icon: '👧',
        price: 25,
        description: 'The classic fairy tale retold in simple Chinese.',
        chapters: 6
    },
    {
        id: 'book4',
        title: '三只小猪',
        titleEn: 'Three Little Pigs',
        level: 'HSK 2',
        icon: '🐷',
        price: 25,
        description: 'Build houses and learn new vocabulary with the three pigs.',
        chapters: 5
    },
    {
        id: 'book5',
        title: '北京的一天',
        titleEn: 'A Day in Beijing',
        level: 'HSK 3',
        icon: '🏛️',
        price: 50,
        description: 'Explore Beijing through the eyes of a local student.',
        chapters: 8
    },
    {
        id: 'book6',
        title: '中国美食',
        titleEn: 'Chinese Cuisine',
        level: 'HSK 3',
        icon: '🍜',
        price: 50,
        description: 'Discover regional dishes and food culture across China.',
        chapters: 7
    },
    {
        id: 'book7',
        title: '西游记故事',
        titleEn: 'Journey to the West Stories',
        level: 'HSK 4',
        icon: '🐵',
        price: 100,
        description: 'Simplified tales from the classic Chinese novel.',
        chapters: 10
    },
    {
        id: 'book8',
        title: '中国历史',
        titleEn: 'Chinese History',
        level: 'HSK 4',
        icon: '📜',
        price: 100,
        description: 'Journey through major dynasties and historical events.',
        chapters: 12
    }
];

// User data
let userData = {};
let purchasedBooks = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    setupTabs();
    renderStoreBooks();
    renderLibraryBooks();
});

// Load user data
async function loadUserData() {
    // Initialize user data manager
    await userDataManager.init();

    // Get cookies from userDataManager (Firebase-first)
    const cookies = userDataManager.getCookies();

    // Load old bitelingData for other fields
    const saved = localStorage.getItem('bitelingData');
    if (saved) {
        userData = JSON.parse(saved);
    } else {
        userData = {
            streak: 0,
            cookies: 0,
            cardsReviewed: 0,
            dailyGoal: 20,
            level: 1
        };
    }

    // Override cookies with userDataManager value
    userData.cookies = cookies;

    // Load purchased books
    const savedBooks = localStorage.getItem('purchasedBooks');
    if (savedBooks) {
        purchasedBooks = JSON.parse(savedBooks);
    }

    // Update cookie display
    document.getElementById('cookieCount').textContent = userData.cookies;
}

// Save purchased books
function savePurchasedBooks() {
    localStorage.setItem('purchasedBooks', JSON.stringify(purchasedBooks));
}

// Save user data
function saveUserData() {
    localStorage.setItem('bitelingData', JSON.stringify(userData));
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Render store books
function renderStoreBooks() {
    const storeGrid = document.getElementById('storeGrid');
    storeGrid.innerHTML = '';

    bookCatalog.forEach(book => {
        const isPurchased = purchasedBooks.includes(book.id);

        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="book-cover">${book.icon}</div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-meta">
                    <span class="book-level">${book.level}</span>
                    <span>${book.chapters} chapters</span>
                </div>
                <div class="book-description">${book.description}</div>
            </div>
            <div class="book-footer">
                ${isPurchased
                    ? '<span class="purchased-badge">✓ In Library</span>'
                    : '<span class="free-badge">📚 Free</span>'
                }
                <button class="buy-btn ${isPurchased ? 'read-btn' : ''}"
                        onclick="${isPurchased ? `readBook('${book.id}')` : `buyBook('${book.id}')`}">
                    ${isPurchased ? 'Read' : 'Add to Library'}
                </button>
            </div>
        `;
        storeGrid.appendChild(bookCard);
    });
}

// Render library books
function renderLibraryBooks() {
    const libraryGrid = document.getElementById('libraryGrid');
    const emptyLibrary = document.getElementById('emptyLibrary');

    libraryGrid.innerHTML = '';

    if (purchasedBooks.length === 0) {
        emptyLibrary.classList.add('show');
        return;
    }

    emptyLibrary.classList.remove('show');

    const userBooks = bookCatalog.filter(book => purchasedBooks.includes(book.id));

    userBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="book-cover">${book.icon}</div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-meta">
                    <span class="book-level">${book.level}</span>
                    <span>${book.chapters} chapters</span>
                </div>
                <div class="book-description">${book.description}</div>
            </div>
            <div class="book-footer">
                <span></span>
                <button class="buy-btn read-btn" onclick="readBook('${book.id}')">
                    Read
                </button>
            </div>
        `;
        libraryGrid.appendChild(bookCard);
    });
}

// Buy book (now free - just adds to library)
async function buyBook(bookId) {
    const book = bookCatalog.find(b => b.id === bookId);
    if (!book) return;

    // Add to purchased books (no longer costs cookies!)
    purchasedBooks.push(bookId);
    savePurchasedBooks();

    // Update display
    renderStoreBooks();
    renderLibraryBooks();

    // Show success message
    showPurchaseModal('success', book);
}

// Show purchase modal
function showPurchaseModal(type, book) {
    const modal = document.getElementById('purchaseModal');
    const modalIcon = document.getElementById('modalIcon');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalButton = document.getElementById('modalButton');

    if (type === 'success') {
        modalIcon.textContent = '📚';
        modalTitle.textContent = 'Added to Library!';
        modalMessage.innerHTML = `<strong>"${book.title}"</strong> has been added to your library.<br><br>Start reading now!`;
        modalButton.textContent = 'Go to Library';
        modalButton.onclick = () => {
            closePurchaseModal();
            // Switch to library tab
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('[data-tab="library"]').classList.add('active');
            document.getElementById('library').classList.add('active');
        };
    }

    modal.classList.add('show');
}

// Close purchase modal
function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    modal.classList.remove('show');
}

// Read book
function readBook(bookId) {
    const book = bookCatalog.find(b => b.id === bookId);
    if (!book) return;

    // Navigate to reader
    window.location.href = `reader.html?book=${bookId}`;
}

// Expose functions to window for onclick handlers
window.buyBook = buyBook;
window.readBook = readBook;
