# Family Frame – MVP (J1, local, sans Docker)

## Objectif
Cadre photo numérique : un proche saisit son pseudo, envoie une photo,
elle apparaît en temps réel sur l'interface "cadre". Le but pédagogique
de la semaine est de conteneuriser (Docker / Compose) : garder le code simple.

## Stack imposée
pnpm, React + Vite (client/), Node 24 LTS + Express + Socket.IO (server/),
MongoDB Atlas + Prisma 6.19 (PAS Prisma 7 : pas de support MongoDB),
Multer, Sharp, Cloudinary.

## Choix
- JavaScript (pas de TypeScript), ESM ("type": "module")
- Une app React, deux pages : /envoyer et /cadre (react-router-dom)
- Serveur sur le port 3000, client Vite sur 5173
- Secrets uniquement dans server/.env (jamais commités)

## Fonctionnalités
1. Saisir un pseudo
2. Prendre/choisir une photo (input file, accept="image/*", capture)
3. Envoi à une route Express avec Multer (mémoire)
4. Contrôle serveur (type MIME, taille), décodage/réencodage Sharp
5. Upload Cloudinary
6. Enregistrement MongoDB : url, publicId, pseudo, createdAt (Prisma)
7. Page cadre : afficher la dernière photo
8. Diffusion temps réel Socket.IO (événement "new-photo")

## Méthode de travail
Avance étape par étape, une fonctionnalité à la fois. Explique le code
avant de l'écrire, je dois le comprendre. Je teste après chaque étape.
Ne génère pas tout d'un coup.

## État actuel
Dossiers client/ et server/ créés, dépendances installées.
Comptes Atlas et Cloudinary en cours de création.