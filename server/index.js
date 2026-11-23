import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import sharp from "sharp";
import { envoyerVersCloudinary } from "./cloudinary.js";

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const TAILLE_MAX = 10 * 1024 * 1024;
const PSEUDO_MAX = 30;
const DIMENSION_MAX = 1920;

async function traiterImage(buffer) {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({
        width: DIMENSION_MAX,
        height: DIMENSION_MAX,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    const err = new Error("Le fichier n'est pas une image valide");
    err.status = 415;
    throw err;
  }
}

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

app.post("/api/photos", upload.single("photo"), async (req, res) => {
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

  const { data, info } = await traiterImage(req.file.buffer);
  const resultat = await envoyerVersCloudinary(data);

  console.log(
    `Photo de ${pseudo} : ${info.width}x${info.height}, ${data.length} octets → ${resultat.secure_url}`,
  );

  res.status(201).json({
    pseudo,
    url: resultat.secure_url,
    publicId: resultat.public_id,
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
