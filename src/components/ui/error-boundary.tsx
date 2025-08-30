"use client";

import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showNavigate?: boolean;
  fallbackVariant?: "card" | "inline" | "page" | "minimal";
  title?: string;
  description?: string;
}

class ErrorBoundaryBase extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    toast.error("Something went wrong. Please try refreshing the page.");
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount >= 3) {
      toast.error("Too many retry attempts. Please refresh the page.");
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
    });

    toast.info("Retrying...");
  };

  handleNavigateHome = () => {
    window.location.href = "/dashboard";
  };

  handleGoBack = () => {
    window.history.back();
  };

  renderFallback() {
    const {
      fallback,
      fallbackVariant = "card",
      showRetry = true,
      showNavigate = false,
      title,
      description,
    } = this.props;
    const { error, retryCount } = this.state;

    if (fallback) {
      return fallback;
    }

    const defaultTitle = title || "Something went wrong";
    const defaultDescription =
      description ||
      "An unexpected error occurred. This has been logged and we&apos;re working to fix it.";

    const RetryButton = showRetry && (
      <Button
        onClick={this.handleRetry}
        variant="outline"
        size="sm"
        disabled={retryCount >= 3}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        {retryCount >= 3 ? "Max retries reached" : "Try Again"}
      </Button>
    );

    const NavigationButtons = showNavigate && (
      <div className="flex gap-2">
        <Button onClick={this.handleGoBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button onClick={this.handleNavigateHome} variant="outline" size="sm">
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Button>
      </div>
    );

    switch (fallbackVariant) {
      case "page":
        return (
          <div className="min-h-[50vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">{defaultTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">{defaultDescription}</p>
                {process.env.NODE_ENV === "development" && error && (
                  <details className="text-left text-xs bg-muted p-2 rounded">
                    <summary className="cursor-pointer font-medium">
                      Error Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {error.message}
                    </pre>
                  </details>
                )}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  {RetryButton}
                  {NavigationButtons}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "inline":
        return (
          <div className="flex items-center gap-3 p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-900 dark:text-red-100">
                {defaultTitle}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {defaultDescription}
              </p>
            </div>
            {RetryButton}
          </div>
        );

      case "minimal":
        return (
          <div className="text-center p-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p>{defaultTitle}</p>
            {RetryButton}
          </div>
        );

      case "card":
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {defaultTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{defaultDescription}</p>
              {process.env.NODE_ENV === "development" && error && (
                <details className="text-xs bg-muted p-2 rounded">
                  <summary className="cursor-pointer font-medium">
                    Error Details
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                {RetryButton}
                {NavigationButtons}
              </div>
            </CardContent>
          </Card>
        );
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

// Wrapper component for easier usage
export default function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryBase {...props} />;
}

// Pre-configured error boundaries for common use cases
export function PageErrorBoundary({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <ErrorBoundary
      fallbackVariant="page"
      showNavigate={true}
      title={title}
      onError={(error, errorInfo) => {
        // You can integrate with error reporting services here
        console.error(`Page Error - ${title}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <ErrorBoundary
      fallbackVariant="card"
      showRetry={true}
      title={title || "Component Error"}
      description="This component failed to load properly."
    >
      {children}
    </ErrorBoundary>
  );
}

export function InlineErrorBoundary({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <ErrorBoundary
      fallbackVariant="inline"
      showRetry={true}
      title={title || "Load Error"}
      description="Failed to load this section."
    >
      {children}
    </ErrorBoundary>
  );
}
