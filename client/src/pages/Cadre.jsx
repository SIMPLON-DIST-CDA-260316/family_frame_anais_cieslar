import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config.js";
import { calculerMosaique } from "../utils/mosaique.js";
import "./Cadre.css";

const NOMBRE_MAX = 6;

// "à l'instant", "il y a 5 minutes", "il y a 2 heures", "hier"…
const formatRelatif = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

function formaterIlYa(iso, maintenant) {
  const minutes = Math.round((new Date(iso) - maintenant) / 60000);
  if (minutes > -1) return "à l'instant";
  if (minutes > -60) return formatRelatif.format(minutes, "minute");

  const heures = Math.round(minutes / 60);
  if (heures > -24) return formatRelatif.format(heures, "hour");

  return formatRelatif.format(Math.round(heures / 24), "day");
}

// Taille de la fenêtre, mise à jour quand on la redimensionne
function useTailleFenetre() {
  const [taille, setTaille] = useState({
    largeur: window.innerWidth,
    hauteur: window.innerHeight,
  });

  useEffect(() => {
    function mettreAJour() {
      setTaille({ largeur: window.innerWidth, hauteur: window.innerHeight });
    }
    window.addEventListener("resize", mettreAJour);
    return () => window.removeEventListener("resize", mettreAJour);
  }, []);

  return taille;
}

function Cadre() {
  const [photos, setPhotos] = useState([]);
  const [statut, setStatut] = useState("chargement");
  const [connecte, setConnecte] = useState(false);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const { largeur, hauteur } = useTailleFenetre();

  useEffect(() => {
    async function chargerPhotosRecentes() {
      try {
        const res = await fetch(`${API_URL}/api/photos/recent`);
        if (!res.ok) {
          throw new Error();
        }
        const liste = await res.json();
        setPhotos(liste);
        setStatut(liste.length > 0 ? "ok" : "vide");
      } catch {
        setStatut("erreur");
      }
    }

    chargerPhotosRecentes();
  }, []);

  useEffect(() => {
    const socket = io(API_URL || undefined);

    socket.on("connect", () => setConnecte(true));
    socket.on("disconnect", () => setConnecte(false));

    socket.on("new-photo", (nouvellePhoto) => {
      // La nouvelle en premier, et on ne garde que les 6 plus récentes
      setPhotos((anciennes) => [nouvellePhoto, ...anciennes].slice(0, NOMBRE_MAX));
      setStatut("ok");
      setMaintenant(Date.now());
    });

    return () => socket.disconnect();
  }, []);

  // Met à jour "il y a X minutes" toutes les minutes
  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(Date.now()), 60000);
    return () => clearInterval(minuteur);
  }, []);

  // Espace disponible : l'écran moins les marges noires
  const marge = Math.round(Math.min(48, Math.max(16, Math.min(largeur, hauteur) * 0.06)));
  const margeHaut = Math.max(marge, 40); // place pour "En direct"

  // Recalculée seulement quand les photos ou la taille de l'écran changent
  const positions = useMemo(
    () =>
      calculerMosaique(photos, {
        x: marge,
        y: margeHaut,
        largeur: largeur - 2 * marge,
        hauteur: hauteur - margeHaut - marge,
      }),
    [photos, largeur, hauteur, marge, margeHaut],
  );

  // Pseudo plus gros quand il y a peu de photos
  const taillePseudo = photos.length === 1 ? "large" : photos.length <= 3 ? "moyen" : "petit";

  return (
    <div className="cadre">
      {connecte && (
        <p className="cadre-direct">
          <span className="cadre-direct-point" aria-hidden="true" />
          En direct
        </p>
      )}

      {statut === "chargement" && <p className="cadre-message">Chargement…</p>}

      {statut === "vide" && (
        <p className="cadre-message cadre-attente">En attente de la première photo…</p>
      )}

      {statut === "erreur" && (
        <p className="cadre-message">Impossible de joindre le serveur</p>
      )}

      {statut === "ok" &&
        positions.map(({ photo, x, y, w, h }) => (
          <figure
            key={photo.id}
            className="cadre-photo"
            style={{ left: x, top: y, width: w, height: h }}
          >
            <img src={photo.url} alt={`Photo envoyée par ${photo.pseudo}`} />
            <figcaption className={`cadre-etiquette ${taillePseudo}`}>
              <span className="cadre-pseudo">{photo.pseudo}</span>
              <span className="cadre-date">{formaterIlYa(photo.createdAt, maintenant)}</span>
            </figcaption>
          </figure>
        ))}
    </div>
  );
}

export default Cadre;
