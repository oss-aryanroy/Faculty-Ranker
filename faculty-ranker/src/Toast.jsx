import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  const { colors } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          colors={colors}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove, colors }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div
      className={`
        ${colors.bg.card} border ${colors.border} rounded-lg p-4 shadow-2xl
        flex items-start gap-3 min-w-[300px] max-w-md
        pointer-events-auto
        animate-slide-in-right
      `}
    >
      {icons[toast.type]}
      <p className={`flex-1 text-sm ${colors.text.primary}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${colors.text.muted} hover:${colors.text.primary} transition-colors`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};