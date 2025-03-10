export default async function handler(req, res) {
  const { input, scanType } = req.query;
  
  if (!input || !scanType) {
    return res.status(400).json({ error: 'Missing input or scanType' });
  }

  let endpoint = '';
  if (scanType === 'file') {
    endpoint = `https://www.virustotal.com/api/v3/files/${input}`;
  } else if (scanType === 'url') {
    const urlId = Buffer.from(input).toString('base64url');
    endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
  } else if (scanType === 'domain') {
    endpoint = `https://www.virustotal.com/api/v3/domains/${input}`;
  } else {
    return res.status(400).json({ error: 'Invalid scan type' });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-apikey': process.env.VIRUSTOTAL_API_KEY,  // Odczytaj klucz API ze zmiennej środowiskowej
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Error: ${response.statusText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data from VirusTotal' });
  }
}
