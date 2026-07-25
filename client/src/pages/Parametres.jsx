import { useEffect, useState } from "react";
import { Building2, MessageCircle, CheckCircle2, AlertCircle, Send } from "lucide-react";
import api from "../api";
import { useSettings } from "../context/SettingsContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const emptyForm = {
  companyName: "",
  companyLogo: "",
  companyAddress: "",
  companyPhone: "",
  receiptFooter: "",
  shopType: "COMMERCE",
  whatsappEnabled: false,
  whatsappTarget: "",
  whatsappSendTime: "20:00",
};

export default function Parametres() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [testMessage, setTestMessage] = useState("");

  async function charger() {
    const { data } = await api.get("/settings");
    setForm({
      companyName: data.companyName || "",
      companyLogo: data.companyLogo || "",
      companyAddress: data.companyAddress || "",
      companyPhone: data.companyPhone || "",
      receiptFooter: data.receiptFooter || "",
      shopType: data.shopType,
      whatsappEnabled: data.whatsappEnabled,
      whatsappTarget: data.whatsappTarget || "",
      whatsappSendTime: data.whatsappSendTime,
    });
  }

  async function chargerStatutWhatsapp() {
    try {
      const { data } = await api.get("/whatsapp/status");
      setWhatsappStatus(data.ready);
    } catch {
      setWhatsappStatus(null);
    }
  }

  useEffect(() => {
    charger();
    chargerStatutWhatsapp();
  }, []);

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, companyLogo: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.put("/settings", form);
      setMessage("Paramètres enregistrés.");
      await refreshSettings();
      chargerStatutWhatsapp();
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer les paramètres");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestWhatsapp() {
    setTestMessage("");
    setError("");
    try {
      await api.post("/whatsapp/send-daily-report");
      setTestMessage("Rapport envoyé avec succès sur WhatsApp.");
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'envoyer le message de test");
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Paramètres</h1>

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Boutique &amp; ticket de caisse</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Nom de l'entreprise"
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              required
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Logo (affiché sur le ticket)</span>
              <div className="flex items-center gap-3">
                {form.companyLogo && (
                  <img src={form.companyLogo} alt="Logo" className="h-12 w-12 rounded-lg border border-slate-200 object-contain" />
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm text-slate-600" />
              </div>
            </label>

            <Input
              label="Adresse"
              value={form.companyAddress}
              onChange={(e) => setForm((f) => ({ ...f, companyAddress: e.target.value }))}
            />
            <Input
              label="Téléphone"
              value={form.companyPhone}
              onChange={(e) => setForm((f) => ({ ...f, companyPhone: e.target.value }))}
            />
            <Input
              label="Pied de page du ticket"
              value={form.receiptFooter}
              onChange={(e) => setForm((f) => ({ ...f, receiptFooter: e.target.value }))}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Type de boutique</span>
              <select
                value={form.shopType}
                onChange={(e) => setForm((f) => ({ ...f, shopType: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="COMMERCE">Commerce (vente de produits, suivi du stock)</option>
                <option value="SERVICE">Service (prestations, pas de suivi de stock)</option>
              </select>
            </label>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Bot WhatsApp</h2>
            </div>
            {whatsappStatus != null && (
              <span
                className={`text-xs font-medium ${whatsappStatus ? "text-emerald-600" : "text-slate-400"}`}
              >
                {whatsappStatus ? "● Connecté" : "○ Non connecté (QR code pas scanné)"}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.whatsappEnabled}
                onChange={(e) => setForm((f) => ({ ...f, whatsappEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
              />
              Activer l'envoi automatique du rapport journalier
            </label>

            <Input
              label="Numéro cible (ex: 22890000000@c.us) ou groupe (@g.us)"
              value={form.whatsappTarget}
              onChange={(e) => setForm((f) => ({ ...f, whatsappTarget: e.target.value }))}
            />
            <Input
              label="Heure d'envoi"
              type="time"
              value={form.whatsappSendTime}
              onChange={(e) => setForm((f) => ({ ...f, whatsappSendTime: e.target.value }))}
            />

            <Button type="button" variant="secondary" onClick={handleTestWhatsapp}>
              <Send size={14} /> Tester l'envoi maintenant
            </Button>
            {testMessage && <p className="text-sm text-emerald-600">{testMessage}</p>}
          </div>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
      </form>
    </div>
  );
}
