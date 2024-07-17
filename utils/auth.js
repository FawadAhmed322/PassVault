// utils/auth.js
import { loginApi, logoutApi } from './api.js';
import { deriveKey } from './cryptoUtils.js';
import { saveData, getData, deleteData } from './storage.js';

// Login function - calls API, handles response, and saves email and derivedKey
export async function login(email, password) {
    try {
        const response = await loginApi(email, password);
        if (response.success) {
            const salt = response.salt;
            const derivedKey = await deriveKey(password, salt);

            await saveData('email', email);
            await saveData('derivedKey', derivedKey);
            console.log('Login successful');

            return { success: true };
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error(`Error during login: ${error.message}`);
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
