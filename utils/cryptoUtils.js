// Function to derive a key from the master password and salt
export async function deriveKey(password, salt) {
    const passwordBuffer = new TextEncoder().encode(password);
    const saltBuffer = Uint8Array.from(atob(salt), c => c.charCodeAt(0));

    const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: 100000,
            hash: 'SHA-256'
        },
        passwordKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    );

    const rawKey = await crypto.subtle.exportKey('raw', derivedKey);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)));
}

// Function to encrypt data using AES-GCM with a 12-byte IV
export async function encrypt(data, base64Key) {
    const key = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    const iv = crypto.getRandomValues(new Uint8Array(12));  // 12-byte IV for AES-GCM

    const keyBuffer = await crypto.subtle.importKey(
        'raw',
        key,
        'AES-GCM',
        true,
        ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        keyBuffer,
        new TextEncoder().encode(data)
    );

    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.byteLength);

    return btoa(String.fromCharCode.apply(null, combined));
}

// Function to decrypt data using AES-GCM with a 12-byte IV
export async function decrypt(encryptedData, base64Key) {
    const key = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = dataBuffer.slice(0, 12);
    const ciphertext = dataBuffer.slice(12);

    const keyBuffer = await crypto.subtle.importKey(
        'raw',
        key,
        'AES-GCM',
        true,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        keyBuffer,
        ciphertext
    );

    return new TextDecoder().decode(decrypted);
}
