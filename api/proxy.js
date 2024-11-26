module.exports = async (req, res) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).end(); // No content for OPTIONS
        return;
    }

    // Restrict to GET requests
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed'); // 405 for unsupported methods
        return;
    }

    const { url } = req.query;

    // Validate the URL parameter
    if (!url) {
        res.status(400).send('Missing "url" parameter');
        return;
    }
    if (!url.endsWith('.m3u8')) {
        res.status(400).send('URL must point to an m3u8 file');
        return;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            res.status(response.status).send(`Error fetching m3u8 file: ${response.statusText}`);
            return;
        }

        // Get the m3u8 file content
        const data = await response.text();

        // Set headers for CORS and content type
        res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl'); // m3u8 content type
        res.status(200).send(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            res.status(504).send('Request timed out'); // Timeout error
        } else {
            res.status(500).send(`Error fetching m3u8 file: ${error.message}`); // Generic error
        }
    }
};
