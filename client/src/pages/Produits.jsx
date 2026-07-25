import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Produits() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [produits, setProduits] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", stock: "" });
  const [rowError, setRowError] = useState("");

  async function charger() {
    const { data } = await api.get("/products");
    setProduits(data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/products", { name, price: Number(price), stock: Number(stock) || 0 });
      setName("");
      setPrice("");
      setStock("");
      charger();
    } catch {
      setError("Impossible d'ajouter le produit");
    }
  }

  async function handleDelete(id) {
    setRowError("");
    try {
      await api.delete(`/products/${id}`);
      charger();
    } catch (err) {
      setRowError(err.response?.data?.error || "Impossible de supprimer ce produit");
    }
  }

  function startEdit(p) {
    setRowError("");
    setEditingId(p.id);
    setEditForm({ name: p.name, price: Number(p.price), stock: p.stock });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id) {
    setRowError("");
    try {
      await api.put(`/products/${id}`, {
        name: editForm.name,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
      });
      setEditingId(null);
      charger();
    } catch (err) {
      setRowError(err.response?.data?.error || "Impossible de modifier ce produit");
    }
  }

  return (
    <div className="page">
      <h1>Produits</h1>

      {isAdmin && (
        <form className="card" onSubmit={handleAdd}>
          <h2>Ajouter un produit</h2>
          {error && <p className="error">{error}</p>}
          <label>
            Nom
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Prix
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label>
            Stock
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          </label>
          <button type="submit">Ajouter</button>
        </form>
      )}

      {rowError && <p className="error">{rowError}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prix</th>
            <th>Stock</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {produits.map((p) =>
            editingId === p.id ? (
              <tr key={p.id}>
                <td>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                  />
                </td>
                <td>
                  <button onClick={() => saveEdit(p.id)}>Enregistrer</button>
                  <button onClick={cancelEdit}>Annuler</button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{Number(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                {isAdmin && (
                  <td>
                    <button onClick={() => startEdit(p)}>Modifier</button>
                    <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
