const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

function formatXOF(amount) {
  return formatter.format(amount);
}

module.exports = { formatXOF };
