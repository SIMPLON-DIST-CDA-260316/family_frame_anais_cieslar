import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config.js";
import {
  IconeChanger,
  IconeCoche,
  IconeFleche,
  IconeImage,
} from "../components/Icones.jsx";
import "./Envoyer.css";

function Envoyer() {
  const [pseudo, setPseudo] = useState("");
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    if (!apercu) return;
    return () => URL.revokeObjectURL(apercu);
  }, [apercu]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFichier(file);
    setApercu(URL.createObjectURL(file));
    setErreur(null);
    // Vide l'input : permet de re-choisir la même photo plus tard
    e.target.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("pseudo", pseudo.trim());
    formData.append("photo", fichier);

    setEnvoiEnCours(true);
    setErreur(null);

    try {
      const res = await fetch(`${API_URL}/api/photos`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }
      setEnvoye(true);
    } catch (err) {
      setErreur(`Erreur : ${err.message}`);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  // Repart sur un formulaire vide (on garde le pseudo, plus pratique)
  function recommencer() {
    setFichier(null);
    setApercu(null);
    setEnvoye(false);
  }

  if (envoye) {
    return (
      <main className="page-envoyer confirmation">
        <div className="polaroid">
          <img className="polaroid-photo" src={apercu} alt="Photo envoyée" />
          <span className="polaroid-coche">
            <IconeCoche taille={26} />
          </span>
        </div>

        <div className="intro">
          <h1>C'est sur le cadre !</h1>
          <p>Merci {pseudo.trim()}, ta photo vient de s'afficher chez la famille.</p>
        </div>

        <div className="actions">
          <button type="button" className="bouton-principal" onClick={recommencer}>
            Envoyer une autre photo
          </button>
          <Link to="/cadre" className="bouton-secondaire">
            Voir le cadre
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-envoyer">
      <div className="intro">
        <h1>Partager un moment</h1>
        <p>Ta photo apparaîtra tout de suite sur le cadre de la famille.</p>
      </div>

      <form className="formulaire" onSubmit={handleSubmit}>
        <div className="champ">
          <label htmlFor="pseudo">Ton prénom ou pseudo</label>
          <input
            id="pseudo"
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={30}
            required
          />
        </div>

        <div className="champ">
          <span className="champ-titre">Photo</span>

          {/* Input caché, sans "capture" : sur mobile, le téléphone propose
              de prendre une photo OU d'en choisir une dans la galerie.
              Les <label htmlFor="photo"> l'ouvrent au clic. */}
          <input
            id="photo"
            className="visuellement-cache"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="zone-photo">
            {apercu ? (
              <div className="apercu-conteneur">
                <img className="apercu" src={apercu} alt="Aperçu de la photo choisie" />
                <label htmlFor="photo" className="bouton-changer">
                  <IconeChanger taille={16} />
                  Changer
                </label>
              </div>
            ) : (
              <label htmlFor="photo" className="zone-vide">
                <IconeImage taille={40} />
                <span>Ajouter une photo</span>
              </label>
            )}
          </div>
        </div>

        {erreur && (
          <p className="erreur" role="alert">
            {erreur}
          </p>
        )}

        <button
          type="submit"
          className="bouton-principal"
          disabled={!pseudo.trim() || !fichier || envoiEnCours}
        >
          {envoiEnCours ? "Envoi…" : "Envoyer au cadre"}
          {!envoiEnCours && <IconeFleche />}
        </button>
      </form>
    </main>
  );
}

export default Envoyer;
