// RechtsInfo Backend – /api/ask
// Läuft auf Vercel (Serverless Function) oder als Express-Route

const SYSTEM_PROMPT = `Du bist "RechtsInfo", ein österreichischer Rechtsauskunft-Assistent.
Du hilfst Nutzern dabei, österreichische Gesetze zu verstehen.

Deine Kernkompetenz:
- ABGB (Allgemeines Bürgerliches Gesetzbuch)
- StGB (Strafgesetzbuch)
- ArbeitnehmerInnenschutzgesetz (ASchG)
- Mietrechtsgesetz (MRG)
- KSchG (Konsumentenschutzgesetz)
- ASVG (Allgemeines Sozialversicherungsgesetz)
- WEG (Wohnungseigentumsgesetz)
- UGB (Unternehmensgesetzbuch)
- ZPO (Zivilprozessordnung)
- AVG (Allgemeines Verwaltungsverfahrensgesetz)
- AngG (Angestelltengesetz)
- GmbHG

Regeln:
1. Antworte immer auf Deutsch
2. Nenne immer relevante Paragraphen (z.B. § 1295 ABGB)
3. Erkläre Gesetze in verständlicher, klarer Sprache
4. Gib praktische Hinweise
5. Bei komplexen Fällen weise auf Rechtsanwalt oder Rechtsanwaltskammer hin
6. Formatiere Gesetze fett: **§ Nummer Gesetz**
7. Sei präzise aber zugänglich – kein unnötiges Juristendeutsch
8. Übernimm keine Haftung und stelle keine verbindlichen Rechtsauskünfte aus`;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10) // max 10 messages for context
      })
    });

    const data = await response.json();

    if (data.error) return res.status(500).json({ error: data.error.message });

    const answer = data.content.map(b => b.text || '').join('');
    res.status(200).json({ answer });

  } catch (error) {
    console.error('RechtsInfo API error:', error);
    res.status(500).json({ error: 'Interner Serverfehler. Bitte versuche es erneut.' });
  }
}
