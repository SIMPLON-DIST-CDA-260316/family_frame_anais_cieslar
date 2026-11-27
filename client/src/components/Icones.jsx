// Petites icônes SVG réutilisables (style "trait").
// aria-hidden : elles sont décoratives, le texte à côté suffit.

function Icone({ taille = 18, children }) {
  return (
    <svg
      aria-hidden="true"
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconeImage({ taille }) {
  return (
    <Icone taille={taille}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </Icone>
  );
}

export function IconeChanger({ taille }) {
  return (
    <Icone taille={taille}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </Icone>
  );
}

export function IconeFleche({ taille }) {
  return (
    <Icone taille={taille}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icone>
  );
}

export function IconeCoche({ taille }) {
  return (
    <Icone taille={taille}>
      <path d="M20 6 9 17l-5-5" />
    </Icone>
  );
}
