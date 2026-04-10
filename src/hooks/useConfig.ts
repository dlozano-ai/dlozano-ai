"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "dlozano_dashboard_config";

interface DashboardConfig {
  monthlyLimit: number;
}

const DEFAULTS: DashboardConfig = {
  monthlyLimit: 2000,
};

export function useConfig() {
  const [config, setConfigState] = useState<DashboardConfig>(DEFAULTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DashboardConfig>;
        setConfigState({ ...DEFAULTS, ...parsed });
      }
    } catch {
      // ignore corrupt storage
    }
    setIsLoaded(true);
  }, []);

  const setConfig = useCallback((updates: Partial<DashboardConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return { config, setConfig, isLoaded };
}
