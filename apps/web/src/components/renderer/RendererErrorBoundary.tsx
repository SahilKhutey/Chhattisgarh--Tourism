'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fieldKey?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RendererErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[RendererErrorBoundary] Render error in field "${this.props.fieldKey || 'unknown'}":`,
      error,
      errorInfo,
    );
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {this.props.fallbackTitle || 'Rendering Error'}
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Could not render field &quot;{this.props.fieldKey || 'content'}&quot;.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
