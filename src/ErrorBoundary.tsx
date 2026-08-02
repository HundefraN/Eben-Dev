import React from 'react';

interface State { hasError: boolean; error: Error | null; info: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null, info: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, info: '' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info: info.componentStack ?? '' });
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff', color: '#c00', minHeight: '100vh' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>⚠ Runtime Error</h1>
          <pre style={{ background: '#fff0f0', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {this.state.error?.toString()}
          </pre>
          <h2 style={{ marginTop: 24, marginBottom: 8, fontSize: 16 }}>Component Stack:</h2>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 12, color: '#333' }}>
            {this.state.info}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
