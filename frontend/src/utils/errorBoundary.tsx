import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary p-6 bg-red-50 dark:bg-red-900 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
            🚨 Something went wrong
          </h2>
          <details className="text-sm text-red-700 dark:text-red-300">
            <summary className="cursor-pointer mb-2">Error Details</summary>
            <pre className="bg-red-100 dark:bg-red-800 p-3 rounded text-xs overflow-auto">
              {this.state.error?.toString()}
            </pre>
            <pre className="bg-red-100 dark:bg-red-800 p-3 rounded text-xs overflow-auto mt-2">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 