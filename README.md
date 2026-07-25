# Gestion de caisse

Application fullstack de gestion de caisse : React (front), Node/Express (back), PostgreSQL via Prisma, et un bot WhatsApp pour l'envoi automatique des recettes journalières.

## Structure

- `server/` — API Express + Prisma + PostgreSQL
- `client/` — Application React (Vite)

## Démarrage — Backend

```bash
cd server
npm install
cp .env.example .env   # puis renseigner DATABASE_URL et JWT_SECRET
npx prisma migrate dev
npm run dev
```

API disponible sur `http://localhost:4000`.

## Démarrage — Frontend

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL doit pointer vers l'API
npm run dev
```

Application disponible sur `http://localhost:5173`.

## Bot WhatsApp (recettes journalières)

Le bot utilise [whatsapp-web.js](https://wwebjs.dev/) (connexion via QR code, comme WhatsApp Web).

1. Dans `server/.env`, mettre `ENABLE_WHATSAPP=true`
2. Renseigner `WHATSAPP_TARGET` :
   - Chat individuel : `<indicatif><numero>@c.us` (ex: `22890000000@c.us`)
   - Groupe : `<id-du-groupe>@g.us`
3. Régler `WHATSAPP_SEND_TIME` (heure locale, format `HH:mm`, défaut `20:00`)
4. Lancer `npm run dev` dans `server/` : un QR code s'affiche dans le terminal, à scanner avec WhatsApp (Appareils liés)
5. Une fois connecté, le rapport du jour est envoyé automatiquement chaque jour à l'heure définie

Pour tester sans attendre l'heure planifiée (compte ADMIN requis) :

```bash
curl -X POST http://localhost:4000/api/whatsapp/send-daily-report \
  -H "Authorization: Bearer <token_admin>"
```

## Rôles

- `ADMIN` : gère les produits, consulte les rapports, peut déclencher l'envoi WhatsApp
- `CASHIER` : enregistre les ventes, consulte les rapports

## Tests

### Backend

Les tests tournent sur une base PostgreSQL dédiée (jamais la base de dev), vidée avant chaque test.

```bash
cd server
cp .env.test.example .env.test   # renseigner DATABASE_URL (créer la base au préalable, ex: gestion_caisse_test)
npm test
```

Le script `pretest` applique automatiquement les migrations Prisma sur la base de test.

### Frontend

```bash
cd client
npm test
```
