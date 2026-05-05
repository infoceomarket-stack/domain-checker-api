export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { interest } = req.body || {};
  const base = interest || 'nichos populares para print on demand';

  const prompt = `Experto en POD. Sugiere 6 nichos para print on demand sobre: "${base}".
Responde SOLO con JSON array sin texto ni backticks:
[{"emoji":"🐶","name":"Mascotas","desc":"Diseños para amantes de perros y gatos","demanda":"Alta","competencia":"Media","productos":["Camisetas","Tazas","Stickers","Gorras"],"razones":["Comunidad muy activa","Compras emocionales","Alto volumen"],"disenos":["Retratos minimalistas","Frases divertidas","Acuarela","Comic","Tipografía","Patrones"],"tiendas":[{"plataforma":"Etsy","nombre":"PawPrintStudio","detalle":"Ilustraciones personalizadas de mascotas"},{"plataforma":"Shopify","nombre":"FureverShop","detalle":"Ropa y accesorios para dueños"},{"plataforma":"Etsy","nombre":"PetLoversArt","detalle":"Arte digital de razas populares"},{"plataforma":"Shopify","nombre":"TailWaggers","detalle":"Productos exclusivos para perros"}]}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'Anthropic error', detail: data });

    const raw = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const nichos = JSON.parse(raw);
    return res.status(200).json(nichos);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
