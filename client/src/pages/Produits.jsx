import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, AlertCircle } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

const emptyForm = { name: "", price: "", stock: "" };

export default function Produits() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [produits, setProduits] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  async function charger() {
    const { data } = await api.get("/products");
    setProduits(data);
  }

  useEffect(() => {
    charger();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    try {
      const payload = { name: form.name, price: Number(form.price), stock: Number(form.stock) || 0 };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setModalOpen(false);
      charger();
    } catch (err) {
      setFormError(err.response?.data?.error || "Une erreur est survenue");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    setError("");
    try {
      await api.delete(`/products/${id}`);
      charger();
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de supprimer ce produit");
    }
  }

  const produitsFiltres = produits.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function stockBadge(stock) {
    if (stock <= 0) return <Badge variant="red">Rupture</Badge>;
    if (stock < 5) return <Badge variant="amber">Stock bas ({stock})</Badge>;
    return <Badge variant="green">{stock} en stock</Badge>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Produits</h1>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus size={16} /> Nouveau produit
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Input
        icon={Search}
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        wrapperClassName="mb-4 max-w-sm"
      />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Prix</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Stock</th>
              {isAdmin && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produitsFiltres.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{Number(p.price).toFixed(2)} €</td>
                <td className="px-4 py-3">{stockBadge(p.stock)}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        aria-label={`Modifier ${p.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Supprimer ${p.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {produitsFiltres.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="px-4 py-8 text-center text-slate-400">
                  Aucun produit
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Modifier le produit" : "Nouveau produit"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}
          <Input
            label="Nom"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Prix"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{editingId ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
