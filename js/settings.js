// Import getData function from storage.js
import { getData, saveData } from '../utils/storage.js';
// Import updatePassword and updatePasswordsOnly functions from api.js
import { updatePassword, updatePasswordsOnly, getCredentials } from '../utils/api.js';
// Import encrypt, decrypt, and deriveKey functions from cryptoUtils.js
import { encrypt, decrypt, deriveKey } from '../utils/cryptoUtils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('settings-form');

    // Fetch email using getData
    const emailInput = document.getElementById('email');
    emailInput.value = await getData('email'); // Assuming getData retrieves the email value from storage

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = emailInput.value;
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;

        try {
            // Call the updatePassword function
            const response = await updatePassword(oldPassword, newPassword);
            console.log('API Response:', response); // Log the API response

            if (response.success) {
                const salt = response.salt;
                const oldDerivedKey = await getData('derivedKey');

                // Get and decrypt all credentials
                const { success, credentials } = await getCredentials();
                if (!success) {
                    throw new Error('Failed to retrieve credentials');
                }

                const decryptedCredentials = await Promise.all(credentials.map(async credential => ({
                    ...credential,
                    password: await decrypt(credential.password, oldDerivedKey)
                })));

                // Derive new key using new password and salt
                const newDerivedKey = await deriveKey(newPassword, salt);

                // Encrypt credentials with new derived key
                const encryptedCredentials = await Promise.all(decryptedCredentials.map(async credential => ({
                    ...credential,
                    password: await encrypt(credential.password, newDerivedKey)
                })));

                console.log('Encrypted Credentials:', encryptedCredentials); // Log encrypted credentials

                // Update passwords on the server
                const updateResponse = await updatePasswordsOnly(encryptedCredentials);

                if (updateResponse.success) {
                    // Save the new derived key
                    await saveData('derivedKey', newDerivedKey);
                    alert('Password updated and credentials re-encrypted successfully');
                } else {
                    alert(`Failed to update encrypted passwords: ${updateResponse.message}`);
                }
            } else {
                alert(`Failed to update password: ${response.message}`);
            }
        } catch (error) {
            console.error('Error updating password:', error);
            alert('An internal error occurred. Please try again later.');
        }

        // Reset only the password fields, keeping the email field intact
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
    });
});
