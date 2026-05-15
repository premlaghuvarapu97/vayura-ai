export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question } = req.body;

        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `You are an expert interview coach. Give a concise, confident answer to this interview question. Keep it under 100 words and make it sound natural when spoken aloud.

Question: "${question}"

Answer naturally as if you were the candidate. Start directly with the answer.`
                }]
            })
        });

        const data = await response.json();
        console.log('Claude response:', JSON.stringify(data));

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const answer = data.content?.[0]?.text || 'No answer generated';
        return res.status(200).json({ answer });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
