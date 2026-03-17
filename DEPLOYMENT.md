# 🚀 RechtsInfo – Deployment Anleitung

## Was du brauchst
- GitHub Account (kostenlos): github.com
- Vercel Account (kostenlos): vercel.com
- Claude API Key: console.anthropic.com
- Domain (z.B. rechtsinfo.at): ca. 15€/Jahr bei world4you.at oder domaintechnik.at

---

## Schritt 1: GitHub Repository erstellen

1. Geh auf github.com → "New repository"
2. Name: `rechtsinfo`
3. Lade alle Dateien aus diesem Ordner hoch:
   - `frontend/index.html`
   - `backend/api/ask.js`
   - `vercel.json`

---

## Schritt 2: Vercel einrichten

1. Geh auf vercel.com → "Add New Project"
2. Verbinde dein GitHub-Konto
3. Wähle dein `rechtsinfo` Repository
4. Klicke "Deploy"

---

## Schritt 3: API Key hinzufügen (WICHTIG!)

1. In Vercel: Dein Projekt → "Settings" → "Environment Variables"
2. Füge hinzu:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** dein API Key von console.anthropic.com
3. Klicke "Save"
4. Geh zu "Deployments" → "Redeploy"

---

## Schritt 4: Domain verknüpfen

1. Kaufe deine Domain (z.B. rechtsinfo.at) bei world4you.at
2. In Vercel: Projekt → "Settings" → "Domains"
3. Füge deine Domain ein (z.B. `rechtsinfo.at`)
4. Vercel zeigt dir DNS-Einträge → diese trägst du bei world4you ein:
   - Typ: `A` → IP-Adresse von Vercel
   - Typ: `CNAME` → `cname.vercel-dns.com`
5. Nach 1–24 Stunden ist deine Seite live!

---

## Kosten Übersicht

| Dienst | Kosten |
|--------|--------|
| GitHub | Kostenlos |
| Vercel Hosting | Kostenlos (bis 100GB/Monat) |
| Claude API | ~$0.003 pro Anfrage (sehr günstig) |
| Domain (.at) | ~15€/Jahr |

Bei 1.000 Anfragen/Monat: ca. 3€ API-Kosten.

---

## Impressum & Datenschutz

⚠️ Da du eine österreichische Website betreibst, brauchst du:
- `impressum.html` – Name, Adresse, E-Mail (Pflicht laut ECG)
- `datenschutz.html` – DSGVO-konforme Datenschutzerklärung

Vorlage: https://www.wko.at/service/wirtschaftsrecht-gewerberecht/muster-datenschutzerklaerung.html

---

## Fertig! 🎉

Deine Seite ist unter deiner Domain erreichbar.
Alle Nutzer können jetzt Rechtsfragen stellen – ohne API Key eingeben zu müssen.
