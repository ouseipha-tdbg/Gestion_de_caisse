import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

const defaultSettings = {
  companyName: "CaissePro",
  companyLogo: null,
  companyAddress: null,
  companyPhone: null,
  receiptFooter: "Merci de votre visite !",
  shopType: "COMMERCE",
  trackStock: true,
};

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/settings/public");
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshSettings();
    } else {
      setLoading(false);
    }
  }, [user, refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
