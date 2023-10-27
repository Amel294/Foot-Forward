document.addEventListener('DOMContentLoaded', function () {

    const signupForm = document.getElementById('signupForm');
    const emailField = document.getElementById('email');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const fullNameField = document.getElementById('full_name');

    const fullNameError = document.getElementById('full_name_error');
    const emailError = document.getElementById('email_error');
    const usernameError = document.getElementById('username_error');
    const passwordError = document.getElementById('password_error');

    signupForm.addEventListener('submit', function (event) {
        
        // Clear all previous error messages
        fullNameError.textContent = '';
        emailError.textContent = '';
        usernameError.textContent = '';
        passwordError.textContent = '';
        
        let hasErrors = false;

        // Full Name Validation
        if (!/^[a-zA-Z\s]+$/.test(fullNameField.value)) {
            fullNameError.textContent = 'Full Name can only contain letters and spaces.';
            hasErrors = true;
        }

        // Username Validation
        if (!/^[a-zA-Z0-9_.-]{3,15}$/.test(usernameField.value)) {
            usernameError.textContent = 'Username should be between 3 and 15 characters and can only contain letters, numbers, underscores, hyphens, and dots.';
            hasErrors = true;
        }

        // Password Validation
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@]{8,}$/.test(passwordField.value)) {
            passwordError.textContent = 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and can include the "@" character.';
            hasErrors = true;
        }

        if (hasErrors) {
            event.preventDefault();
            return;
        }
        
    });
});



