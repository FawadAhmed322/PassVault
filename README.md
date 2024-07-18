# PassVault

PassVault is a secure and efficient password manager designed to handle various password-related tasks such as adding, deleting, and editing passwords. It also supports updating password encryption when a user changes their password and importing/exporting credentials in different formats.

## Features

- Add, delete, and edit passwords
- Update password encryption
- Import and export credentials in various formats
- User-friendly interface for managing passwords

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Environment Setup](#environment-setup)
- [Building the Extension](#building-the-extension)
- [Importing and Exporting Credentials](#importing-and-exporting-credentials)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install PassVault, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/FawadAhmed322/PassVault.git
    ```
2. Navigate to the project directory:
    ```bash
    cd PassVault
    ```
3. Install the necessary dependencies:
    ```bash
    npm install
    ```

## Usage

To start using PassVault, follow these steps:

1. Start the application:
    ```bash
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## Environment Setup

PassVault uses environment variables to configure the API URL. To set up the environment variables, follow these steps:

1. Create an `.env` file in the root of your project directory.
2. Add the following line to the `.env` file, specifying the API URL for the PassVault server (this is an example URL):
    ```env
    # The API URL for the PassVault server (example)
    API_URL=http://localhost:5000/api
    ```

## Building the Extension

To build the PassVault extension, follow these steps:

1. Run the build command:
    ```bash
    npm run build
    ```
2. Load the built files as a browser extension:
    - Open your browser's extension page.
    - Enable "Developer mode".
    - Click on "Load unpacked" and select the project directory

## Importing and Exporting Credentials

PassVault supports importing and exporting credentials in various formats. To handle different import formats from various password managers, PassVault expects data in the following structure:
- `name`: The name of the account
- `url`: The URL associated with the account
- `username`: The username for the account
- `password`: The password for the account

You can map these fields accordingly for import and export purposes.

### Importing Credentials

1. Click on the "Import" button on the dashboard.
2. Select the file format and upload your credentials file.
3. Map the fields if necessary and click "Import".

### Exporting Credentials

1. Click on the "Export" button on the dashboard.
2. Select the desired format for the exported file.
3. Download the exported file to your local system.

## Contributing

We welcome contributions from the community! To contribute to PassVault, follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
5. Open a pull request on [GitHub](https://github.com/FawadAhmed322/PassVault/pulls).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
