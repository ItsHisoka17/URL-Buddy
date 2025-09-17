import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/ToastContext";
import "./styles/styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
