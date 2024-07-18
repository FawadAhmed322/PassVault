export function parseCSV(csvData, source) {
    const lines = csvData.split('\n');
    const credentials = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue; // Skip if the row doesn't have the same number of columns as the header

        let credential = mapDataToPassVaultFormat(values, headers, source);
        credentials.push(credential);
    }
    return credentials;
}

export function validateHeaders(headers, source) {
    const expectedHeaders = getHeadersForSource(source);
    return expectedHeaders.every(header => headers.includes(header));
}

export function mapDataToPassVaultFormat(values, headers, source) {
    let credential = {};

    switch (source) {
        case 'PassVault':
        case 'Chrome':
            credential = {
                name: values[headers.indexOf('name')],
                url: values[headers.indexOf('url')],
                username: values[headers.indexOf('username')],
                password: values[headers.indexOf('password')],
                note: values[headers.indexOf('note')]
            };
            break;
        case 'Firefox':
        case 'Edge':
        case 'Opera':
        case 'Dashlane':
            credential = {
                name: values[headers.indexOf('name')],
                url: values[headers.indexOf('website')],
                username: values[headers.indexOf('username')],
                password: values[headers.indexOf('password')],
                note: values[headers.indexOf('note')]
            };
            break;
        default:
            throw new Error('Unknown source');
    }

    return credential;
}

export function convertToCSV(credentials, source) {
    const headers = getHeadersForSource(source);
    const csvLines = [headers.join(',')];

    credentials.forEach(credential => {
        const values = headers.map(header => credential[mapPassVaultKeyToSourceKey(header, source)] || '');
        csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
}

export function getHeadersForSource(source) {
    switch (source) {
        case 'PassVault':
        case 'Chrome':
            return ['name', 'url', 'username', 'password', 'note'];
        case 'Firefox':
        case 'Edge':
        case 'Opera':
        case 'Dashlane':
            return ['name', 'website', 'username', 'password', 'note'];
        default:
            throw new Error('Unknown source');
    }
}

export function mapPassVaultKeyToSourceKey(key, source) {
    const mapping = {
        'PassVault': { 'name': 'name', 'url': 'url', 'username': 'username', 'password': 'password', 'note': 'note' },
        'Chrome': { 'name': 'name', 'url': 'url', 'username': 'username', 'password': 'password', 'note': 'note' },
        'Firefox': { 'name': 'name', 'url': 'website', 'username': 'username', 'password': 'password', 'note': 'note' },
        'Edge': { 'name': 'name', 'url': 'website', 'username': 'username', 'password': 'password', 'note': 'note' },
        'Opera': { 'name': 'name', 'url': 'website', 'username': 'username', 'password': 'password', 'note': 'note' },
        'Dashlane': { 'name': 'name', 'url': 'website', 'username': 'username', 'password': 'password', 'note': 'note' }
    };

    return mapping[source][key];
}
