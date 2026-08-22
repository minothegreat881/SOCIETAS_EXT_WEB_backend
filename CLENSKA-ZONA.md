# Členská zóna — ako to funguje

Registrácia členov, profily, potvrdzovanie účasti na tréningoch, spoločné
hlasovania, nástenka a upozornenia (web push + e-mail).

Frontend žije v `v0-s-c-e-a-r-website-design` pod `/clenska-zona`.

## Cesta nového člena

1. **Registrácia** na `/registracia` → Strapi založí účet v role `member`,
   `confirmed = false`, `approved = false`.
2. **Overenie e-mailu** — príde odkaz, po kliknutí sa vracia na
   `/prihlasenie?potvrdene=1`. Bez overenia prihlásenie neprejde.
3. **Schválenie vedením** — účet je vidieť v `/clenska-zona/sprava`.
   Do schválenia člen vidí len svoj profil a stránku s vysvetlením.
4. Po schválení mu príde notifikácia a členská zóna sa otvorí.

Dvojitá brána je zámer: overenie e-mailu bráni cudzím adresám, schválenie
bráni tomu, aby sa do internej zóny dostal ktokoľvek z internetu.

## Role

| Rola | `type` | Čo smie |
|---|---|---|
| Člen | `member` | celá členská zóna po schválení |
| Vedenie | `authenticated` | navyše schvaľovanie členov |

Vedenie sa nastavuje v admine: **Settings → Users & Permissions → Users →**
zmeniť rolu na *Vedenie*. Nová registrácia dostáva vždy rolu *Člen*.

## Kde čo je

```
src/api/member/            všetky /member/* koncové body a strážca schválenia
src/api/attendance/        potvrdenia účasti (going | maybe | not_going)
src/api/poll/, poll-vote/  hlasovania a hlasy
src/api/announcement/      nástenka
src/api/notification/      notifikácie + services/notify.ts (jediný lievik)
src/api/push-subscription/ odbery web push
src/bootstrap-members.ts   role, oprávnenia, e-mailové vzory — idempotentné
config/cron-tasks.ts       pripomienka hodinu pred aktivitou, blížiaca sa uzávierka
src/middlewares/auth-errors.ts  slovenské hlášky namiesto holého 500
```

`notify.ts` je jediné miesto, kadiaľ chodia upozornenia. Drží tri pravidlá:
nikdy neupozorní toho, kto akciu vyvolal; rešpektuje nastavenia člena
(okrem systémových a schválenia účtu); push a e-mail sú „bezpečné" — keď
zlyhajú, len sa zapíšu do logu a notifikácia v aplikácii ostáva.

## Premenné prostredia

```bash
FRONTEND_URL=https://www.scear.sk   # odkazy v e-mailoch
EMAIL_FROM=scear@scear.sk

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587                        # 465 hosting blokuje, spojenie visí a padne
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...

VAPID_PUBLIC_KEY=...                 # rovnaký ako NEXT_PUBLIC_VAPID_PUBLIC_KEY vpredu
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:scear@scear.sk
```

Bez `SMTP_USER` sa e-maily neodosielajú, iba zahodia (`jsonTransport`) —
lokálny vývoj tak nepadá na odosielaní overovacieho e-mailu.

Nový pár VAPID kľúčov: `npx web-push generate-vapid-keys`. Pri zmene
prestanú platiť všetky existujúce odbery a členovia si musia push zapnúť znova.

## Na čo si dať pozor

**Dátumy sa ukladajú ako epoch v milisekundách.** Ručne vložený reťazec
(`'2026-08-22 19:31:06'`) SQLite prijme, čítanie ho ešte prežije, ale
porovnanie v `$lte` / `$gte` zlyhá — cron potom nenájde nič.

**Typy s konceptom a publikovaním** (aktivity, hlasovania, oznamy) sa musia
čítať cez `strapi.db.query(...)` s `publishedAt: { $notNull: true }`.
`entityService` na nich vracia koncepty, takže členom nezobrazí nič — a pri
`populate` siahne na neexistujúci koncept a vzťah ticho vypadne.

**Zmeny v `config/plugins.ts` potrebujú úplný reštart**, nie iba prekompilovanie
watcherom. To isté platí pre e-mailové vzory v bootstrape.

**Registrácia berie len povolené polia.** Zoznam je v `config/plugins.ts` pod
`users-permissions.register.allowedFields`. Čo tam nie je, Strapi odmietne
celé — vrátane `displayName`, `phone` a `unitPosition`.

## Kontrola po nasadení

```bash
# registrácia prejde aj s profilovými údajmi
curl -X POST $API/api/auth/local/register -H 'Content-Type: application/json' \
  -d '{"username":"a@b.sk","email":"a@b.sk","password":"Heslo1234","displayName":"Test","unitPosition":"novacik"}'

# neoverený účet dostane zrozumiteľnú hlášku, nie 500
curl -X POST $API/api/auth/local -H 'Content-Type: application/json' \
  -d '{"identifier":"a@b.sk","password":"Heslo1234"}'
```

V logu má pri štarte byť `[members] členský systém pripravený`. Riadky
o dopĺňaní oprávnení sa objavia len pri prvom spustení — ak sa opakujú pri
každom reštarte, niečo oprávnenia maže.

## Stav nasadenia (22. 8. 2026)

Beží na `api.scear.sk` (DigitalOcean, PM2 proces `strapi-backend`,
`/var/www/scear-backend`, SQLite). Frontend je na Verceli.

**Nasadenie zmeny:**
```bash
ssh root@134.209.232.174
cd /var/www/scear-backend
git pull
NODE_OPTIONS="--max-old-space-size=1800" npm run build   # bez toho build padne na pamäť
pm2 restart strapi-backend --update-env
```

**Prvé vedenie:** zaregistrovať sa na `www.scear.sk/registracia`, potom
v `api.scear.sk/admin` → Content Manager → User → zmeniť rolu na *Vedenie*
a zaškrtnúť `approved`. Bez toho nemá kto schvaľovať ostatných.

### Čo zatiaľ nefunguje

**Odchádzajúca pošta.** DigitalOcean blokuje SMTP na všetkých portoch
(587, 465, 25, 2525 — overené), 443 prechádza. Preto beží
`EMAIL_CONFIRMATION=false`: registrácia je okamžitá a prístup stráži už len
schválenie vedením. Nechodia ani e-mailové upozornenia — notifikácie sú
zatiaľ len v zvončeku v zóne.

Dve cesty von: požiadať podporu DigitalOcean o odblokovanie SMTP, alebo
prejsť na poskytovateľa cez HTTPS (Resend, Brevo, SendGrid). Pri druhej
možnosti stačí vymeniť providera v `config/plugins.ts` a doplniť kľúč.
Po sprevádzkovaní pošty zmazať `EMAIL_CONFIRMATION=false` z `.env`.

**Web push.** Backend je pripravený, na Verceli však chýba premenná
`NEXT_PUBLIC_VAPID_PUBLIC_KEY` — bez nej sa ponuka na zapnutie upozornení
vôbec nezobrazí. Hodnota je v `.env` na serveri ako `VAPID_PUBLIC_KEY`.
