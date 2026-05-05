export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { interest } = req.body || {};
  const base = interest || 'nichos populares y rentables para print on demand';

  const prompt = `Eres un experto en print on demand (POD). Sugiere exactamente 6 nichos rentables de POD relacionados con: "${base}". Responde SOLO con JSON array sin texto adicional ni backticks: [{"emoji":"...","name":"...","desc":"...","demanda":"Alta","competencia":"Media","productos":["p1","p2","p3","p4"],"razones":["r1","r2","r3"],"disenos":["d1","d2","d3","d4","d5","d6"],"tiendas":[{"plataforma":"Etsy","nombre":"Tienda1","detalle":"detalle breve"},{"plataforma":"Shopify","nombre":"Tienda2","detalle":"detalle breve"},{"plataforma":"Etsy","nombre":"Tienda3","detalle":"detalle breve"},{"plataforma":"Shopify","nombre":"Tienda4","detalle":"detalle breve"}]}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Anthropic error', detail: data });
    }

    const raw = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const nichos = JSON.parse(raw);
    return res.status(200).json(nichos);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
