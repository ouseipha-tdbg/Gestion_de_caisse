import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import api from "../api";
import { useSettings } from "../context/SettingsContext";
import { formatCFA } from "../utils/currency";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Receipt from "../components/Receipt";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Ventes() {
  const { settings } = useSettings();
  const [ventes, setVentes] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/sales").then(({ data }) => setVentes(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Historique des ventes</h1>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Ticket</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Caissier</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ventes.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">#{v.id}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(v.createdAt)}</td>
                <td className="px-4 py-3 text-slate-600">{v.user?.name}</td>
                <td className="px-4 py-3 text-slate-600">{formatCFA(v.total)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(v)}
                    className="ml-auto flex items-center gap-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                    aria-label={`Réimprimer le ticket ${v.id}`}
                  >
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {ventes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Aucune vente enregistrée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Ticket #${selected?.id ?? ""}`}>
        <Receipt sale={selected} settings={settings} />
        <div className="mt-4 flex justify-end gap-2 print:hidden">
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Fermer
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={14} /> Imprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
