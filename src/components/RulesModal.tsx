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
            <li>Bekræft placeringen – kortet vendes, og du ser om du gættede rigtigt.</li>
            <li>Gættede du rigtigt, bliver kortet på dit bræt. Gættede du forkert, kasseres kortet.</li>
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
