import { useEffect, useState } from "react";
import api from "../api";

export default function Caisse() {
  const [produits, setProduits] = useState([]);
  const [panier, setPanier] = useState({}); // { productId: quantity }
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products").then(({ data }) => setProduits(data));
  }, []);

  function setQuantite(productId, quantity) {
    setPanier((prev) => {
      const next = { ...prev };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return next;
    });
  }

  const lignes = Object.entries(panier).map(([productId, quantity]) => {
    const produit = produits.find((p) => p.id === Number(productId));
    return { produit, quantity };
  });

  const total = lignes.reduce((sum, l) => sum + (l.produit ? Number(l.produit.price) * l.quantity : 0), 0);

  async function handleValider() {
    setError("");
    setMessage("");
    try {
      const items = Object.entries(panier).map(([productId, quantity]) => ({
        productId: Number(productId),
        quantity,
      }));
      await api.post("/sales", { items });
      setMessage("Vente enregistrée avec succès.");
      setPanier({});
      const { data } = await api.get("/products");
      setProduits(data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la vente");
    }
  }

  return (
    <div className="page">
      <h1>Caisse</h1>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Quantité</th>
          </tr>
        </thead>
        <tbody>
          {produits.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{Number(p.price).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={p.stock}
                  value={panier[p.id] || ""}
                  onChange={(e) => setQuantite(p.id, Number(e.target.value))}
                  style={{ width: "5rem" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card">
        <h2>Total : {total.toFixed(2)}</h2>
        <button disabled={lignes.length === 0} onClick={handleValider}>
          Valider la vente
        </button>
      </div>
    </div>
  );
}
