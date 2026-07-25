import { useEffect, useState } from "react";
import api from "../api";

export default function Rapports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    api.get("/reports/daily", { params: { date } }).then(({ data }) => setRapport(data));
  }, [date]);

  return (
    <div className="page">
      <h1>Rapports</h1>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {rapport && (
        <div className="card">
          <p>Nombre de ventes : {rapport.nombreVentes}</p>
          <p>Total des recettes : {rapport.totalRecettes.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
