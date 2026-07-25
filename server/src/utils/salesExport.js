const ExcelJS = require("exceljs");

const MOIS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE5E7EB" },
};

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MOIS_FR[month - 1]} ${year}`;
}

// reports : [{ month: "2026-01", nombreVentes, totalRecettes, parProduit: { nom: { quantite, total } } }, ...]
async function buildMonthlySalesWorkbook(reports) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CaissePro";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Résumé");
  summarySheet.columns = [
    { header: "Mois", key: "month", width: 22 },
    { header: "Nombre de ventes", key: "nombreVentes", width: 20 },
    { header: "Total (F CFA)", key: "totalRecettes", width: 20 },
  ];
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = HEADER_FILL;

  let totalVentes = 0;
  let totalRecettes = 0;

  for (const report of reports) {
    summarySheet.addRow({
      month: formatMonthLabel(report.month),
      nombreVentes: report.nombreVentes,
      totalRecettes: report.totalRecettes,
    });
    totalVentes += report.nombreVentes;
    totalRecettes += report.totalRecettes;
  }

  const totalRow = summarySheet.addRow({ month: "TOTAL", nombreVentes: totalVentes, totalRecettes });
  totalRow.font = { bold: true };
  summarySheet.getColumn("totalRecettes").numFmt = '#,##0 "F CFA"';

  // Détail : la liste de tous les articles vendus, agrégée par produit, pour chaque mois sélectionné.
  const detailSheet = workbook.addWorksheet("Articles vendus");
  detailSheet.columns = [
    { header: "Mois", key: "month", width: 22 },
    { header: "Produit", key: "produit", width: 28 },
    { header: "Quantité vendue", key: "quantite", width: 18 },
    { header: "Total (F CFA)", key: "total", width: 20 },
  ];
  detailSheet.getRow(1).font = { bold: true };
  detailSheet.getRow(1).fill = HEADER_FILL;

  for (const report of reports) {
    const monthLabel = formatMonthLabel(report.month);
    const produitEntries = Object.entries(report.parProduit).sort((a, b) => b[1].total - a[1].total);

    if (produitEntries.length === 0) {
      detailSheet.addRow({ month: monthLabel, produit: "(aucune vente)", quantite: 0, total: 0 });
      continue;
    }

    for (const [nom, { quantite, total }] of produitEntries) {
      detailSheet.addRow({ month: monthLabel, produit: nom, quantite, total });
    }
  }
  detailSheet.getColumn("total").numFmt = '#,##0 "F CFA"';

  return workbook;
}

module.exports = { buildMonthlySalesWorkbook };
