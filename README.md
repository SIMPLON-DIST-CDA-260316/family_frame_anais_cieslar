# Family Frame – Docker

## Prérequis
docker desktop
un compte cloudinary (pour le stockage des photos)

## Configuration
créer un .env.docker dans le dossier serveur à partir du .env.sample

# lancer le projet avec Compose (depuis la racine du projet) : 
```docker compose up``` avec ```--build``` pour reconstruire les images et avec ```-d``` pour le mode détaché
pour arreter les conteneurs : ```docker compose stop```
pour redémarrer les conteneurs : ```docker compose start```
pour arreter et supprimer les conteneurs : ```docker compose down```
pour arreter et supprimer les conteneurs et les volumes : ```docker compose down -v```

## Ce que lance compose.yml

- **mongodb** : la base de données MongoDB 8.0.38. Elle est lancée avec `--replSet rs0` car Prisma a besoin d'un replica set pour écrire. Ses données sont stockées dans un
  volume anonyme monté sur /data/db.
- **api** : le serveur Node/Express, construit à partir de server/Dockerfile. Il lit ses variables dans server/.env.docker et il est accessible sur le port 3000.
- **mongo-express** : une interface web pour consulter la base, accessible sur le port 8081.

Les trois services sont sur le réseau `familyframe`. Entre eux, ils se trouvent par leur nom de service : l'API se connecte à `mongodb://mongodb:27017`. Le port de mongodb n'est
pas publié, donc la base n'est accessible que depuis le réseau Docker.

mongodb a un **healthcheck** : toutes les 3 secondes, Docker lance une commande mongosh qui :
1. initialise le replica set s'il n'existe pas encore (`rs.initiate`) ;
2. vérifie que la base est PRIMARY, donc prête à accepter les écritures.

Tant que ce n'est pas le cas, le conteneur n'est pas « healthy ».
Grâce à `depends_on` avec `condition: service_healthy`, l'api et mongo-express ne démarrent qu'une fois la base healthy.

### Live reload
- `./server:/server` : bind mount. Le code de la machine est relié au conteneur, et `node --watch` redémarre le serveur à chaque sauvegarde.
- `/server/node_modules` : volume anonyme qui cache le node_modules de la machine. Le conteneur garde celui installé pour Linux pendant le build.

## Vérifier avec Compose

voir l'état des services : ```docker compose ps``` (mongodb doit être « healthy »)
voir les logs d'un service : ```docker compose logs -f api```
ouvrir mongosh dans la base : ```docker compose exec mongodb mongosh```

Dans Bruno : http://localhost:3000/api/health doit répondre en 200.

## Consulter la base de données

Ouvrir http://localhost:8081 dans le navigateur (identifiant : admin / mot de passe : pass).
Les photos sont dans la collection `Photo`.

# les commandes sans Compose : 

## Mise en place (une seule fois)
pour créer le reseau qui contiendra les deux conteneurs : 
```docker network create familyframe```

## Construire l'image du serveur
depuis le dossier du serveur : 
```docker build -t test1 . ```

## Lancer les conteneurs
pour le conteneur de mongo db avec le replica necessaire a prisma:
```docker run -d --name mongodb --network familyframe -v mongodb_data:/data/db mongo:8.0.38-noble --replSet rs0```

-v mongodb_data:/data/db : crée un volume pour garder les données en cas de suppression du conteneur

avec prisma on doit initialiser le replica une fois à la création du volume
```docker exec mongodb mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongodb:27017' }] })"```

pour le conteneur du serveur, depuis le dossier du serveur :
```docker run -d --name serveur -p 3000:3000 --network familyframe --env-file .env.docker -v "$(pwd)":/server -v /server/node_modules test1```

-v "$(pwd)":/server : permet le live-reloading, relie le dossier serveur de la machine au dossier serveur du conteneur

-v /server/node_modules : crée un volume anonyme qui cache le node_modules de la machine. Le conteneur garde le node_modules installé pour Linux pendant le build.

## Vérifier que ça marche

pour voir les conteneur actif : ```docker ps```
pour voir tous les conteneurs : ```docker ps -a```
pour voir si les conteneurs sont dans le reseau familyframe : ```docker network inspect familyframe```
pour voir la liste des reseaux : ```docker network ls```
pour voir la liste des logs d'un conteneur : ```docker logs <nom du conteneur>```

Dans bruno pour verifier que l'api fonctionne : 
http://localhost:3000/api/photos/latest doit repondre en 404 avec "aucune photo" si le base est vide
ou  http://localhost:3000/api/health doit repondre en 200 avec "ok": true

## Arrêter / relancer / nettoyer

Arrêter un conteneur : ```docker stop <nom du conteneur>```
relancer un conteneur : ```docker start <nom du conteneur>```
supprimer un conteneur : ```docker rm <nom du conteneur>```


