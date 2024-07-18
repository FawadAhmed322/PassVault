// utils/auth.js
import { loginApi, logoutApi, getCredentials } from './api.js';
import { deriveKey, decrypt } from './cryptoUtils.js';
import { saveData, getData, deleteData } from './storage.js';

// Improved Login function - calls API, handles response, decrypts passwords, and saves email and derivedKey
export async function login(email, password) {
    try {
        // Call the login API with the provided email and password
        const response = await loginApi(email, password);
        
        if (response.success) {
            // Extract the salt from the response
            const salt = response.salt;
            
            // Derive the key using the password and the salt
            const derivedKey = await deriveKey(password, salt);
            
            // Save the email and derived key to storage
            await saveData('email', email);
            await saveData('derivedKey', derivedKey);
            
            // Fetch the user's credentials
            const result = await getCredentials();
            
            if (result.success) {
                // Decrypt the credentials
                const decryptedCredentials = await Promise.all(result.credentials.map(async (cred) => {
                    try {
                        console.log(cred)
                        const decryptedPassword = await decrypt(cred.password, derivedKey);
                        return { ...cred, password: decryptedPassword };
                    } catch (decryptionError) {
                        console.error('Failed to decrypt password for credential:', cred, decryptionError);
                        return { ...cred, password: null };
                    }
                }));
                console.log(decryptedCredentials)

                // Save the decrypted credentials to storage
                await saveData('credentials', decryptedCredentials);
                return { success: true };
            } else {
                // Handle the case where fetching credentials fails
                console.error('Failed to fetch credentials:', result.message);
                await saveData('credentials', []);
                alert(`Error: ${result.message}`);
                return { success: false, message: result.message || 'Failed to retrieve credentials.' };
            }
        } else {
            // Handle the case where the login API call fails
            throw new Error(response.message || 'Login failed.');
        }
    } catch (error) {
        // Log the error for debugging purposes
        console.error(`Error during login: ${error.message}`);
        
        // Return a standardized error response
        return { success: false, message: error.message || 'An error occurred during login. Please try again.' };
    }
}

// Logout function - removes email and derivedKey
export async function logout() {
    try {
        const response = await logoutApi();
        if (response.status === 200) {
            await deleteData('email');
            await deleteData('derivedKey');
            console.log('Logout successful');
            return { success: true, message: response.message };
        } else {
            throw new Error(response.message || 'Logout failed');
        }
    } catch (error) {
        console.error(`Error during logout: ${error.message}`);
        return { success: false, message: error.message || 'An error occurred during logout. Please try again.' };
    }
}

// Register function - placeholder for now
export async function register(email, password) {
    // Implement registration logic here
    console.log('Register function called');
}
