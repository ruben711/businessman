# Business Management — Studieplatform

Interactief leerplatform voor Business Management 1 (VIVES, fase 1).
Next.js 14 + Tailwind + Zustand + Upstash Redis. Premium executive styling: EB Garamond + champagne goud + diep emerald.

## Setup

```bash
npm install
cp .env.example .env.local   # vul ADMIN_PASSWORD, ADMIN_SECRET, evt. Upstash/Discord
npm run dev
```

App draait op http://localhost:3000.

## Folders

- `app/` — pagina's en API-routes (alle API-routes draaien op de Edge runtime)
- `components/` — shared UI (`NavTabs`, `XpToast`, `ExerciseRunner`, `NotificationBell`, `StyledName`, `CustomTag`, `Footer`…)
- `lib/` — Zustand store, identity, theme, Upstash REST client, HMAC admin-auth, Discord logger, leaderboard sync
- `data/` — JSON content (theorie per hoofdstuk, oefeningen, casussen, glossarium)

## Content invullen

**Theorie per hoofdstuk** — maak een file `data/theorie/h{n}.json` met:
```json
{
  "chapter": 2,
  "title": "...",
  "sections": [
    { "id": "h2-x", "title": "...", "lead": "...", "paragraphs": ["..."], "list": ["..."], "subsections": [...], "callout": "..." }
  ],
  "doelstellingen": ["..."]
}
```
Markdown-achtige `**bold**` wordt automatisch gerenderd. Zie `data/theorie/h1.json` als template.

**Oefeningen** — voeg toe aan `data/oefeningen.json`. Vraagtypes: `mc`, `tf`, `open`, `cloze`, `order`, `match`, `case`. Zie types in `lib/exercises.ts`.

**Casussen** — wijs een case-type oefening toe via `data/casussen.json`.

**Glossarium** — `data/glossarium.json` (alfabetisch gegroepeerd, met filter per hoofdstuk).

## Admin

Verborgen pad `/admin`. Vereist `ADMIN_PASSWORD` + `ADMIN_SECRET` (HMAC via Web Crypto, 7d cookie TTL, 5 pogingen → 15 min lockout per IP).

Drie tabs:
- **Leaderboard** — bewerk naam/XP/solved, toggle admin (👑 badge), verwijder, recalc
- **Live sessies** — real-time event-feed per uid (laatste 30 min)
- **Meldingen** — broadcast of per-user notificatie, type info/success/warning/error

## XP & gamification

- 25 XP per **eerste correcte oplossing**
- Levels: 100 XP, factor 1.25 per niveau
- Streaks: dagelijkse activiteit
- Theorie-progress wordt apart bijgehouden (geen XP voor lezen)
- `xpRulesVersion` in store voor toekomstige migraties

## Bekend Windows-quirk

`npm run build` faalt soms op Windows in de "Collecting page data" stap (known Next.js + Windows path-casing issue). `npm run dev` werkt prima en deployment op Vercel/Linux compileert wel.
