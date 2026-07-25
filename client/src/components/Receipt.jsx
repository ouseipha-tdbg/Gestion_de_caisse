import { formatCFA } from "../utils/currency";

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Receipt({ sale, settings }) {
  if (!sale) return null;

  return (
    <div className="receipt-print mx-auto w-[300px] bg-white p-4 font-mono text-xs text-slate-900">
      <div className="flex flex-col items-center text-center">
        {settings?.companyLogo && (
          <img src={settings.companyLogo} alt="Logo" className="mb-2 h-14 w-14 object-contain" />
        )}
        <p className="text-sm font-bold uppercase">{settings?.companyName || "Ma Boutique"}</p>
        {settings?.companyAddress && <p>{settings.companyAddress}</p>}
        {settings?.companyPhone && <p>Tél : {settings.companyPhone}</p>}
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      <div className="flex justify-between">
        <span>Ticket #{sale.id}</span>
        <span>{formatDateTime(sale.createdAt)}</span>
      </div>
      {sale.user?.name && <p>Caissier : {sale.user.name}</p>}

      <div className="my-2 border-t border-dashed border-slate-400" />

      <table className="w-full">
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id}>
              <td className="py-0.5 align-top">
                {item.product.name}
                <br />
                <span className="text-slate-500">
                  {item.quantity} x {formatCFA(item.unitPrice)}
                </span>
              </td>
              <td className="py-0.5 text-right align-top">{formatCFA(item.unitPrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-2 border-t border-dashed border-slate-400" />

      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatCFA(sale.total)}</span>
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      <p className="text-center">{settings?.receiptFooter || "Merci de votre visite !"}</p>
    </div>
  );
}
