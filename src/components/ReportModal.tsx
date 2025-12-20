import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BaseCrudService } from '@/integrations';
import { ReportReasons } from '@/entities';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  threadId?: string;
  jobOrderId?: string;
  messages?: Array<{ id: string; text: string; sender: string }>;
  onSuccess?: () => void;
}

export default function ReportModal({
  open,
  onOpenChange,
  targetUserId,
  threadId = '',
  jobOrderId = '',
  messages = [],
  onSuccess,
}: ReportModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ReportReasons[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<ReportReasons | null>(null);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [blockUser, setBlockUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load report reasons on mount
  useEffect(() => {
    if (open) {
      loadReportReasons();
    }
  }, [open]);

  const loadReportReasons = async () => {
    try {
      const { items } = await BaseCrudService.getAll<ReportReasons>('reportreasons');
      setCategories(items);
    } catch (err) {
      console.error('Error loading report reasons:', err);
      setError('Failed to load report categories');
    }
  };

  const uniqueCategories = Array.from(new Set(categories.map(c => c.category)));
  const reasonsForCategory = categories.filter(c => c.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachments.length + files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setAttachments([...attachments, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedReason || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (description.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare attachments data
      const attachmentData = attachments.map(file => ({
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // In production, upload to cloud storage
        fileSize: file.size,
        fileType: file.type,
      }));

      // Call backend function
      const response = await fetch('/_functions/submitReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedReason.category,
          reasonCode: selectedReason.reasonCode,
          reasonLabelSnapshot: selectedReason.label,
          severity: selectedReason.severity,
          priority: selectedReason.autoPriority,
          description: description.trim(),
          reporterId: '', // Will be set by backend
          targetUserId: targetUserId,
          threadId: threadId,
          jobOrderId: jobOrderId,
          messageIds: selectedMessages,
          attachments: attachmentData,
          blockUser: blockUser,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setStep(1);
        setSelectedCategory('');
        setSelectedReason(null);
        setDescription('');
        setAttachments([]);
        setSelectedMessages([]);
        setBlockUser(false);
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border border-border/50 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold text-foreground">
            {success ? '✅ Reporte Enviado' : 'Reportar Usuario'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 size={32} className="text-white" />
              </motion.div>
              <p className="font-paragraph text-lg text-foreground mb-2">
                Tu reporte ha sido enviado exitosamente
              </p>
              <p className="font-paragraph text-sm text-muted-text">
                Nuestro equipo de moderación lo revisará pronto
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Step 1: Category and Reason Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="font-heading font-bold text-foreground text-sm block mb-3">
                      Selecciona una categoría
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueCategories.map(category => (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedCategory(category);
                            setSelectedReason(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all font-paragraph text-sm font-semibold ${
                            selectedCategory === category
                              ? 'bg-gradient-to-r from-secondary to-accent text-white border-secondary'
                              : 'bg-white border-border/50 text-foreground hover:border-secondary/50'
                          }`}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <label className="font-heading font-bold text-foreground text-sm block">
                        Selecciona una razón específica
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {reasonsForCategory.map(reason => (
                          <motion.button
                            key={reason._id}
                            whileHover={{ x: 4 }}
                            onClick={() => setSelectedReason(reason)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              selectedReason?._id === reason._id
                                ? 'bg-secondary/10 border-secondary'
                                : 'bg-white border-border/50 hover:border-secondary/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-paragraph font-semibold text-foreground text-sm">
                                  {reason.label}
                                </p>
                                <p className="font-paragraph text-xs text-muted-text mt-1">
                                  Severidad: {reason.severity}/3
                                </p>
                              </div>
                              {selectedReason?._id === reason._id && (
                                <CheckCircle2 size={20} className="text-secondary" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2"
                    >
                      <AlertCircle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
                      <p className="font-paragraph text-sm text-destructive">{error}</p>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (selectedReason) {
                        setStep(2);
                        setError('');
                      } else {
                        setError('Por favor selecciona una razón');
                      }
                    }}
                    disabled={!selectedReason}
                    className="w-full py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-paragraph font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continuar <ChevronRight size={18} />
                  </motion.button>
                </div>
              )}

              {/* Step 2: Details and Evidence */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label className="font-heading font-bold text-foreground text-sm block mb-2">
                      Descripción detallada *
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe el problema en detalle (mínimo 20 caracteres)..."
                      className="w-full px-4 py-3 border-2 border-border/50 rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent bg-white transition-all resize-none"
                      rows={4}
                    />
                    <p className="font-paragraph text-xs text-muted-text mt-1">
                      {description.length}/20 caracteres mínimo
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="font-heading font-bold text-foreground text-sm block mb-2">
                      Evidencia (máximo 5 archivos)
                    </label>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-secondary/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload size={24} className="mx-auto mb-2 text-muted-text" />
                        <p className="font-paragraph text-sm text-foreground font-semibold">
                          Haz clic para subir archivos
                        </p>
                        <p className="font-paragraph text-xs text-muted-text mt-1">
                          Imágenes, PDF, documentos
                        </p>
                      </label>
                    </div>

                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-background rounded-lg"
                          >
                            <p className="font-paragraph text-sm text-foreground truncate">
                              {file.name}
                            </p>
                            <button
                              onClick={() => removeFile(idx)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message Selection */}
                  {messages.length > 0 && (
                    <div>
                      <label className="font-heading font-bold text-foreground text-sm block mb-2">
                        Mensajes relacionados (opcional)
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {messages.map(msg => (
                          <label
                            key={msg.id}
                            className="flex items-start gap-3 p-2 hover:bg-background rounded-lg cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(msg.id)}
                              onChange={() => toggleMessageSelection(msg.id)}
                              className="mt-1"
                            />
                            <p className="font-paragraph text-sm text-foreground flex-1">
                              {msg.text.substring(0, 60)}...
                            </p>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Block User Checkbox */}
                  <label className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg cursor-pointer border border-destructive/20">
                    <input
                      type="checkbox"
                      checked={blockUser}
                      onChange={e => setBlockUser(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-paragraph text-sm font-semibold text-foreground">
                        Bloquear usuario
                      </p>
                      <p className="font-paragraph text-xs text-muted-text">
                        No recibirás más mensajes de este usuario
                      </p>
                    </div>
                  </label>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-2"
                    >
                      <AlertCircle size={18} className="text-destructive flex-shrink-0 mt-0.5" />
                      <p className="font-paragraph text-sm text-destructive">{error}</p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-white border-2 border-border rounded-lg font-paragraph font-bold text-foreground hover:bg-background transition-all"
                    >
                      Atrás
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={loading || description.length < 20}
                      className="flex-1 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-paragraph font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? 'Enviando...' : 'Enviar Reporte'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
