import { getData, saveData } from '../utils/storage.js';
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

            const serverCredential = {
                name,
                url,
                username,
                password: encryptedPassword,
                note  // Adding the note field to the credential object
            };

            // Send the credentials to the server
            const result = await addCredential(serverCredential);
            if (result.success) {
                // Save the credential to local storage with plaintext password
                const localCredential = {
                    name,
                    url,
                    username,
                    password, // Save the plaintext password locally
                    note
                };

                // Get existing credentials from storage
                let credentials = await getData('credentials') || [];
                credentials.push(localCredential);

                // Save the updated credentials back to storage
                await saveData('credentials', credentials);

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
