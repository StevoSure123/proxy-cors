module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).end(); // No Content for OPTIONS requests
        return;
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).send('Missing "url" parameter');
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(response.status).send(`Error fetching URL: ${response.statusText}`);
        }

        const data = await response.text();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.status(200).send(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).send('Request timed out');
        }
        res.status(500).send(`Error fetching URL: ${error.message}`);
    }
};
