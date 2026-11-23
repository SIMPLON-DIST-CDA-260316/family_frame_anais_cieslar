// 1. Charger les variables de server/.env dans process.env (toujours en premier)
import "dotenv/config";
import express from "express";
import cors from "cors";

// 2. Configuration venant de l'environnement (valeur par défaut si absente)
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

// 3. Middlewares : exécutés pour chaque requête, dans l'ordre
app.use(cors({ origin: CLIENT_URL })); // seul le client Vite peut appeler l'API
app.use(express.json()); // lit les corps de requête JSON

// 4. Route de santé : permet de vérifier que le serveur répond
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// 5. Démarrage
app.listen(PORT, () => {
  console.log(`API sur http://localhost:${PORT}`);
});
