import { Suspense } from "react";

interface StreamingWrapperProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}

/**
 * A wrapper component that ensures Suspense boundaries work effectively
 * for showing loading states in both development and production
 */
export function StreamingWrapper({ children, fallback, className }: StreamingWrapperProps) {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
}

/**
 * For client components that need to show loading states during data fetching
 */
export function withLoadingState<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  LoadingComponent: React.ComponentType
) {
  return function ComponentWithLoading(props: T & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <Component {...(componentProps as T)} />;
  };
}
