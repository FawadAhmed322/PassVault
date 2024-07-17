import { getData } from '../utils/storage.js';
import { addCredential } from '../utils/api.js';
import { encrypt } from '../utils/cryptoUtils.js'; // Assuming you have a function for encryption

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('add-credential-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const url = document.getElementById('url').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const note = document.getElementById('note').value;  // New note field

        // Get the derived key
        const derivedKey = await getData('derivedKey');
        if (!derivedKey) {
            alert('Failed to retrieve encryption key. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        try {
            // Encrypt the password using the derived key
            const encryptedPassword = await encrypt(password, derivedKey);

            const credential = {
                name,
                url,
                username,
                password: encryptedPassword,
                note  // Adding the note field to the credential object
            };

            // Save the credential to local storage (or handle it as required)
            let credentials = JSON.parse(localStorage.getItem('credentials')) || [];
            credentials.push(credential);
            localStorage.setItem('credentials', JSON.stringify(credentials));

            // Send the credentials to the server if needed
            const result = await addCredential(credential);
            if (result.success) {
                alert('Credential added successfully');
                window.location.href = 'vault.html';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error adding credential:', error);
            alert('Failed to add credential. Please try again.');
        }
    });

    // Back button functionality
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        window.location.href = 'vault.html';
    });
});
