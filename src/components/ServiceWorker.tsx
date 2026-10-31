"use client";
import { useEffect } from "react";

// Production only, registered after load so it never competes with the first paint.
// In development any earlier registration is removed, so cached builds never shadow `next dev`.
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    const register = () => navigator.serviceWorker.register("/sw.js");
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}
