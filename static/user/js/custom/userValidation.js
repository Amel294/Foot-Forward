document.addEventListener('DOMContentLoaded', function () {

    const signupForm = document.getElementById('signupForm');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const passwordField = document.getElementById('password');
    const fullNameField = document.getElementById('full_name');

    const fullNameError = document.getElementById('full_name_error');
    const emailError = document.getElementById('email_error');
    const phoneError = document.getElementById('phone_error');
    const passwordError = document.getElementById('password_error');

    signupForm.addEventListener('submit', function (event) {

        // Clear all previous error messages
        fullNameError.textContent = '';
        emailError.textContent = '';
        phoneError.textContent = '';
        passwordError.textContent = '';

        let hasErrors = false;

        // Full Name Validation
        if (!/^[a-zA-Z\s]+$/.test(fullNameField.value)) {
            fullNameError.textContent = 'Full Name can only contain letters and spaces.';
            hasErrors = true;
        }

        // Phone Number Validation
        if (!/^\d{10}$/.test(phoneField.value)) {
            phoneError.textContent = 'Phone number should be exactly 10 digits long.';
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



