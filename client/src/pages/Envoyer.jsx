import { useEffect, useState } from "react";

function Envoyer() {
  const [pseudo, setPseudo] = useState("");
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);

  useEffect(() => {
    if (!apercu) return;
    return () => URL.revokeObjectURL(apercu);
  }, [apercu]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFichier(file);
    setApercu(URL.createObjectURL(file));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("À envoyer :", pseudo.trim(), fichier);
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

        <button type="submit" disabled={!pseudo.trim() || !fichier}>
          Envoyer
        </button>
      </form>
    </main>
  );
}

export default Envoyer;
