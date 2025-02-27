import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  FallbackComponent?: React.ComponentType<any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        const FallbackComponent = this.props.FallbackComponent;
        return <FallbackComponent error={this.state.error} />;
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap">
            <summary>Click for error details</summary>
            <p className="mt-2">{this.state.error && this.state.error.toString()}</p>
            <p className="mt-2 text-sm">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
