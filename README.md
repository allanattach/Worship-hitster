# Worship Hitster

En standalone webapp der simulerer Hitster med kristne sange – salmer, gospel,
CCM, lovsang, pop og rock i stedet for de klassiske Hitster-numre.

**Spil den her: <https://allanattach.github.io/Worship-hitster/>**

## Sådan spilles

Hver spiller starter med ét kort på sin tidslinje. På sin tur afspilles en
tilfældig sang (via Spotify), og spilleren skal placere den kronologisk
korrekt uden at kende titel, kunstner eller årstal. Rigtig gæt beholder
kortet, forkert gæt kasserer det. Første spiller med 10 kort i korrekt
årgangsrækkefølge vinder. Se de fulde regler i appen (spørgsmålstegn-ikonet).

## Funktioner

- Vilkårligt antal spillere (tilføj/fjern på opsætningsskærmen)
- Tydelig visning af hvis tur det er, med mulighed for at bladre frem/tilbage
  og se andre spilleres brætter uden at skifte tur
- Spillets tilstand gemmes automatisk i `localStorage`, så et spil kan
  genoptages senere
- Spotify-forbindelse (OAuth PKCE) gemmes også i `localStorage`, så login kun
  skal ske én gang
- Lys/mørkt tema og fuldskærmstilstand

## Spotify

Spilleren trykker blot **"Log ind med Spotify"** og logger på med sin egen
Spotify-konto – der er ingen opsætning, ingen Client ID at indtaste og ingen
udviklerkonto nødvendig. Forbindelsen gemmes i `localStorage`, så login kun
sker én gang.

Kun den enhed der afspiller musikken skal logge ind. De øvrige spillere kigger
med på samme skærm og behøver slet ikke Spotify.

Afspilning i browseren sker via Spotifys Web Playback SDK, som kræver
**Spotify Premium**. Uden en Spotify-forbindelse kan spillet stadig spilles –
blot uden lyd.

### For den der hoster appen

Client ID'et er bagt ind i bygget via `src/config.ts`. Det er trygt at
committe: appen bruger Authorization Code flow med **PKCE**, som er designet
til klienter uden backend. Der findes ingen client secret, og et Client ID
giver i sig selv ingen adgang til noget.

Sådan sættes det op én gang:

1. Opret en gratis app på [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Tilføj disse Redirect URIs på appen:
   - `https://allanattach.github.io/Worship-hitster/` (den deployede version)
   - `http://127.0.0.1:5173/` (lokal udvikling – Spotify accepterer ikke
     længere `localhost`, så brug `127.0.0.1` i browseren)
3. Indsæt appens Client ID i `BUILT_IN_CLIENT_ID` i `src/config.ts`, eller sæt
   repository-variablen `VITE_SPOTIFY_CLIENT_ID` i GitHub så bygget henter det
   derfra

En nyoprettet Spotify-app står i *Development mode*, hvor kun konti du selv har
tilføjet under **User Management** i dashboardet kan logge ind (op til 25).
Skal andre end dig selv kunne afspille musik, skal deres Spotify-email
tilføjes der.

Spiller man fra en fork med sin egen Spotify-app, kan man i stedet trykke
"Brug min egen Spotify-app" i opsætningsskærmen og indtaste et andet Client ID.

## Deployment

Appen deployes automatisk til GitHub Pages af
`.github/workflows/deploy.yml` ved hvert push til default-branchen. Vite er
konfigureret med `base: './'`, så bygget virker både fra en domænerod og fra
et repo-subpath.

## Udvikling

```bash
npm install
npm run dev      # start dev-server
npm run build    # typecheck + build til dist/
npm run lint     # oxlint
```

Bygget med React, TypeScript og Vite.
