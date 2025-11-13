import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Initialize MSW first (blocking)
async function initMSW() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import("./mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      console.log("✓ MSW started");
    } catch (error) {
      console.warn("⚠ MSW failed to start:", error.message);
    }
  }
}

// Initialize and render app
async function main() {
  await initMSW();
  
  const root = createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

main().catch(console.error);
