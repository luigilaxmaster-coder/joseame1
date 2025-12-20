import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { acceptCompletion } from '@/backend/jobs.jsw';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CompletionConfirmationBarProps {
  completionAttemptId: string;
  jobOrderId: string;
  proposedByRole: string;
  proposedByUserId: string;
  currentUserId: string;
  onAccepted?: () => void;
  onDismiss?: () => void;
}

export default function CompletionConfirmationBar({
  completionAttemptId,
  jobOrderId,
  proposedByRole,
  proposedByUserId,
  currentUserId,
  onAccepted,
  onDismiss,
}: CompletionConfirmationBarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show if current user is NOT the proposer
  const isProposer = currentUserId === proposedByUserId;
  if (isProposer) {
    return null;
  }

  const handleAccept = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await acceptCompletion({
        completionAttemptId,
      });

      if (!result.ok) {
        setError(result.error || 'Failed to accept completion');
        return;
      }

      onAccepted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Status Message */}
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium font-heading text-foreground">
                Completado Propuesto
              </p>
              <p className="text-xs text-muted-text font-paragraph">
                {proposedByRole === 'client' ? 'El cliente' : 'El joseador'} ha propuesto que el trabajo está completado.
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive font-paragraph">{error}</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              disabled={isLoading}
              className="gap-2 font-paragraph"
            >
              <X className="w-4 h-4" />
              Descartar
            </Button>

            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isLoading}
              className="gap-2 font-paragraph bg-accent hover:bg-support text-foreground"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Aceptando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aceptar Completado
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
