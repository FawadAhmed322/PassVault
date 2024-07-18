import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const apiUrl = process.env.API_URL;

// Function to log in a user
export async function loginApi(email, password) {
    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to log in:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to log out a user
export async function logoutApi() {
    try {
        const response = await fetch(`${apiUrl}/logout`, {
            method: 'POST',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            return { status: response.status, message: data.message || response.statusText, ...data };
        }

        return { status: response.status, message: 'Logout successful', ...data };
    } catch (error) {
        console.error('Failed to log out:', error);
        return { status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to get credentials from the server
export async function getCredentials() {
    try {
        const response = await fetch(`${apiUrl}/get-credentials`, {
            method: 'GET',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to fetch credentials:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to add a credential to the server
export async function addCredential(credential) {
    try {
        const response = await fetch(`${apiUrl}/add-credential`, {
            method: 'POST',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credential)
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to add credential:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to add multiple credentials to the server
export async function addCredentials(credentials) {
    try {
        const response = await fetch(`${apiUrl}/add-credentials`, {
            method: 'POST',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credentials })
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to add credentials:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to delete credentials
export async function deleteCredentials(credentials) {
    try {
        const response = await fetch(`${apiUrl}/delete-credentials`, {
            method: 'DELETE',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credentials })
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, errors: data.errors, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to delete credentials:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to update a credential
export async function updateCredential(credential) {
    try {
        const response = await fetch(`${apiUrl}/update-credential`, {
            method: 'PUT',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credential)
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to update credential:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to update passwords only
export async function updatePasswordsOnly(credentials) {
    try {
        const response = await fetch(`${apiUrl}/update-password-only`, {
            method: 'PUT',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credentials })
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to update passwords:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}

// Function to update the user's password
export async function updatePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${apiUrl}/update-password`, {
            method: 'POST',
            credentials: 'include', // Include cookies if needed for session
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, status: response.status, message: data.message || response.statusText, ...data };
        }

        return { success: true, status: response.status, ...data };
    } catch (error) {
        console.error('Failed to update password:', error);
        return { success: false, status: 500, message: 'An internal error occurred. Please try again later.', error };
    }
}
