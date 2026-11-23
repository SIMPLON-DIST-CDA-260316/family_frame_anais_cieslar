import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

function Envoyer() {
  const [pseudo, setPseudo] = useState("");
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!apercu) return;
    return () => URL.revokeObjectURL(apercu);
  }, [apercu]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFichier(file);
    setApercu(URL.createObjectURL(file));
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("pseudo", pseudo.trim());
    formData.append("photo", fichier);

    setEnvoiEnCours(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/photos`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }
      setMessage("Photo envoyée !");
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <main>
      <h1>Envoyer une photo</h1>

      <form className="formulaire" onSubmit={handleSubmit}>
        <label>
          Pseudo
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={30}
            required
          />
        </label>

        <label>
          Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </label>

        {apercu && <img className="apercu" src={apercu} alt="Aperçu" />}

        <button type="submit" disabled={!pseudo.trim() || !fichier || envoiEnCours}>
          {envoiEnCours ? "Envoi…" : "Envoyer"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}

export default Envoyer;
