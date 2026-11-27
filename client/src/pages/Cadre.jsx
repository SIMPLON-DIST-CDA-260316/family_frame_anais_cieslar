import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config.js";
import "./Cadre.css";

// "jeudi 27 novembre"
function formaterJour(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

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

function Cadre() {
  const [photo, setPhoto] = useState(null);
  const [statut, setStatut] = useState("chargement");
  const [imageChargee, setImageChargee] = useState(false);
  const [connecte, setConnecte] = useState(false);
  const [maintenant, setMaintenant] = useState(() => Date.now());

  useEffect(() => {
    async function chargerDernierePhoto() {
      try {
        const res = await fetch(`${API_URL}/api/photos/latest`);
        if (res.status === 404) {
          setStatut("vide");
          return;
        }
        if (!res.ok) {
          throw new Error();
        }
        setPhoto(await res.json());
        setStatut("ok");
      } catch {
        setStatut("erreur");
      }
    }

    chargerDernierePhoto();
  }, []);

  useEffect(() => {
    const socket = io(API_URL || undefined);

    socket.on("connect", () => setConnecte(true));
    socket.on("disconnect", () => setConnecte(false));

    socket.on("new-photo", (nouvellePhoto) => {
      setImageChargee(false);
      setPhoto(nouvellePhoto);
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

      {statut === "ok" && (
        <>
          <div className="cadre-zone-photo">
            <img
              key={photo.id}
              className={`cadre-photo ${imageChargee ? "visible" : ""}`}
              src={photo.url}
              alt={`Photo envoyée par ${photo.pseudo}`}
              onLoad={() => setImageChargee(true)}
            />
          </div>

          <div className="cadre-legende">
            <p className="cadre-surtitre">Partagé par</p>
            <p className="cadre-pseudo">{photo.pseudo}</p>
            <p className="cadre-date">
              {formaterIlYa(photo.createdAt, maintenant)} · {formaterJour(photo.createdAt)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Cadre;
