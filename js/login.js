// Login Page Logic
import firebaseService from './firebase-service.js';

// DOM Elements
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const showSignUpBtn = document.getElementById('showSignUp');
const showSignInBtn = document.getElementById('showSignIn');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const googleSignUpBtn = document.getElementById('googleSignUpBtn');
const emailSignInForm = document.getElementById('emailSignInForm');
const emailSignUpForm = document.getElementById('emailSignUpForm');
const errorMessage = document.getElementById('errorMessage');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize Firebase
firebaseService.init();

// Check if already signed in
firebaseService.onAuthStateChange((user) => {
    if (user) {
        // Redirect to home page if already signed in
        window.location.href = '../index.html';
    }
});

// Toggle between Sign In and Sign Up forms
showSignUpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signInForm.classList.add('hidden');
    signUpForm.classList.remove('hidden');
    hideError();
});

showSignInBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signUpForm.classList.add('hidden');
    signInForm.classList.remove('hidden');
    hideError();
});

// Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
    showLoading();
    hideError();

    const result = await firebaseService.signInWithGoogle();

    hideLoading();

    if (result.success) {
        // Will redirect via auth state listener
    } else {
        showError(result.error);
    }
});

googleSignUpBtn.addEventListener('click', async () => {
    showLoading();
    hideError();

    const result = await firebaseService.signInWithGoogle();

    hideLoading();

    if (result.success) {
        // Will redirect via auth state listener
    } else {
        showError(result.error);
    }
});

// Email/Password Sign-In
emailSignInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    hideError();

    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    const result = await firebaseService.signInWithEmail(email, password);

    hideLoading();

    if (result.success) {
        // Will redirect via auth state listener
    } else {
        showError(result.error);
    }
});

// Email/Password Sign-Up
emailSignUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();
    hideError();

    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpPasswordConfirm').value;

    // Validate password match
    if (password !== confirmPassword) {
        hideLoading();
        showError('Passwords do not match');
        return;
    }

    const result = await firebaseService.signUpWithEmail(email, password);

    hideLoading();

    if (result.success) {
        // Will redirect via auth state listener
    } else {
        showError(result.error);
    }
});

// Helper functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}
