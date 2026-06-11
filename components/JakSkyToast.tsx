"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

declare global {
  interface Window {
    jaskyToast?: (message: string, type?: "success" | "error" | "info") => void;
  }
}

export default function JakSkyToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function pushToast(message: string, type: "success" | "error" | "info" = "info") {
    const id = `${Date.now()}-${Math.random()}`;

    setToasts((items) => [...items, { id, message, type }]);

    setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  }

  useEffect(() => {
    window.jaskyToast = pushToast;

    const oldAlert = window.alert;

    window.alert = (message?: any) => {
      pushToast(String(message || "Notifikasi"), "info");
    };

    return () => {
      window.alert = oldAlert;
      delete window.jaskyToast;
    };
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "rounded-[22px] border px-4 py-3 shadow-2xl backdrop-blur-xl",
            toast.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
              : toast.type === "error"
              ? "border-red-400/30 bg-red-500/15 text-red-100"
              : "border-pink-400/30 bg-black/80 text-pink-100",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-lg">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "✨"}
            </div>

            <p className="text-sm font-black leading-6">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
