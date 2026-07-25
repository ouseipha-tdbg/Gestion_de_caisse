import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Caisse() {
  const [produits, setProduits] = useState([]);
  const [search, setSearch] = useState("");
  const [panier, setPanier] = useState({}); // { [productId]: quantity }
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function charger() {
    const { data } = await api.get("/products");
    setProduits(data);
  }

  useEffect(() => {
    charger();
  }, []);

  const produitsFiltres = useMemo(
    () => produits.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [produits, search]
  );

  function ajouterAuPanier(produit) {
    setPanier((prev) => {
      const current = prev[produit.id] || 0;
      if (current >= produit.stock) return prev;
      return { ...prev, [produit.id]: current + 1 };
    });
  }

  function changerQuantite(productId, delta) {
    setPanier((prev) => {
      const next = (prev[productId] || 0) + delta;
      if (next <= 0) {
        const { [productId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  }

  function retirerDuPanier(productId) {
    setPanier((prev) => {
      const { [productId]: _removed, ...rest } = prev;
      return rest;
    });
  }

  const lignes = Object.entries(panier)
    .map(([productId, quantity]) => ({
      produit: produits.find((p) => p.id === Number(productId)),
      quantity,
    }))
    .filter((l) => l.produit);

  const total = lignes.reduce((sum, l) => sum + Number(l.produit.price) * l.quantity, 0);

  async function handleValider() {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const items = lignes.map((l) => ({ productId: l.produit.id, quantity: l.quantity }));
      await api.post("/sales", { items });
      setMessage("Vente enregistrée avec succès.");
      setPanier({});
      charger();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la vente");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Caisse</h1>

        <Input
          icon={Search}
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="mb-6 max-w-sm"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produitsFiltres.map((p) => {
            const enPanier = panier[p.id] || 0;
            const epuise = p.stock <= 0;
            return (
              <button
                key={p.id}
                onClick={() => ajouterAuPanier(p)}
                disabled={epuise || enPanier >= p.stock}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="mb-1 text-sm font-medium text-slate-900">{p.name}</span>
                <span className="mb-2 text-lg font-semibold text-indigo-600">{Number(p.price).toFixed(2)} €</span>
                <span className={`text-xs ${epuise ? "text-red-500" : "text-slate-400"}`}>
                  {epuise ? "Rupture de stock" : `${p.stock} en stock`}
                </span>
              </button>
            );
          })}
          {produitsFiltres.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-400">Aucun produit trouvé</p>
          )}
        </div>
      </div>

      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <ShoppingCart size={18} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Panier</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lignes.length === 0 ? (
            <p className="text-sm text-slate-400">Le panier est vide</p>
          ) : (
            <ul className="space-y-3">
              {lignes.map((l) => (
                <li key={l.produit.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{l.produit.name}</p>
                    <p className="text-xs text-slate-500">{Number(l.produit.price).toFixed(2)} € / unité</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changerQuantite(l.produit.id, -1)}
                      className="rounded-md border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{l.quantity}</span>
                    <button
                      onClick={() => changerQuantite(l.produit.id, 1)}
                      disabled={l.quantity >= l.produit.stock}
                      className="rounded-md border border-slate-300 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => retirerDuPanier(l.produit.id)}
                    className="text-slate-300 hover:text-red-500"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          {message && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="text-xl font-semibold text-slate-900">{total.toFixed(2)} €</span>
          </div>
          <Button className="w-full" disabled={lignes.length === 0 || submitting} onClick={handleValider}>
            {submitting ? "Validation..." : "Valider la vente"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
