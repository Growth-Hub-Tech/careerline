import { captureException } from '@sentry/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from './ErrorScreen';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly resetKey?: string;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
    // Sent only when error monitoring was started (VITE_SENTRY_DSN)
    captureException(error, { contexts: { react: { componentStack: info.componentStack } } });
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return <ErrorScreen onRetry={this.reset} />;
    return this.props.children;
  }
}
