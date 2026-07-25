import { useEffect, useState } from "react";
import { Calendar, Receipt, Wallet } from "lucide-react";
import api from "../api";
import { formatCFA } from "../utils/currency";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

export default function Rapports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    api.get("/reports/daily", { params: { date } }).then(({ data }) => setRapport(data));
  }, [date]);

  const produitsTries = rapport ? Object.entries(rapport.parProduit).sort((a, b) => b[1] - a[1]) : [];
  const maxQuantite = produitsTries[0]?.[1] || 1;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Rapports</h1>
        <Input
          icon={Calendar}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          wrapperClassName="w-44"
        />
      </div>

      {rapport && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Receipt size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ventes</p>
                <p className="text-2xl font-semibold text-slate-900">{rapport.nombreVentes}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total des recettes</p>
                <p className="text-2xl font-semibold text-slate-900">{formatCFA(rapport.totalRecettes)}</p>
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Ventes par produit</h2>
            {produitsTries.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune vente ce jour-là</p>
            ) : (
              <ul className="space-y-3">
                {produitsTries.map(([nom, quantite]) => (
                  <li key={nom}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{nom}</span>
                      <span className="text-slate-500">{quantite}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(quantite / maxQuantite) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
