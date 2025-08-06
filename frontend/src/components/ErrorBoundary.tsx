import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
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
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          background: 'var(--bg-canvas)',
          color: 'var(--text-primary)',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
          <h2 style={{ margin: '0 0 var(--space-2) 0' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 var(--space-4) 0' }}>
            An error occurred while rendering this component.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Reload Page
          </button>
          {this.state.error && (
            <details style={{ marginTop: 'var(--space-4)', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                Error Details
              </summary>
              <pre style={{
                background: 'var(--bg-card)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                overflow: 'auto',
                maxWidth: '600px'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 