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
    await api.delete(`/products/${id}`);
    charger();
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
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
          <label>
            Stock
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
          </label>
          <button type="submit">Ajouter</button>
        </form>
      )}

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
          {produits.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => handleDelete(p.id)}>Supprimer</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
