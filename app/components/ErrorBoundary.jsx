'use client';

import { Component, useEffect } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if error is from extension
    if (error?.message?.includes('extension') || 
        error?.message?.includes('chrome-extension') ||
        error?.message?.includes('Cannot access') ||
        error?.stack?.includes('chrome-extension')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-extension errors
    if (!error?.message?.includes('extension') && 
        !error?.message?.includes('chrome-extension')) {
      console.error('Caught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please refresh the page or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#CC0000] text-white rounded hover:bg-[#B30000]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom hook to suppress extension errors
export function useSuppressExtensionErrors() {
  useEffect(() => {
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    // Suppress specific error patterns
    const shouldSuppress = (args) => {
      const patterns = [
        'chrome-extension',
        'Cannot access',
        'before initialization',
        'couponCollection',
        'BHK',
        'extension',
        '2vhdooizam3ks.js',
        '2z765pjlcmr92.js'
      ];
      return args.some(arg => 
        typeof arg === 'string' && 
        patterns.some(pattern => arg.includes(pattern))
      );
    };

    window.console.error = (...args) => {
      if (!shouldSuppress(args)) {
        originalError.apply(console, args);
      }
    };

    window.console.warn = (...args) => {
      if (!shouldSuppress(args)) {
        originalWarn.apply(console, args);
      }
    };

    // Catch unhandled promise rejections from extensions
    const handleUnhandledRejection = (event) => {
      if (event.reason?.message?.includes('extension') ||
          event.reason?.message?.includes('chrome-extension')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.console.error = originalError;
      window.console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}