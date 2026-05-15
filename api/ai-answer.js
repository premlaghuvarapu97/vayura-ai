export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { question, context } = req.body;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `You are an expert interview coach. Give a concise, confident answer to this interview question. Keep it under 100 words and make it sound natural when spoken aloud.

Question: "${question}"

${context ? `Context about candidate: ${context}` : ''}

Answer:`
                }]
            })
        });

        const data = await response.json();
        const answer = data.content?.[0]?.text || 'Sorry, I could not generate an answer.';

        return res.status(200).json({ answer });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}