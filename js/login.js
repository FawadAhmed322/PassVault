import { login } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log("Login form found:", loginForm);

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("Form submitted");

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const result = await login(email, password);
                if (result.success) {
                    console.log('Logged in with email:', email);
                    window.location.href = 'vault.html';
                } else {
                    console.error('Failed to log in:', result.message);
                    alert(`Error: ${result.message}`);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An unexpected error occurred. Please try again.');
            }
        });
    } else {
        console.error("Login form not found");
    }
});
