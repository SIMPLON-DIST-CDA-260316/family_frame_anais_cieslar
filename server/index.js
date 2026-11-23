import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const TAILLE_MAX = 10 * 1024 * 1024;
const PSEUDO_MAX = 30;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAILLE_MAX },
  fileFilter: (req, file, cb) => {
    if (TYPES_ACCEPTES.includes(file.mimetype)) {
      return cb(null, true);
    }
    const err = new Error("Type de fichier non accepté");
    err.status = 415;
    cb(err);
  },
});

const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/photos", upload.single("photo"), (req, res) => {
  const pseudo = req.body?.pseudo?.trim();

  if (!pseudo) {
    return res.status(400).json({ error: "Pseudo manquant" });
  }
  if (pseudo.length > PSEUDO_MAX) {
    return res.status(400).json({ error: `Pseudo trop long (${PSEUDO_MAX} caractères max)` });
  }
  if (!req.file) {
    return res.status(400).json({ error: "Photo manquante" });
  }

  console.log(`Photo reçue de ${pseudo} : ${req.file.mimetype}, ${req.file.size} octets`);

  res.status(201).json({
    pseudo,
    type: req.file.mimetype,
    taille: req.file.size,
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Fichier trop volumineux (10 Mo max)" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

app.listen(PORT, () => {
  console.log(`API sur http://localhost:${PORT}`);
});
