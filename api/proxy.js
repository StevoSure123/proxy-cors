const fetch = require('node-fetch'); // Ensure node-fetch is installed

module.exports = async (req, res) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).end(); // No content for OPTIONS
        return;
    }

    // Only allow GET requests for the proxy
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { url } = req.query;

    if (!url) {
        res.status(400).send('Missing "url" parameter');
        return;
    }

    if (!url.includes('.m3u8')) {
        res.status(400).send('URL must point to an m3u8 file');
        return;
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        // Fetch the .m3u8 file
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            res.status(response.status).send(`Error fetching m3u8 file: ${response.statusText}`);
            return;
        }

        // Get m3u8 content
        const data = await response.text();

        // Add CORS headers and serve the file
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl'); // Ensure correct m3u8 content type
        res.status(200).send(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            res.status(504).send('Request timed out');
        } else {
            res.status(500).send(`Error fetching m3u8 file: ${error.message}`);
        }
    }
};
