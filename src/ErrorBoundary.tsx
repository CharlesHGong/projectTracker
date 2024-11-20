import React, { ErrorInfo } from "react";

type State = {
  hasError: boolean;
  error: Error | null;
};
type Props = {
  children: React.ReactNode;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ backgroundColor: "white", height: "100%", overflow: "auto" }}
        >
          <h3>{this.state.error?.message}</h3>
          <div style={{ paddingLeft: 8 }}>{this.state.error?.stack}</div>
        </div>
      );
    }

    return this.props.children;
  }
}
