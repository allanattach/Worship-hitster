interface RulesModalProps {
  onClose: () => void
}

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>Sådan spiller du</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Luk regler">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>
            Worship Hitster spilles ligesom det klassiske musikgætte-spil, men med kristne sange – salmer,
            gospel, lovsang, CCM, pop og rock.
          </p>
          <ol>
            <li>Hver spiller starter med ét kort på sit bræt.</li>
            <li>Når det er din tur, trykker du &quot;Afspil sang&quot; – en tilfældig sang starter i baggrunden via Spotify.</li>
            <li>
              Uden at kende titel, kunstner eller årstal skal du placere sangen på din tidslinje, dér hvor du tror den
              hører til kronologisk i forhold til dine andre kort.
            </li>
            <li>
              Kortet lægges med <strong>bagsiden op</strong> på pladsen. Ingen har endnu set årstallet.
            </li>
            <li>
              Nu kan de andre <strong>byde ind</strong>: den der tror at vide hvornår sangen er fra, betaler én brik
              og placerer kortet på sin egen tidslinje – også med bagsiden op. Buddet er altså et blindt gæt, præcis
              som for spilleren i tur. Flere kan byde ind i samme runde.
            </li>
            <li>
              Når alle har budt, trykkes <strong>Vend kortet</strong>. Først da afsløres årstal, titel og kunstner, og
              alle placeringer afgøres på én gang.
            </li>
            <li>
              Ramte spilleren i tur rigtigt, beholder de kortet. Ramte de forkert, vinder det første rigtige bud
              kortet. Et forkert bud koster brikken. Vandt ingen kortet, kasseres det.
            </li>
            <li>Turen går videre til næste spiller.</li>
            <li>
              Kan sangen ikke afspilles – eller findes den ikke på Spotify – så tryk <strong>Nyt kort</strong>. Du
              får en ny sang uden at miste turen, og det tælles ikke som en fejl.
            </li>
            <li>Du kan til enhver tid kigge på de andre spilleres brætter med pilene – det skifter ikke tur.</li>
            <li>
              Med <strong>−</strong>, <strong>+</strong> og <strong>Tilpasset</strong> over brættet kan du zoome.
              &quot;Tilpasset&quot; skalerer kortene, så hele rækken kan ses på én gang.
            </li>
            <li>Den første spiller med 10 kort i korrekt årgangsrækkefølge på sit bræt vinder!</li>
          </ol>
          <h3 className="rules-subheading">Brikker</h3>
          <p>
            Alle starter med <strong>2 brikker</strong>. Du tjener en ny ved – ud over årstallet – også at kunne
            sige <strong>titel og kunstner</strong>: tryk på brik-knappen når kortet er vendt, så tæller den med.
            Spillet kan ikke høre hvad I siger, så I holder hinanden i ørerne som ved et almindeligt brætspil.
          </p>
          <p>Brikker bruges til at byde ind på et kort som en anden har placeret forkert.</p>
          <h3 className="rules-subheading">Fortryd</h3>
          <p>
            Trykkede du forkert? Brug <strong>↶</strong> øverst til at fortryde. Den går flere trin tilbage, så også
            en placering et par ture tilbage kan rulles tilbage. Fortryd gælder den igangværende session – lukker du
            appen, gemmes spillet som det står.
          </p>
          <p>
            Spillets fremgang gemmes automatisk, så du roligt kan lukke appen og fortsætte senere. Kun den enhed
            der afspiller musikken skal logge ind med Spotify, og forbindelsen huskes, så det kun skal gøres én
            gang.
          </p>
        </div>
      </div>
    </div>
  )
}
