// RechtsInfo Backend v2 – mit RAG (echte Gesetzestexte aus Supabase)

const SYSTEM_PROMPT = `Du bist "RechtsInfo", ein österreichischer Rechtsauskunft-Assistent.
Dir werden relevante Gesetzestexte als Kontext bereitgestellt – zitiere IMMER direkt daraus.

Regeln:
1. Antworte immer auf Deutsch
2. Zitiere die bereitgestellten Gesetzestexte direkt und wörtlich
3. Nenne immer Paragraph und Gesetz (z.B. **§ 879 ABGB**)
4. Erkläre was der Paragraph bedeutet in einfacher Sprache
5. Gib praktische Hinweise
6. Bei komplexen Fällen weise auf Rechtsanwalt hin
7. Übernimm keine Haftung`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'messages required' });

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const voyageKey = process.env.VOYAGE_API_KEY;

    const letzteAnfrage = messages[messages.length - 1].content;

    let relevanteGesetze = '';
    try {
      const embRes = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${voyageKey}` },
        body: JSON.stringify({ input: letzteAnfrage, model: 'voyage-3' })
      });
      const embData = await embRes.json();
      const embedding = embData.data[0].embedding;

      const searchRes = await fetch(`${supabaseUrl}/rest/v1/rpc/suche_gesetze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ anfrage_embedding: embedding, treffer_limit: 4 })
      });
      const treffer = await searchRes.json();

      if (treffer?.length) {
        relevanteGesetze = '\n\n--- RELEVANTE GESETZESTEXTE ---\n' +
          treffer.map(t =>
            `${t.gesetz} ${t.paragraph} – ${t.titel}:\n"${t.inhalt}"\nQuelle: ${t.url}`
          ).join('\n\n');
      }
    } catch(e) {
      console.log('RAG Fehler (weiter ohne):', e.message);
    }

    const augmentedMessages = [...messages];
    if (relevanteGesetze) {
      augmentedMessages[augmentedMessages.length - 1] = {
        role: 'user',
        content: letzteAnfrage + relevanteGesetze
      };
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: augmentedMessages.slice(-10)
      })
    });

    const data = await claudeRes.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const answer = data.content.map(b => b.text || '').join('');
    res.status(200).json({ answer });

  } catch(error) {
    console.error('Fehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
