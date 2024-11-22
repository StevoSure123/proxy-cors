module.exports = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('Missing "url" parameter');
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        const data = await response.text();
        res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(`Error fetching URL: ${error.message}`);
    }
};
