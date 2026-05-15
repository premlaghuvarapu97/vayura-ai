export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64 } = req.body;

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
                max_tokens: 2048,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/png',
                                data: imageBase64
                            }
                        },
                        {
                            type: 'text',
                            text: `Analyze this coding interview question screenshot. Provide:

1. **Problem Summary** (2-3 lines)
2. **Solution Approach** (brief explanation)
3. **Complete Code Solution** (in Python by default, or the language shown in the image)
4. **Time Complexity**
5. **Space Complexity**

Make the code clean, well-commented, and production-ready. Format the response in clear sections with markdown.`
                        }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const solution = data.content?.[0]?.text || 'No solution generated';
        return res.status(200).json({ solution });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
