import { logout } from '../utils/auth.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded event fired');

    fetch('../template.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(html => {
            console.log('Fetched HTML:', html);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const commonTemplate = tempDiv.querySelector('#common-template');

            if (!commonTemplate) {
                throw new Error('Common template not found');
            }

            const commonTemplateContainer = document.getElementById('common-template-container');

            // Clone the common template content
            const clone = commonTemplate.content.cloneNode(true);
            console.log('Cloned Template:', clone);

            // Set the page title dynamically
            const pageTitle = clone.querySelector('#page-title');
            if (document.title && pageTitle) {
                pageTitle.textContent = document.title;
            }

            // Insert the cloned content into the common template container
            commonTemplateContainer.appendChild(clone);
            console.log('Template appended to container');

            // Add event listener for the hamburger menu
            const menuIcon = document.querySelector('#menu-icon');
            const menu = document.querySelector('#menu');
            if (menuIcon && menu) {
                menuIcon.addEventListener('click', () => {
                    console.log('Menu icon clicked');
                    menu.classList.toggle('show');
                });
            } else {
                console.error('Menu icon or menu not found');
            }

            // Add event listeners for the menu buttons
            const vaultButton = document.querySelector('#vault-button');
            const settingsButton = document.querySelector('#settings-button');
            const importExportButton = document.querySelector('#import-export-button');
            const logoutButton = document.querySelector('#logout-button');

            if (vaultButton) {
                vaultButton.addEventListener('click', () => {
                    console.log('Vault button clicked');
                    window.location.href = 'vault.html';
                });
            } else {
                console.error('Vault button not found');
            }

            if (settingsButton) {
                settingsButton.addEventListener('click', () => {
                    console.log('Settings button clicked');
                    window.location.href = 'settings.html';
                });
            } else {
                console.error('Settings button not found');
            }

            if (importExportButton) {
                importExportButton.addEventListener('click', () => {
                    console.log('Import/Export button clicked');
                    window.location.href = 'importExport.html';
                });
            } else {
                console.error('Import/Export button not found');
            }

            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    console.log('Logout button clicked');
                    logout().then(() => {
                        alert('Logging out...');
                        window.location.href = 'login.html';
                    }).catch(error => {
                        console.error('Logout failed:', error);
                        alert('Logout failed. Please try again.');
                    });
                });
            } else {
                console.error('Logout button not found');
            }
        })
        .catch(error => {
            console.error('Error fetching template.html:', error);
        });
});
