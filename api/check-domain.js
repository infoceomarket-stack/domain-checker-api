export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Falta el dominio' });

  const key = process.env.GODADDY_KEY;
  const secret = process.env.GODADDY_SECRET;
  const tlds = ['.com', '.store', '.shop', '.co', '.net'];

  try {
    const results = await Promise.all(tlds.map(async tld => {
      const fullDomain = `${domain}${tld}`;
      const response = await fetch(
        `https://api.godaddy.com/v1/domains/available?domain=${fullDomain}&checkType=FAST`,
        {
          headers: {
            Authorization: `sso-key ${key}:${secret}`,
            Accept: 'application/json',
          }
        }
      );
      const data = await response.json();
      return { domain: fullDomain, available: data.available || false, price: data.price || null };
    }));

    return res.status(200).json({ domains: results });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
