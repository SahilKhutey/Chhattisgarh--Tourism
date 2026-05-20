"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1A1D24",
          color: "#F4F1EB",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          fontFamily: "monospace",
          fontSize: "12px",
        },
        success: {
          iconTheme: { primary: "#10B981", secondary: "#F4F1EB" },
        },
        error: {
          iconTheme: { primary: "#EF4444", secondary: "#F4F1EB" },
        },
      }}
    />
  );
}
