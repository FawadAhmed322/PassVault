import { getData, saveData } from '../utils/storage.js';
import { getCredentials, deleteCredentials } from '../utils/api.js';

// Initialize list of credentials to delete
const credentialsToDelete = [];

async function fetchAndDisplayCredentials() {
    const vaultContents = document.getElementById('vault-contents');

    try {
        const result = await getCredentials();
        if (result.success) {
            await saveData('credentials', result.credentials);
            vaultContents.innerHTML = result.credentials.map((cred, index) => `
                <div class="vault-item" data-index="${index}">
                    <div class="space-left"></div>
                    <div class="text-container" data-index="${index}">
                        <div class="cred-name">${cred.name}</div>
                        <div class="cred-username">${cred.username}</div>
                    </div>
                    <div class="checkbox-container">
                        <input type="checkbox" class="vault-item-checkbox" data-index="${index}">
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.text-container').forEach(item => {
                item.addEventListener('click', (e) => {
                    const index = e.currentTarget.getAttribute('data-index');
                    window.location.href = `detail.html?index=${index}`;
                });
            });

            // Set up checkbox event listeners
            document.querySelectorAll('.vault-item-checkbox').forEach(item => {
                item.addEventListener('change', (e) => {
                    const index = e.currentTarget.getAttribute('data-index');
                    const credential = result.credentials[index];
                    if (e.currentTarget.checked) {
                        credentialsToDelete.push({
                            name: credential.name,
                            username: credential.username
                        });
                    } else {
                        const credentialIndex = credentialsToDelete.findIndex(
                            cred => cred.name === credential.name && cred.username === credential.username
                        );
                        if (credentialIndex > -1) {
                            credentialsToDelete.splice(credentialIndex, 1);
                        }
                    }
                });
            });
        } else {
            console.error('Failed to fetch credentials:', result.message);
            await saveData('credentials', []);
            vaultContents.innerHTML = '<div class="vault-item">No credentials available</div>';
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error during fetching credentials:', error);
        await saveData('credentials', []);
        vaultContents.innerHTML = '<div class="vault-item">No credentials available</div>';
        alert('An unexpected error occurred. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const email = await getData('email');
    const derivedKey = await getData('derivedKey');

    if (email && derivedKey) {
        console.log('User is logged in');
        console.log('Email:', email);
        console.log('Derived Key:', derivedKey);

        // Fetch and display credentials on page load
        await fetchAndDisplayCredentials();

        const addCredentialButton = document.getElementById('add-credential-btn');
        if (addCredentialButton) {
            addCredentialButton.addEventListener('click', () => {
                window.location.href = 'addCredential.html';
            });
        } else {
            console.error("Add Credential button not found");
        }

        const deleteCredentialButton = document.getElementById('delete-credential-btn');
        if (deleteCredentialButton) {
            deleteCredentialButton.addEventListener('click', async () => {
                const numChecked = credentialsToDelete.length;

                if (numChecked > 0) {
                    const confirmDelete = confirm(`Are you sure you want to delete ${numChecked} item(s)?`);
                    if (confirmDelete) {
                        try {
                            const deleteResult = await deleteCredentials(credentialsToDelete);
                            if (deleteResult.success) {
                                alert(`${numChecked} item(s) deleted successfully`);
                                // Fetch and display credentials after successful deletion
                                await fetchAndDisplayCredentials();
                                // Clear the delete list
                                credentialsToDelete.length = 0;
                            } else {
                                alert(`Failed to delete items: ${deleteResult.message}`);
                            }
                        } catch (error) {
                            console.error('Error during deletion:', error);
                            alert('An unexpected error occurred while deleting. Please try again.');
                        }
                    }
                } else {
                    alert('No items selected for deletion');
                }
            });
        } else {
            console.error("Delete Credential button not found");
        }
    } else {
        console.log('User is not logged in, redirecting to login page');
        window.location.href = 'login.html';
    }
});
