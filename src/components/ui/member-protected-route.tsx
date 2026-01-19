import { ReactNode } from 'react';
import { useMember } from '@/integrations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Navigate } from 'react-router-dom';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

interface MemberProtectedRouteProps {
  children: ReactNode;

  // Simple props for quick customization
  messageToLoading?: string;
  loadingClassName?: string;

  // Advanced prop objects for full customization
  loadingSpinnerProps?: Partial<LoadingSpinnerProps>;
}

export function MemberProtectedRoute({
  children,
  messageToLoading = "Loading page...",
  loadingClassName = "",
  loadingSpinnerProps = {}
}: MemberProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useMember();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingSpinner
          message={messageToLoading}
          className={loadingClassName}
          {...loadingSpinnerProps}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in-required" replace />;
  }

  return <>{children}</>;
}
