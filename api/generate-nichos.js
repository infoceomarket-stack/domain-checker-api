export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { interest } = req.body || {};
  const base = interest || 'nichos populares y rentables para print on demand';

  const prompt = `Eres un experto en print on demand (POD) con amplio conocimiento de Etsy y Shopify.
Sugiere exactamente 6 nichos rentables de POD relacionados con: "${base}".

Para cada nicho incluye:
- emoji: un emoji representativo
- name: nombre del nicho (máximo 3 palabras)
- desc: descripción corta (máximo 12 palabras)
- demanda: "Alta" | "Media" | "Muy Alta"
- competencia: "Alta" | "Media" | "Baja"
- productos: array de 4 productos POD recomendados
- razones: array de 3 razones por qué es rentable (máximo 8 palabras cada una)
- disenos: array de 6 ideas de diseños o estilos visuales específicos
- tiendas: array de 4 objetos con {plataforma: "Etsy"|"Shopify", nombre: "nombre realista de tienda", detalle: "descripción de 6 palabras"}

Responde SOLO con JSON array válido, sin texto, sin backticks:
[{"emoji":"...","name":"...","desc":"...","demanda":"...","competencia":"...","productos":[...],"razones":[...],"disenos":[...],"tiendas":[...]}]`;

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
    const raw = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const nichos = JSON.parse(raw);
    return res.status(200).json(nichos);
  } catch(e) {
    return res.status(500).json({ error: 'Error generando nichos' });
  }
}
