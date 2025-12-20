import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Upload, X } from 'lucide-react';
import { rejectUnified } from '@/backend/jobs.jsw';
import wixData from 'wix-data';
import { RejectionReasons } from '@/entities';

interface Attachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

interface RejectJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobOrderId: string;
  completionAttemptId?: string; // Required for COMPLETION context
  context: 'GENERAL' | 'COMPLETION';
  onSuccess?: () => void;
}

export default function RejectJobModal({
  isOpen,
  onClose,
  jobOrderId,
  completionAttemptId,
  context,
  onSuccess,
}: RejectJobModalProps) {
  const [reasonCode, setReasonCode] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reasons, setReasons] = useState<RejectionReasons[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReasons, setIsLoadingReasons] = useState(true);
  const [error, setError] = useState('');

  // Load rejection reasons on mount
  useEffect(() => {
    const loadReasons = async () => {
      try {
        setIsLoadingReasons(true);
        const result = await wixData.query('rejectreasons')
          .eq('context', context)
          .find();
        setReasons(result.items);
      } catch (e) {
        setError('Failed to load rejection reasons');
      } finally {
        setIsLoadingReasons(false);
      }
    };

    if (isOpen) {
      loadReasons();
    }
  }, [isOpen, context]);

  const selectedReason = reasons.find(r => r.reasonCode === reasonCode);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // TODO: Upload file to Wix Media and get URL
    const mockUrl = URL.createObjectURL(file);
    const newAttachment: Attachment = {
      id: Math.random().toString(36).substr(2, 9),
      fileUrl: mockUrl,
      fileType: file.type,
      fileName: file.name,
    };

    setAttachments([...attachments, newAttachment]);
    setError('');
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    setError('');

    // Validate required fields
    if (!reasonCode) {
      setError('Please select a rejection reason');
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    // COMPLETION context specific validation
    if (context === 'COMPLETION') {
      if (!completionAttemptId) {
        setError('Completion attempt ID is required');
        return;
      }
      if (!outcome) {
        setError('Please select an outcome');
        return;
      }
    }

    // Check if evidence is required
    if (selectedReason?.requiresEvidence && attachments.length === 0) {
      setError('This rejection reason requires supporting evidence (attachments)');
      return;
    }

    setIsLoading(true);

    try {
      const result = await rejectUnified({
        context,
        jobOrderId,
        completionAttemptId: completionAttemptId || undefined,
        reasonCode,
        description: description.trim(),
        outcome: context === 'GENERAL' ? 'NONE' : outcome,
        attachments: attachments.map(att => ({
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName,
        })),
      });

      if (!result.ok) {
        setError(result.error || 'Failed to reject job');
        return;
      }

      // Success
      setReasonCode('');
      setDescription('');
      setOutcome('');
      setAttachments([]);
      onClose();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled =
    isLoading ||
    !reasonCode ||
    !description.trim() ||
    description.trim().length < 20 ||
    (context === 'COMPLETION' && !outcome) ||
    (selectedReason?.requiresEvidence && attachments.length === 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {context === 'GENERAL' ? 'Rechazar Trabajo' : 'Rechazar Completado'}
          </DialogTitle>
          <DialogDescription>
            {context === 'GENERAL'
              ? 'Proporciona una razón para rechazar este trabajo.'
              : 'Proporciona una razón para rechazar el completado propuesto.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-paragraph text-sm font-medium">
              Razón del Rechazo *
            </Label>
            <Select value={reasonCode} onValueChange={setReasonCode} disabled={isLoading || isLoadingReasons}>
              <SelectTrigger id="reason" className="font-paragraph">
                <SelectValue placeholder="Selecciona una razón..." />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason._id} value={reason.reasonCode || ''}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReason && (
              <p className="text-xs text-muted-text">
                {selectedReason.requiresEvidence && '📎 Se requiere evidencia'}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-paragraph text-sm font-medium">
              Descripción Detallada *
            </Label>
            <Textarea
              id="description"
              placeholder="Explica en detalle por qué rechazas este trabajo (mínimo 20 caracteres)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] font-paragraph"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-text">
              {description.length} caracteres (mínimo 20 requerido)
            </p>
          </div>

          {/* Outcome (COMPLETION only) */}
          {context === 'COMPLETION' && (
            <div className="space-y-2">
              <Label htmlFor="outcome" className="font-paragraph text-sm font-medium">
                Resultado del Rechazo *
              </Label>
              <Select value={outcome} onValueChange={setOutcome} disabled={isLoading}>
                <SelectTrigger id="outcome" className="font-paragraph">
                  <SelectValue placeholder="Selecciona un resultado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REWORK_REQUESTED">
                    Solicitar Rehacer el Trabajo
                  </SelectItem>
                  <SelectItem value="DISPUTE_OPEN">
                    Abrir Disputa
                  </SelectItem>
                  <SelectItem value="CANCEL_REQUESTED">
                    Solicitar Cancelación
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-3">
            <Label className="font-paragraph text-sm font-medium">
              Archivos Adjuntos
              {selectedReason?.requiresEvidence && ' *'}
            </Label>

            <div className="flex items-center gap-2">
              <Input
                type="file"
                ref={(input) => {
                  if (input) {
                    input.addEventListener('change', handleFileSelect as any);
                  }
                }}
                disabled={isLoading}
                className="hidden"
                id="file-upload-reject"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload-reject')?.click()}
                disabled={isLoading}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Agregar Archivo
              </Button>
              <p className="text-xs text-muted-text">
                Máximo 10MB por archivo
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 bg-background p-3 rounded-lg border border-border">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{att.fileName}</p>
                      <p className="text-xs text-muted-text">{att.fileType}</p>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      disabled={isLoading}
                      className="ml-2 p-1 hover:bg-background rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-paragraph">{error}</p>
            </div>
          )}

          {/* Loading Reasons */}
          {isLoadingReasons && (
            <div className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <LoadingSpinner />
              <p className="text-sm text-blue-700 font-paragraph">Cargando razones de rechazo...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="font-paragraph"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="gap-2 font-paragraph"
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Rechazando...
                </>
              ) : (
                'Rechazar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
