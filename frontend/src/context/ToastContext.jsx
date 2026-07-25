import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col space-y-2 pointer-events-none max-w-xs">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100
              px-4 py-2.5 rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-md border flex items-center space-x-2.5
              ${toast.type === 'success' ? 'bg-green-500/90 dark:bg-green-600/80 border-green-400/50 text-white' : 
                toast.type === 'error' ? 'bg-red-500/90 dark:bg-red-600/80 border-red-400/50 text-white' : 
                'bg-blue-500/90 dark:bg-blue-600/80 border-blue-400/50 text-white'}
            `}
          >
            <span className="text-sm">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="font-semibold text-xs tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
