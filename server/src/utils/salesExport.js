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

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return `${MOIS_FR[month - 1]} ${year}`;
}

// reports : [{ month: "2026-01", nombreVentes, totalRecettes }, ...]
async function buildMonthlySalesWorkbook(reports) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "CaissePro";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Ventes par mois");

  sheet.columns = [
    { header: "Mois", key: "month", width: 22 },
    { header: "Nombre de ventes", key: "nombreVentes", width: 20 },
    { header: "Total (F CFA)", key: "totalRecettes", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" },
  };

  let totalVentes = 0;
  let totalRecettes = 0;

  for (const report of reports) {
    sheet.addRow({
      month: formatMonthLabel(report.month),
      nombreVentes: report.nombreVentes,
      totalRecettes: report.totalRecettes,
    });
    totalVentes += report.nombreVentes;
    totalRecettes += report.totalRecettes;
  }

  const totalRow = sheet.addRow({
    month: "TOTAL",
    nombreVentes: totalVentes,
    totalRecettes: totalRecettes,
  });
  totalRow.font = { bold: true };

  sheet.getColumn("totalRecettes").numFmt = '#,##0 "F CFA"';

  return workbook;
}

module.exports = { buildMonthlySalesWorkbook };
