import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Caisse from "./pages/Caisse";
import Produits from "./pages/Produits";
import Rapports from "./pages/Rapports";
import Parametres from "./pages/Parametres";
import Utilisateurs from "./pages/Utilisateurs";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Caisse />} />
        <Route path="/produits" element={<Produits />} />
        <Route path="/rapports" element={<Rapports />} />
        <Route
          path="/utilisateurs"
          element={
            <ProtectedRoute adminOnly>
              <Utilisateurs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parametres"
          element={
            <ProtectedRoute adminOnly>
              <Parametres />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
