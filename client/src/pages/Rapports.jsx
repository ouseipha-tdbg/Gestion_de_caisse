import { useEffect, useMemo, useState } from "react";
import { Calendar, Receipt, Wallet, Download, AlertCircle } from "lucide-react";
import api from "../api";
import { formatCFA } from "../utils/currency";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import MonthMultiSelect from "../components/MonthMultiSelect";

function getLastMonths(n = 12) {
  const now = new Date();
  const months = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return months;
}

export default function Rapports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rapport, setRapport] = useState(null);

  const monthOptions = useMemo(() => getLastMonths(12), []);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    api.get("/reports/daily", { params: { date } }).then(({ data }) => setRapport(data));
  }, [date]);

  const produitsTries = rapport ? Object.entries(rapport.parProduit).sort((a, b) => b[1] - a[1]) : [];
  const maxQuantite = produitsTries[0]?.[1] || 1;

  async function handleDownload() {
    setExportError("");
    setExporting(true);
    try {
      const res = await api.get("/reports/export", {
        params: { months: selectedMonths.join(",") },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `ventes_${selectedMonths.join("_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError("Impossible de générer le fichier Excel");
    } finally {
      setExporting(false);
    }
  }

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

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Exporter le total des ventes (Excel)</h2>
        {exportError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} />
            {exportError}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <MonthMultiSelect options={monthOptions} selected={selectedMonths} onChange={setSelectedMonths} />
          <Button onClick={handleDownload} disabled={selectedMonths.length === 0 || exporting}>
            <Download size={16} /> {exporting ? "Génération..." : "Télécharger"}
          </Button>
        </div>
      </Card>

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
