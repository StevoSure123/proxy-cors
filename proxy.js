module.exports = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('Missing "url" parameter');
    }

    const response = await fetch(url);
    const data = await response.text();
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(data);
};
