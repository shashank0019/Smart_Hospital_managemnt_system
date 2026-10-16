import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          const bgColors = {
            success: 'linear-gradient(135deg, #059669, #10b981)',
            error: 'linear-gradient(135deg, #dc2626, #ef4444)',
            warning: 'linear-gradient(135deg, #d97706, #f59e0b)',
            info: 'linear-gradient(135deg, #0284c7, #0ea5e9)'
          };

          const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ️'
          };

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bgColors[toast.type] || bgColors.info,
                color: '#ffffff',
                padding: '14px 18px',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.2px',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700 }}>{icons[toast.type]}</span>
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginLeft: '12px',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log(msg),
      removeToast: () => {}
    };
  }
  return context;
};
