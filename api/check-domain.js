export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Falta el dominio' });

  const key = process.env.GODADDY_KEY;
  const secret = process.env.GODADDY_SECRET;

  const tlds = ['.com', '.store', '.shop', '.co', '.net'];
  const queries = tlds.map(tld => `${domain}${tld}`).join(',');

  const response = await fetch(
    `https://api.godaddy.com/v1/domains/available?domain=${queries}&checkType=FAST`,
    {
      headers: {
        Authorization: `sso-key ${key}:${secret}`,
        Accept: 'application/json',
      },
    }
  );

  const data = await response.json();
  return res.status(200).json(data);
}
