'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('ErrorBoundary caught an error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <Card padding="lg" className="max-w-md">
            <h2 className="mb-4">Etwas ist schiefgelaufen</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-[var(--color-text-muted)] mb-2">
                  Fehlerdetails
                </summary>
                <pre className="text-xs bg-[var(--color-cream)] p-4 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <Button onClick={() => window.location.reload()}>Seite neu laden</Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}


