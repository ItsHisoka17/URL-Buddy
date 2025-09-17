import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, { type = "default", duration = 4500 } = {}) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div aria-live="polite" className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type || "default"}`} role="status">
            <div className="toast-content">{t.message}</div>
            <button className="toast-close" aria-label="Close" onClick={() => remove(t.id)}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
