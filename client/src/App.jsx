import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Envoyer from "./pages/Envoyer.jsx";
import Cadre from "./pages/Cadre.jsx";
import { IconeImage } from "./components/Icones.jsx";
import "./App.css";

function App() {
  // Le cadre est affiché en plein écran : pas d'en-tête sur cette page
  const { pathname } = useLocation();
  const afficherEntete = pathname !== "/cadre";

  return (
    <>
      {afficherEntete && (
        <header className="entete">
          <Link to="/envoyer" className="logo">
            <span className="logo-carre">
              <IconeImage />
            </span>
            Family Frame
          </Link>
          <Link to="/cadre" className="entete-lien">
            Voir le cadre
          </Link>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/envoyer" />} />
        <Route path="/envoyer" element={<Envoyer />} />
        <Route path="/cadre" element={<Cadre />} />
      </Routes>
    </>
  );
}

export default App;
