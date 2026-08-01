# Worship Hitster

En standalone webapp der simulerer Hitster med kristne sange – salmer, gospel,
CCM, lovsang, pop og rock i stedet for de klassiske Hitster-numre.

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

## Spotify-opsætning

Spillet afspiller sange via Spotifys Web Playback SDK, hvilket kræver en
Spotify Premium-konto samt din egen Spotify-app:

1. Opret en gratis app på [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Tilføj den Redirect URI som vises i appens opsætningsskærm (typisk
   `http://localhost:5173/` i udvikling, eller din deploy-URL i produktion)
3. Indsæt appens Client ID i "Forbind til Spotify"-feltet i spillet

Uden en Spotify-forbindelse kan spillet stadig spilles – blot uden lyd.

## Udvikling

```bash
npm install
npm run dev      # start dev-server
npm run build    # typecheck + build til dist/
npm run lint     # oxlint
```

Bygget med React, TypeScript og Vite.
