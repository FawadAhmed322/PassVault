import browser from 'webextension-polyfill';

// Save data to browser storage
export async function saveData(key, value) {
    try {
        if (value instanceof CryptoKey) {
            const exportedKey = await window.crypto.subtle.exportKey('raw', value);
            const keyArray = Array.from(new Uint8Array(exportedKey));
            await browser.storage.local.set({ [key]: { type: 'CryptoKey', data: keyArray } });
        } else {
            await browser.storage.local.set({ [key]: value });
        }
        console.log(`Data saved: ${key} = ${value}`);
    } catch (error) {
        console.error(`Error saving data: ${error}`);
    }
}

// Retrieve data from browser storage
export async function getData(key) {
    try {
        const result = await browser.storage.local.get(key);
        if (result[key]) {
            const storedData = result[key];
            if (storedData.type === 'CryptoKey') {
                return await importCryptoKey(storedData.data);
            }
            return storedData;
        }
        throw new Error(`Key ${key} not found in storage`);
    } catch (error) {
        console.error(`Error getting data: ${error}`);
    }
}

// Import a CryptoKey from stored data
async function importCryptoKey(data) {
    const keyBuffer = new Uint8Array(data).buffer;
    return await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

// Delete data from browser storage
export async function deleteData(key) {
    try {
        await browser.storage.local.remove(key);
        console.log(`Data deleted: ${key}`);
    } catch (error) {
        console.error(`Error deleting data: ${error}`);
    }
}
