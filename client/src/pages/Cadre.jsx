import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config.js";
import "./Cadre.css";

function formaterDate(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Cadre() {
  const [photo, setPhoto] = useState(null);
  const [statut, setStatut] = useState("chargement");
  const [imageChargee, setImageChargee] = useState(false);

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

    socket.on("new-photo", (nouvellePhoto) => {
      setImageChargee(false);
      setPhoto(nouvellePhoto);
      setStatut("ok");
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="cadre">
      {statut === "chargement" && <p className="cadre-message">Chargement…</p>}

      {statut === "vide" && (
        <p className="cadre-message cadre-attente">En attente de la première photo…</p>
      )}

      {statut === "erreur" && (
        <p className="cadre-message">Impossible de joindre le serveur</p>
      )}

      {statut === "ok" && (
        <>
          <div
            className="cadre-fond"
            style={{ backgroundImage: `url(${photo.url})` }}
          />
          <img
            key={photo.id}
            className={`cadre-photo ${imageChargee ? "visible" : ""}`}
            src={photo.url}
            alt={`Photo envoyée par ${photo.pseudo}`}
            onLoad={() => setImageChargee(true)}
          />
          <div className="cadre-legende">
            <p className="cadre-pseudo">{photo.pseudo}</p>
            <p className="cadre-date">{formaterDate(photo.createdAt)}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Cadre;
