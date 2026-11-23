import { Link, Navigate, Route, Routes } from "react-router-dom";
import Envoyer from "./pages/Envoyer.jsx";
import Cadre from "./pages/Cadre.jsx";
import "./App.css";

function App() {
  return (
    <>
      <nav>
        <Link to="/envoyer">Envoyer</Link>
        <Link to="/cadre">Cadre</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/envoyer" />} />
        <Route path="/envoyer" element={<Envoyer />} />
        <Route path="/cadre" element={<Cadre />} />
      </Routes>
    </>
  );
}

export default App;
