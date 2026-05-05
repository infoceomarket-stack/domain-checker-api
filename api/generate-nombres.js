export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { desc, lang, qty, tags } = req.body || {};
  if (!desc) return res.status(400).json({ error: 'Falta descripción' });

  const langInstr = lang === 'es' ? 'Genera todos los nombres en español.' : lang === 'en' ? 'Generate all names in English.' : 'Mix Spanish and English names creatively.';

  const prompt = `Genera exactamente ${qty || 6} nombres únicos y creativos para una tienda de e-commerce.
Descripción: "${desc}"
Estilo: ${tags || 'creativo, moderno'}
${langInstr}
Reglas: nombres originales, slug solo letras minúsculas sin espacios ni tildes, descripción máximo 7 palabras.
Responde SOLO con JSON array sin texto adicional ni backticks:
[{"name":"NombreTienda","desc":"razón breve","slug":"slug"}]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'Anthropic error', detail: data });
    const raw = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const names = JSON.parse(raw);
    return res.status(200).json(names);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
