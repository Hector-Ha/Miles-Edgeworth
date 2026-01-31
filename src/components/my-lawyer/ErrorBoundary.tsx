"use client";

import { Component, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/my-lawyer/ui/card";
import { Button } from "@/components/my-lawyer/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary - Catches rendering errors in child components
 *
 * Features:
 * - Card styling for error display
 * - Court-themed error presentation
 * - Retry button for user recovery
 * - Logs errors to console for debugging
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected error occurred",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-5">
          <Card className="max-w-md text-center bg-white border border-stone-200 shadow-md">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-700/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-700" />
              </div>
              <CardTitle className="text-2xl font-serif text-amber-700 tracking-wide">
                OBJECTION!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-600">
                The courtroom has encountered an unexpected error.
              </p>
              <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
                <code className="text-sm text-stone-800 font-mono break-all">
                  {this.state.errorMessage}
                </code>
              </div>
              <Button
                onClick={this.handleRetry}
                size="lg"
                className="w-full font-semibold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Court Session
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
