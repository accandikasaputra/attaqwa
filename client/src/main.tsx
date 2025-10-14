import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div id="app-root" className="relative min-h-screen">
      <App />
      {/* Portal untuk komponen Radix (Dropdowns, Dialogs, Selects) */}
      <div id="portal-root" />
    </div>
  </React.StrictMode>
);
