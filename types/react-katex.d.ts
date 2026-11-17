declare module 'react-katex' {
  import * as React from 'react';

  export interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error | TypeError) => React.ReactNode;
    settings?: Record<string, any>;
    className?: string;
  }

  export class InlineMath extends React.Component<KatexProps> {}
  export class BlockMath extends React.Component<KatexProps> {}
}
