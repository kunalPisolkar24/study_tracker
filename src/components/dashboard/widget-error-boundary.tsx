"use client";

import { Component } from "react";

interface Props {
  children: React.ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          {this.props.title ?? "Widget"} unavailable
        </div>
      );
    }
    return this.props.children;
  }
}
