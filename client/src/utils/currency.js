const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

export function formatCFA(amount) {
  return formatter.format(Number(amount) || 0);
}
