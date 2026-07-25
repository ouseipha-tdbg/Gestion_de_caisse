function formatDailyReportMessage(report) {
  const lignes = Object.entries(report.parProduit)
    .sort((a, b) => b[1] - a[1])
    .map(([nom, quantite]) => `  • ${nom} : ${quantite}`)
    .join("\n");

  return [
    `*Recette du jour — ${report.date}*`,
    "",
    `Ventes : ${report.nombreVentes}`,
    `Total : ${report.totalRecettes.toFixed(2)}`,
    "",
    lignes ? `Détail par produit :\n${lignes}` : "Aucune vente enregistrée.",
  ].join("\n");
}

module.exports = { formatDailyReportMessage };
