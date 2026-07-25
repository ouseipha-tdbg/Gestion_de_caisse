import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";

describe("ProtectedRoute", () => {
  it("redirige vers /login si l'utilisateur n'est pas connecté", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>Page de connexion</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Contenu protégé</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Page de connexion")).toBeInTheDocument();
  });

  it("affiche le contenu si l'utilisateur est connecté", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "CASHIER" }, loading: false });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/login" element={<div>Page de connexion</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Contenu protégé</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenu protégé")).toBeInTheDocument();
  });

  it("redirige vers / si adminOnly et que l'utilisateur n'est pas admin", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "CASHIER" }, loading: false });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Accueil</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Zone admin</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Accueil")).toBeInTheDocument();
  });
});
