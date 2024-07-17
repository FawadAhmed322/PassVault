// js/background.js

import browser from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});
