'use client';

import React, { Component, type ReactNode } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import { cn } from '@/lib/utils';

interface Props {
  math?: string;
  latex?: string;
  display?: boolean;
  className?: string;
}

interface State {
  hasError: boolean;
}

class KatexErrorBoundary extends Component<{ math: string; children: ReactNode }, State> {
  constructor(props: { math: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <code className="text-amber-400 bg-gray-800 px-1 rounded text-sm font-mono">
          {this.props.math}
        </code>
      );
    }
    return this.props.children;
  }
}

export function KatexRenderer({ math, latex, display = false, className }: Props) {
  const content = math ?? latex ?? '';
  if (!content) return null;

  return (
    <span className={cn('katex-wrap', className)}>
      <KatexErrorBoundary math={content}>
        {display ? <BlockMath math={content} /> : <InlineMath math={content} />}
      </KatexErrorBoundary>
    </span>
  );
}

export default KatexRenderer;
