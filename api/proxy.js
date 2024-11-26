import fetch from 'node-fetch';  // Import node-fetch for making HTTP requests

export default async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Missing "url" parameter');
    }

    if (!url.endsWith(".m3u8")) {
        return res.status(400).send('URL must point to an m3u8 file');
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        // Fetch the M3U8 file with a timeout mechanism
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.text();  // Get the m3u8 content

        // Set CORS headers to allow any origin
        res.setHeader('Access-Control-Allow-Origin', '*');  
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');  // Set correct MIME type for M3U8
        return res.status(200).send(data);  // Send the M3U8 content in the response

    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).send('Request timed out');
        }
        return res.status(500).send(`Error fetching m3u8 file: ${error.message}`);
    }
};
