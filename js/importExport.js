import { getData, saveData } from '../utils/storage.js';
import browser from 'webextension-polyfill';
import { parseCSV, validateHeaders, getHeadersForSource, convertToCSV, mapDataToPassVaultFormat } from '../utils/csvUtils.js';
import { addCredentials, getCredentials } from '../utils/api.js'; // Assuming addCredentials and getCredentials are in this path

document.addEventListener('DOMContentLoaded', () => {
    const importButton = document.getElementById('importButton');
    const exportButton = document.getElementById('exportButton');
    const backButton = document.getElementById('backButton');
    const selectSource = document.getElementById('select-source');
    const importFile = document.getElementById('importFile');

    // Set accept attribute to ensure only CSV files can be picked
    importFile.setAttribute('accept', '.csv');

    // Add options dynamically to the dropdown menu
    const sources = ['PassVault', 'Chrome', 'Firefox', 'Edge', 'Opera', 'Dashlane'];
    sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        selectSource.appendChild(option);
    });

    importButton.addEventListener('click', () => {
        importFile.click();
    });

    importFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const selectedSource = selectSource.value;

            // Read the file and send its content to the background script
            const reader = new FileReader();
            reader.onload = () => {
                const fileContent = reader.result;
                console.log('File Content:', fileContent);

                // Parse and validate CSV headers
                const headers = fileContent.split('\n')[0].split(',');
                const validHeaders = validateHeaders(headers, selectedSource);

                if (!validHeaders) {
                    alert('Error: CSV file headers do not match the expected format for the selected source.');
                    return;
                }

                // Parse the CSV content and handle it accordingly
                const credentials = parseCSV(fileContent, selectedSource);
                console.log('Parsed Credentials:', credentials);

                // Process the import action
                handleImport(credentials).then(response => {
                    if (response.success) {
                        console.log('Import processed successfully');
                    } else {
                        console.error('Import failed:', response.message);
                        alert('Import failed: ' + response.message);
                    }
                }).catch(error => {
                    console.error('Error processing import:', error);
                    alert('Error processing import: ' + error.message);
                });
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                alert('Error reading file: ' + error.message);
            };
            reader.readAsText(file);
        }
    });

    exportButton.addEventListener('click', () => {
        const selectedSource = selectSource.value;

        // Process the export action
        handleExport(selectedSource).catch((error) => {
            console.error('Error processing export:', error);
            alert('Error processing export: ' + error.message);
        });

        console.log('Export request sent');
    });

    backButton.addEventListener('click', () => {
        window.location.href = 'vault.html';
    });
});

async function handleExport(source) {
    try {
        const credentials = await getData('credentials');
        const csvData = convertToCSV(credentials, source);

        const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvData);
        const downloadId = await browser.downloads.download({
            url: url,
            filename: 'passwords.csv',
            saveAs: true
        });

        browser.downloads.onChanged.addListener((delta) => {
            if (delta.id === downloadId && delta.state && delta.state.current === 'complete') {
                alert('Passwords exported successfully');
            } else if (delta.id === downloadId && delta.error) {
                console.error('Download failed:', delta.error);
                alert('Failed to export passwords: ' + delta.error);
            }
        });
    } catch (error) {
        console.error('Error exporting passwords:', error);
        alert('Failed to export passwords: ' + error.message);
    }
}

async function handleImport(credentials) {
    try {
        // Check if credentials is an array
        if (!Array.isArray(credentials)) {
            throw new Error('Parsed credentials is not an array');
        }

        // Get current credentials
        const currentCredentials = await getData('credentials');
        console.log('Current Credentials:', currentCredentials);

        // Ensure currentCredentials is an array
        if (!Array.isArray(currentCredentials)) {
            throw new Error('Current credentials is not an array');
        }

        // Function to check for duplicates
        function isDuplicate(cred, list) {
            return list.some(existing => existing.name === cred.name && existing.username === cred.username);
        }

        // Remove duplicates from new credentials
        const uniqueNewCredentials = credentials.filter(cred => !isDuplicate(cred, currentCredentials));
        console.log('Unique New Credentials:', uniqueNewCredentials);

        // Check if uniqueNewCredentials is an array
        if (!Array.isArray(uniqueNewCredentials)) {
            throw new Error('Filtered unique new credentials is not an array');
        }

        // Map unique new credentials to PassVault format
        const passVaultFormattedCredentials = uniqueNewCredentials.map(cred => {
            const mapped = mapDataToPassVaultFormat(
                [cred.name, cred.url, cred.username, cred.password, cred.note],
                ['name', 'url', 'username', 'password', 'note'],
                'PassVault'
            );
            console.log('Mapped Credential:', mapped);
            return mapped;
        });

        // Check if passVaultFormattedCredentials is an array
        if (!Array.isArray(passVaultFormattedCredentials)) {
            throw new Error('Mapped PassVault formatted credentials is not an array');
        }

        // Send the formatted credentials to the server
        const addCredentialsResponse = await addCredentials(passVaultFormattedCredentials);
        console.log('Add Credentials Response:', addCredentialsResponse);

        if (!addCredentialsResponse.success) {
            throw new Error(addCredentialsResponse.message);
        }

        // Fetch the latest credentials from the server
        const result = await getCredentials();
        console.log('Updated Credentials:', result);

        if (!result.success) {
            throw new Error('Failed to fetch updated credentials from the server');
        }

        const updatedCredentials = result.credentials;

        // Ensure updatedCredentials is an array
        if (!Array.isArray(updatedCredentials)) {
            throw new Error('Updated credentials from the server is not an array');
        }

        // Get the derived key from storage
        const derivedKey = await getData('derivedKey');
        if (!derivedKey) {
            throw new Error('Failed to retrieve derived key from storage.');
        }

        // Decrypt the fetched credentials
        const decryptedCredentials = await Promise.all(updatedCredentials.map(async (cred) => {
            try {
                const decryptedPassword = await decrypt(cred.password, derivedKey);
                return { ...cred, password: decryptedPassword };
            } catch (decryptionError) {
                console.error('Failed to decrypt password for credential:', cred, decryptionError);
                return { ...cred, password: null };
            }
        }));

        // Save the decrypted credentials to storage
        await saveData('credentials', decryptedCredentials);

        // Notify user that import action has been processed
        alert('Import credentials action has been processed and duplicates removed.');

        return { success: true, message: 'Import processed successfully' };
    } catch (error) {
        console.error('Error importing passwords:', error);
        alert('Failed to process import: ' + error.message);
        return { success: false, message: 'Failed to process import: ' + error.message };
    }
}
