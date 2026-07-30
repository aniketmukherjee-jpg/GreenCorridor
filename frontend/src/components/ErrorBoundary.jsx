import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught runtime exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0b0f19] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full backdrop-blur-3xl bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl border border-red-500/40 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Telemetry Exception Detected</h2>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                A transient runtime error occurred while processing GIS map layers or route state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-[11px] font-mono text-red-400 overflow-x-auto max-h-24 custom-scrollbar">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RELOAD GREENCORRIDOR SYSTEM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
