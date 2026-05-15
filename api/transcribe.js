export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const audioData = req.body.audio;

        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
                'Content-Type': 'audio/webm'
            },
            body: Buffer.from(audioData, 'base64')
        });

        const data = await response.json();
        const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';

        return res.status(200).json({ transcript });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}