import { getData, saveData } from '../utils/storage.js';
import { encrypt, decrypt } from '../utils/cryptoUtils.js';
import { updateCredential } from '../utils/api.js'; // Assuming this is where the API function is located

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const index = urlParams.get('index');
        console.log(`URL Parameter index: ${index}`);

        const credentials = await getData('credentials');
        console.log("--------------> Printing Credentials <--------------");
        console.log(credentials);

        if (Array.isArray(credentials) && index !== null && index < credentials.length) {
            const credential = credentials[index];
            console.log(`Credential at index ${index}:`, credential);

            if (credential) {
                document.getElementById('cred-name').value = credential.name;
                document.getElementById('cred-url').value = credential.url || 'N/A';
                document.getElementById('cred-username').value = credential.username;
                document.getElementById('cred-password').value = credential.password;
                document.getElementById('cred-password').setAttribute('data-password', credential.password);
                document.getElementById('cred-password').type = 'password';
                document.getElementById('cred-note').value = credential.note || ''; // Set the note field
            } else {
                console.log('Credential not found at index.');
                alert('Credential not found.');
                // window.location.href = 'vault.html';
            }
        } else {
            console.log('Index is invalid or credentials array is empty.');
            alert('No credentials available.');
            // window.location.href = 'vault.html';
        }

        document.getElementById('backButton').addEventListener('click', () => {
            window.location.href = 'vault.html';
        });

        document.getElementById('editButton').addEventListener('click', () => {
            toggleEditMode();
        });

        document.getElementById('togglePassword').addEventListener('click', () => {
            const passwordInput = document.getElementById('cred-password');
            const toggleButton = document.getElementById('togglePassword');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });

        document.getElementById('saveButton').addEventListener('click', async () => {
            const oldName = credentials[index].name;
            const oldUsername = credentials[index].username;
            const newName = document.getElementById('cred-name').value.trim();
            const newUrl = document.getElementById('cred-url').value.trim() || '';
            const newUsername = document.getElementById('cred-username').value.trim();
            const newPassword = document.getElementById('cred-password').value.trim();
            const newNote = document.getElementById('cred-note').value.trim(); // Get the updated note

            console.log('Updated Credential:', { oldName, oldUsername, newName, newUrl, newUsername, newPassword, newNote }); // Log the updated credential

            // Check for missing mandatory fields
            if (!newName || !newUsername || !newPassword) {
                alert('Error: Missing mandatory fields');
                return;
            }

            try {
                // Get the derived key
                const derivedKey = await getData('derivedKey');
                if (!derivedKey) {
                    alert('Failed to retrieve encryption key. Please log in again.');
                    window.location.href = 'login.html';
                    return;
                }

                // Encrypt the password using the derived key
                const encryptedPassword = await encrypt(newPassword, derivedKey);

                // Log the payload before sending
                const updatedCredential = {
                    oldName,
                    oldUsername,
                    newName,
                    newUrl,
                    newUsername,
                    newPassword: encryptedPassword,
                    newNote
                };
                console.log('Payload to be sent:', JSON.stringify(updatedCredential));

                const response = await updateCredential(updatedCredential);
                console.log('API Response:', response); // Log the API response

                if (response.success) {
                    alert('Saved successfully!');
                    toggleEditMode();

                    // Update the credentials array and save it back to storage
                    credentials[index] = {
                        name: newName,
                        url: newUrl,
                        username: newUsername,
                        password: encryptedPassword, // Update with the new encrypted password
                        note: newNote // Update with the new note
                    };
                    await saveData('credentials', credentials);

                    // Update the displayed credentials
                    document.getElementById('cred-name').value = newName;
                    document.getElementById('cred-url').value = newUrl || 'N/A';
                    document.getElementById('cred-username').value = newUsername;
                    document.getElementById('cred-password').value = newPassword;
                    document.getElementById('cred-password').type = 'password';
                    document.getElementById('cred-note').value = newNote; // Update the note field
                } else {
                    alert(`Error saving: ${response.message}`);
                }
            } catch (error) {
                console.error(`Error updating credential: ${error.message}`);
                alert(`An error occurred while saving: ${error.message}`);
            }
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        alert('An error occurred. Please try again.');
        // window.location.href = 'vault.html';
    }
});

function toggleEditMode() {
    const isEditing = document.body.classList.toggle('editing');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const elements = ['cred-name', 'cred-url', 'cred-username', 'cred-password', 'cred-note']; // Include the note field

    if (isEditing) {
        editButton.classList.add('editing'); // Add the editing class
        editButton.innerHTML = '<i class="fas fa-times"></i>'; // Change to cancel icon
        saveButton.style.display = 'inline-block'; // Show the save button
        elements.forEach(id => {
            const input = document.getElementById(id);
            input.readOnly = false;
            if (id !== 'cred-password') { // Skip changing type for password input
                input.type = 'text';
            }
        });
    } else {
        editButton.classList.remove('editing'); // Remove the editing class
        editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Change back to edit icon
        saveButton.style.display = 'none'; // Hide the save button
        elements.forEach(id => {
            const input = document.getElementById(id);
            input.readOnly = true;
            if (id === 'cred-password') {
                input.type = 'password'; // Ensure password input type is 'password'
            }
        });
    }
}
