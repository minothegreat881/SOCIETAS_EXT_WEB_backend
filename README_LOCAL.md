# SCEAR Backend - Lokálna verzia z Digital Ocean

## Umiestnenie
Backend je v priečinku: `C:\Users\milan\Desktop\Git-Projects\scear-backend-local`

## Ako spustiť backend lokálne

### 1. Otvor terminál/cmd a naviguj do priečinka:
```bash
cd C:\Users\milan\Desktop\Git-Projects\scear-backend-local
```

### 2. Spusti Strapi:
```bash
node node_modules/@strapi/strapi/bin/strapi.js start
```

### Alternatívne možnosti spustenia:
```bash
# Ak funguje npm scripts:
npm run start

# Alebo s develop módom pre hot-reload:
node node_modules/@strapi/strapi/bin/strapi.js develop
```

## Dôležité informácie

- **Port**: 1341 (http://localhost:1341)
- **Admin panel**: http://localhost:1341/admin
- **Database**: SQLite v `.tmp/data.db`
- **Verzia**: Stiahnuté z Digital Ocean 26.9.2025

## Riešenie problémov

### Ak sa zobrazí chyba s modulmi:
```bash
# Rebuild native moduly pre Windows
npm rebuild better-sqlite3
npm rebuild sharp
```

### Ak chýbajú node_modules:
```bash
npm install
```

## Frontend konfigurácia

Frontend musí mať v `.env.local`:
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1341
```

## API Endpoints

- `/api/history-articles` - History články
- `/api/raw-upload` - Upload obrázkov (bez auth)
- `/api/gallery-photos` - Galéria
- `/api/events` - Udalosti
- `/api/activities` - Aktivity

## Poznámky

- Backend bol vytiahnutý z monorepo štruktúry kvôli konfliktom dependencies
- Obsahuje aktuálnu produkčnú databázu a konfiguráciu z Digital Ocean
- Sharp a better-sqlite3 boli rebuild pre Windows