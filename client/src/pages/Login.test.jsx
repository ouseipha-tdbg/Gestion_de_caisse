import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./Login";
import { AuthProvider } from "../context/AuthContext";
import api from "../api";

vi.mock("../api", () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("affiche un message d'erreur si les identifiants sont invalides", async () => {
    api.post.mockRejectedValueOnce({ response: { status: 401 } });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "test@test.local");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "mauvais");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText(/email ou mot de passe incorrect/i)).toBeInTheDocument();
  });

  it("stocke le token et l'utilisateur après une connexion réussie", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        user: { id: 1, name: "Admin", email: "admin@test.local", role: "ADMIN" },
      },
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "admin@test.local");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => expect(localStorage.getItem("token")).toBe("fake-token"));
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "admin@test.local",
      password: "password123",
    });
  });
});
