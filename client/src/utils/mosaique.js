// Calcule la disposition des photos du cadre (de 1 à 6 photos).
//
// Principe :
// 1. on génère une quarantaine de dispositions au hasard, de 2 familles :
//    - en colonnes décalées (chaque photo va dans la colonne la plus courte)
//    - en lignes (dans une ligne, toutes les photos ont la même hauteur)
// 2. on mesure la place occupée à l'écran par les photos
// 3. on garde les bonnes (>= 80 % de la meilleure) et on en tire une au hasard
//
// Le "hasard" est un générateur à graine : avec les mêmes photos, on obtient
// toujours la même disposition (pas de saut quand on redimensionne la fenêtre),
// et une nouvelle photo donne une nouvelle disposition.

const GAP = 16;
const TENTATIVES = 40;
const SEUIL = 0.8;
const RATIO_PAR_DEFAUT = 4 / 3; // pour les anciennes photos sans dimensions

// Générateur de nombres pseudo-aléatoires (mulberry32) : renvoie une fonction
// qui donne un nombre entre 0 et 1, toujours la même suite pour une même graine.
function creerHasard(graine) {
  let a = graine >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Transforme un texte (les id des photos) en nombre, pour servir de graine
function texteEnNombre(texte) {
  let h = 0;
  for (const caractere of texte) {
    h = (Math.imul(h, 31) + caractere.charCodeAt(0)) | 0;
  }
  return h;
}

function ratioDe(photo) {
  return photo.width && photo.height ? photo.width / photo.height : RATIO_PAR_DEFAUT;
}

function enColonnes(items, zone, hasard) {
  const cols = 1 + Math.floor(hasard() * Math.min(items.length, 4));
  const colW = (zone.largeur - GAP * (cols - 1)) / cols;

  // Chaque photo va dans la colonne la moins haute
  const colonnes = Array.from({ length: cols }, () => ({ items: [], hauteur: 0 }));
  for (const item of items) {
    const plusCourte = colonnes.reduce((a, b) => (b.hauteur < a.hauteur ? b : a));
    plusCourte.items.push(item);
    plusCourte.hauteur += colW / item.ratio;
  }

  const decalage = cols > 1 ? Math.round(hasard() * 70) : 0;

  // 1re passe : taille réelle de chaque colonne
  // (si une colonne est trop haute, on réduit ses photos pour qu'elle tienne,
  //  elle devient donc aussi moins large)
  const mesures = colonnes.map((col) => {
    const hauteurs = col.items.map((item) => colW / item.ratio);
    const somme = hauteurs.reduce((a, b) => a + b, 0);
    const espaces = GAP * (col.items.length - 1);
    const echelle = Math.min(1, (zone.hauteur - espaces - decalage) / somme);
    return { hauteurs, echelle, largeur: colW * echelle, total: somme * echelle + espaces };
  });

  // 2e passe : on colle les colonnes les unes aux autres et on centre le groupe,
  // pour ne pas laisser de grands vides entre elles
  const largeurGroupe = mesures.reduce((a, m) => a + m.largeur, 0) + GAP * (cols - 1);
  let x = zone.x + (zone.largeur - largeurGroupe) / 2;
  const positions = [];

  colonnes.forEach((col, c) => {
    const { hauteurs, echelle, largeur, total } = mesures[c];

    // Centrée verticalement, une colonne sur deux un peu plus haut / plus bas
    let y = zone.y + (zone.hauteur - total) / 2 + (c % 2 === 0 ? -decalage / 2 : decalage / 2);
    y = Math.max(zone.y, Math.min(zone.y + zone.hauteur - total, y));

    col.items.forEach((item, j) => {
      const h = hauteurs[j] * echelle;
      positions.push({ photo: item.photo, x, y, w: largeur, h });
      y += h + GAP;
    });

    x += largeur + GAP;
  });

  return positions;
}

function enLignes(items, zone, hasard) {
  const n = items.length;
  const nbLignes = 1 + Math.floor(hasard() * Math.min(n, 3));

  // On choisit au hasard où couper la liste pour faire les lignes
  const coupesPossibles = Array.from({ length: n - 1 }, (_, i) => i + 1);
  for (let i = coupesPossibles.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [coupesPossibles[i], coupesPossibles[j]] = [coupesPossibles[j], coupesPossibles[i]];
  }
  const coupes = coupesPossibles.slice(0, nbLignes - 1).sort((a, b) => a - b);

  const lignes = [];
  let debut = 0;
  for (const fin of [...coupes, n]) {
    lignes.push(items.slice(debut, fin));
    debut = fin;
  }

  // Hauteur pour que la ligne remplisse toute la largeur
  const hauteurs = lignes.map(
    (ligne) =>
      (zone.largeur - GAP * (ligne.length - 1)) / ligne.reduce((a, item) => a + item.ratio, 0),
  );
  const somme = hauteurs.reduce((a, b) => a + b, 0);
  const espaces = GAP * (lignes.length - 1);
  const echelle = Math.min(1, (zone.hauteur - espaces) / somme);

  const positions = [];
  let y = zone.y + (zone.hauteur - (somme * echelle + espaces)) / 2;

  lignes.forEach((ligne, i) => {
    const h = hauteurs[i] * echelle;
    const largeurLigne = ligne.reduce((a, item) => a + item.ratio * h, 0) + GAP * (ligne.length - 1);
    let x = zone.x + (zone.largeur - largeurLigne) / 2;
    for (const item of ligne) {
      const w = item.ratio * h;
      positions.push({ photo: item.photo, x, y, w, h });
      x += w + GAP;
    }
    y += h + GAP;
  });

  return positions;
}

// photos : de la plus récente à la plus ancienne
// zone : { x, y, largeur, hauteur } = l'espace disponible à l'écran
export function calculerMosaique(photos, zone) {
  if (photos.length === 0 || zone.largeur <= 0 || zone.hauteur <= 0) return [];

  const items = photos.map((photo) => ({ photo, ratio: ratioDe(photo) }));
  const hasard = creerHasard(texteEnNombre(photos.map((p) => p.id).join("")));

  const candidats = [];
  for (let i = 0; i < TENTATIVES; i++) {
    const positions =
      hasard() < 0.5 ? enColonnes(items, zone, hasard) : enLignes(items, zone, hasard);
    const aire = positions.reduce((a, p) => a + p.w * p.h, 0);
    candidats.push({ positions, aire });
  }

  const meilleure = Math.max(...candidats.map((c) => c.aire));
  const bons = candidats.filter((c) => c.aire >= meilleure * SEUIL);
  return bons[Math.floor(hasard() * bons.length)].positions;
}
