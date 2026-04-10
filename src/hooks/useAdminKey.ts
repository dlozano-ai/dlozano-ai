"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "anthropic_admin_key";

export function useAdminKey() {
  const [adminKey, setAdminKeyState] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? "";
    setAdminKeyState(stored);
    setIsLoaded(true);
  }, []);

  const setAdminKey = useCallback((key: string) => {
    setAdminKeyState(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { adminKey, setAdminKey, isLoaded, hasKey: Boolean(adminKey) };
}
