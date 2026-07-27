import { createContext, useCallback, useContext, useState } from "react";
import ToastContainer from "../components/Toast";

const ToastContext = createContext(null);

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Shortcuts
  toast.success = (msg, dur) => toast(msg, "success", dur);
  toast.error   = (msg, dur) => toast(msg, "error",   dur);
  toast.warning = (msg, dur) => toast(msg, "warning", dur);
  toast.info    = (msg, dur) => toast(msg, "info",    dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
