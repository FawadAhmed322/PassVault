// js/popup.js
import { getData, deleteData } from '../utils/storage.js';

console.log("This is a popup!");

document.addEventListener('DOMContentLoaded', async () => {
    // await deleteData('email');
    // await deleteData('derivedKey');
    const email = await getData('email');
    const derivedKey = await getData('derivedKey');
    
    if (email && derivedKey) {
        console.log('User is logged in');
        console.log('Email:', email)
        console.log('Derived Key:', derivedKey)
        window.location.href = 'vault.html';
    } else {
        console.log('User is not logged in, redirecting to login page');
        window.location.href = 'login.html';
    }
});
