import { useState, useEffect } from "react";

export function useProfileStore() {
  const [profileId, setProfileIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("macro-planner-profile-id");
    if (saved) return parseInt(saved, 10);
    return null;
  });

  const setProfileId = (id: number | null) => {
    if (id === null) {
      localStorage.removeItem("macro-planner-profile-id");
    } else {
      localStorage.setItem("macro-planner-profile-id", id.toString());
    }
    setProfileIdState(id);
  };

  // Optional: Listen to storage events to sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "macro-planner-profile-id") {
        setProfileIdState(e.newValue ? parseInt(e.newValue, 10) : null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { profileId, setProfileId };
}
