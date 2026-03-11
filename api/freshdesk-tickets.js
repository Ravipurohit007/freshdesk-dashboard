export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { apiKey } = req.query;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  try {
    const auth = Buffer.from(`${apiKey}:x`).toString('base64');

    const response = await fetch(
      'https://tatvacare-help.freshdesk.com/api/v2/tickets?status=2,3,4,5&per_page=100',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Freshdesk API Error: ${response.status}` 
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
