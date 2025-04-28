'use client';

import { Button } from '@/components/ui/button';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
              <p className="mb-4">申し訳ありませんが、問題が発生しました。</p>
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                再試行
              </Button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
