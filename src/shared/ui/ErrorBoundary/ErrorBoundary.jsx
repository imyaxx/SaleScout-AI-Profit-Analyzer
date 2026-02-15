import { Component } from 'react';
import i18next from 'i18next';
import { ErrorState } from '@/shared/ui/States/States';

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || i18next.t('errors.analysisRender'),
    };
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary caught error', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState message={this.state.message} onRetry={this.props.onRetry} variant="boundary" />;
    }
    return this.props.children;
  }
}
