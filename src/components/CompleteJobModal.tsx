import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Upload, X } from 'lucide-react';
import { proposeCompletion } from '@/backend/jobs.jsw';

interface Attachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  description?: string;
}

interface CompleteJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobOrderId: string;
  threadId: string;
  onSuccess?: () => void;
}

export default function CompleteJobModal({
  isOpen,
  onClose,
  jobOrderId,
  threadId,
  onSuccess,
}: CompleteJobModalProps) {
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // TODO: Upload file to Wix Media and get URL
    // For now, create a mock URL
    const mockUrl = URL.createObjectURL(file);
    const newAttachment: Attachment = {
      id: Math.random().toString(36).substr(2, 9),
      fileUrl: mockUrl,
      fileType: file.type,
      fileName: file.name,
    };

    setAttachments([...attachments, newAttachment]);
    setFileInput(null);
    setError('');
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    setError('');

    // Validate note
    if (!note.trim() || note.trim().length < 10) {
      setError('Note must be at least 10 characters');
      return;
    }

    setIsLoading(true);

    try {
      const result = await proposeCompletion({
        jobOrderId,
        note: note.trim(),
        attachments: attachments.map(att => ({
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName,
          description: att.description || '',
        })),
      });

      if (!result.ok) {
        setError(result.error || 'Failed to propose completion');
        return;
      }

      // Success
      setNote('');
      setAttachments([]);
      onClose();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Proponer Completado</DialogTitle>
          <DialogDescription>
            Proporciona detalles sobre cómo completaste el trabajo y adjunta evidencia si es necesario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Note Section */}
          <div className="space-y-2">
            <Label htmlFor="note" className="font-paragraph text-sm font-medium">
              Descripción del Trabajo Completado *
            </Label>
            <Textarea
              id="note"
              placeholder="Describe cómo completaste el trabajo, qué se hizo, resultados, etc. (mínimo 10 caracteres)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] font-paragraph"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-text">
              {note.length} caracteres (mínimo 10 requerido)
            </p>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
            <Label className="font-paragraph text-sm font-medium">
              Archivos Adjuntos (Fotos, Documentos, etc.)
            </Label>

            {/* File Upload Input */}
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
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
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

            {/* Attachments List */}
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
              disabled={isLoading || !note.trim() || note.trim().length < 10}
              className="gap-2 font-paragraph"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Enviando...
                </>
              ) : (
                'Proponer Completado'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
