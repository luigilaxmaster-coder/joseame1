import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { rejectUnified } from '@/lib/jobs';
import { BaseCrudService } from '@/integrations';
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

interface SuccessState {
  show: boolean;
  rejectionId?: string;
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
  const [success, setSuccess] = useState<SuccessState>({ show: false });

  // Load rejection reasons on mount
  useEffect(() => {
    const loadReasons = async () => {
      try {
        setIsLoadingReasons(true);
        const { items } = await BaseCrudService.getAll<RejectionReasons>('rejectreasons');
        const filteredReasons = items.filter(r => r.context === context);
        setReasons(filteredReasons);
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
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large (max 10MB)`);
        continue;
      }

      // TODO: Upload file to Wix Media and get URL
      const mockUrl = URL.createObjectURL(file);
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        fileUrl: mockUrl,
        fileType: file.type,
        fileName: file.name,
      };

      newAttachments.push(newAttachment);
    }

    if (newAttachments.length > 0) {
      setAttachments([...attachments, ...newAttachments]);
      setError('');
    }
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

      // Show success state
      setSuccess({ show: true, rejectionId: result.rejectionId });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setReasonCode('');
        setDescription('');
        setOutcome('');
        setAttachments([]);
        setSuccess({ show: false });
        onClose();
        onSuccess?.();
      }, 3000);
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
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border border-border/50 rounded-3xl shadow-xl">
        <AnimatePresence mode="wait">
          {/* Success State */}
          {success.show ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-support flex items-center justify-center mb-6 shadow-lg"
              >
                <CheckCircle size={40} className="text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-heading text-2xl font-bold text-foreground mb-2 text-center"
              >
                ¡Rechazo Registrado!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-paragraph text-sm text-muted-text text-center mb-6"
              >
                {context === 'COMPLETION'
                  ? 'La propuesta de finalización ha sido rechazada exitosamente.'
                  : 'El trabajo ha sido rechazado exitosamente.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl"
              >
                <span className="font-paragraph text-xs text-accent font-semibold">
                  ID: {success.rejectionId?.substring(0, 8)}...
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="font-paragraph text-xs text-muted-text mt-6 text-center"
              >
                Cerrando en unos momentos...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DialogTitle className="font-heading text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-white" />
                    </div>
                    {context === 'GENERAL' ? 'Rechazar Trabajo' : 'Rechazar Completado'}
                  </DialogTitle>
                  <DialogDescription className="font-paragraph text-sm mt-2">
                    {context === 'GENERAL'
                      ? 'Proporciona una razón detallada para rechazar este trabajo.'
                      : 'Proporciona una razón detallada para rechazar el completado propuesto.'}
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6 max-h-[60vh] overflow-y-auto pr-4"
              >
                {/* Reason Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <Label htmlFor="reason" className="font-paragraph text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                      1
                    </span>
                    Razón del Rechazo
                  </Label>
                  <Select value={reasonCode} onValueChange={setReasonCode} disabled={isLoading || isLoadingReasons}>
                    <SelectTrigger id="reason" className="font-paragraph border-2 border-border/50 rounded-xl h-11">
                      <SelectValue placeholder="Selecciona una razón..." />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingReasons ? (
                        <div className="p-4 text-center">
                          <LoadingSpinner />
                        </div>
                      ) : reasons.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-text">
                          No hay razones disponibles
                        </div>
                      ) : (
                        reasons.map((reason) => (
                          <SelectItem key={reason._id} value={reason.reasonCode || ''}>
                            <div className="flex items-center gap-2">
                              <span>{reason.label}</span>
                              {reason.requiresEvidence && <span className="text-xs">📎</span>}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedReason && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 bg-accent/10 border border-accent/30 rounded-xl"
                    >
                      <AlertCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-paragraph text-accent font-semibold">
                          {selectedReason.requiresEvidence ? '📎 Se requiere evidencia' : 'Razón válida'}
                        </p>
                        {selectedReason.requiresEvidence && (
                          <p className="text-xs text-accent/80 mt-1">
                            Deberás adjuntar archivos de evidencia para esta razón.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <Label htmlFor="description" className="font-paragraph text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                      2
                    </span>
                    Descripción Detallada
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Explica en detalle por qué rechazas este trabajo (mínimo 20 caracteres)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] font-paragraph border-2 border-border/50 rounded-xl resize-none focus:ring-2 focus:ring-destructive/30"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-text font-paragraph">
                      {description.length} caracteres
                    </p>
                    <motion.p
                      animate={{
                        color: description.trim().length >= 20 ? '#71D261' : '#64748B'
                      }}
                      className="text-xs font-paragraph font-semibold"
                    >
                      {description.trim().length >= 20 ? '✓ Válido' : `Mínimo 20 requerido`}
                    </motion.p>
                  </div>
                </motion.div>

                {/* Outcome (COMPLETION only) */}
                {context === 'COMPLETION' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="outcome" className="font-paragraph text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive">
                        3
                      </span>
                      Resultado del Rechazo
                    </Label>
                    <Select value={outcome} onValueChange={setOutcome} disabled={isLoading}>
                      <SelectTrigger id="outcome" className="font-paragraph border-2 border-border/50 rounded-xl h-11">
                        <SelectValue placeholder="Selecciona un resultado..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REWORK_REQUESTED">
                          <div className="flex items-center gap-2">
                            <span>🔄 Solicitar Rehacer el Trabajo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="DISPUTE_OPEN">
                          <div className="flex items-center gap-2">
                            <span>⚖️ Abrir Disputa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCEL_REQUESTED">
                          <div className="flex items-center gap-2">
                            <span>❌ Solicitar Cancelación</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {outcome && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 p-3 bg-support/10 border border-support/30 rounded-xl"
                      >
                        <AlertCircle size={16} className="text-support flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-paragraph text-support font-semibold">
                          {outcome === 'REWORK_REQUESTED' && 'Se le pedirá al joseador que rehaga el trabajo.'}
                          {outcome === 'DISPUTE_OPEN' && 'Se abrirá una disputa para que un administrador resuelva.'}
                          {outcome === 'CANCEL_REQUESTED' && 'Se solicitará la cancelación del trabajo.'}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Attachments Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: context === 'COMPLETION' ? 0.4 : 0.35 }}
                  className="space-y-3"
                >
                  <Label className="font-paragraph text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {context === 'COMPLETION' ? '4' : '3'}
                    </span>
                    Archivos Adjuntos
                    {selectedReason?.requiresEvidence && (
                      <span className="text-destructive font-bold">*</span>
                    )}
                  </Label>

                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isLoading}
                      className="hidden"
                      id="file-upload-reject"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload-reject')?.click()}
                      disabled={isLoading}
                      className="gap-2 border-2 border-border/50 rounded-xl h-11 font-paragraph"
                    >
                      <Upload className="w-4 h-4" />
                      Agregar Archivo
                    </Button>
                    <p className="text-xs text-muted-text font-paragraph">
                      Máximo 10MB por archivo
                    </p>
                  </div>

                  {attachments.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 bg-background p-4 rounded-xl border-2 border-border/50"
                    >
                      <p className="text-xs font-paragraph font-semibold text-foreground mb-3">
                        {attachments.length} archivo{attachments.length !== 1 ? 's' : ''} adjunto{attachments.length !== 1 ? 's' : ''}
                      </p>
                      {attachments.map((att, index) => (
                        <motion.div
                          key={att.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-paragraph font-semibold text-foreground truncate">
                              {att.fileName}
                            </p>
                            <p className="text-xs text-muted-text font-paragraph">
                              {att.fileType}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeAttachment(att.id)}
                            disabled={isLoading}
                            className="ml-2 p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive font-paragraph font-semibold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: context === 'COMPLETION' ? 0.45 : 0.4 }}
                  className="flex gap-3 justify-end pt-6 border-t-2 border-border/50"
                >
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    className="font-paragraph border-2 border-border/50 rounded-xl h-11 px-6"
                  >
                    Cancelar
                  </Button>
                  <motion.div
                    whileHover={!isSubmitDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitDisabled}
                      className="gap-2 font-paragraph rounded-xl h-11 px-6 bg-gradient-to-r from-destructive to-destructive/80 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner />
                          Rechazando...
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={16} />
                          Confirmar Rechazo
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
