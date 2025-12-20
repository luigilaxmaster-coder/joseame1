import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface RejectionConfirmationBarProps {
  show: boolean;
  rejectionId?: string;
  context: 'GENERAL' | 'COMPLETION';
  reasonLabel?: string;
  onDismiss: () => void;
}

export default function RejectionConfirmationBar({
  show,
  rejectionId,
  context,
  reasonLabel,
  onDismiss,
}: RejectionConfirmationBarProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 max-w-md z-50"
        >
          <motion.div
            className="bg-gradient-to-r from-accent to-support rounded-2xl shadow-2xl border border-accent/30 overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-4 flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle size={20} className="text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex-1 min-w-0"
              >
                <h3 className="font-heading font-bold text-white text-sm">
                  ¡Rechazo Registrado!
                </h3>
                <p className="font-paragraph text-xs text-white/90 mt-1">
                  {context === 'COMPLETION'
                    ? 'La propuesta de finalización ha sido rechazada.'
                    : 'El trabajo ha sido rechazado.'}
                </p>
                {reasonLabel && (
                  <p className="font-paragraph text-xs text-white/80 mt-2">
                    <span className="font-semibold">Razón:</span> {reasonLabel}
                  </p>
                )}
                {rejectionId && (
                  <p className="font-paragraph text-xs text-white/70 mt-2">
                    ID: {rejectionId.substring(0, 8)}...
                  </p>
                )}
              </motion.div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={18} className="text-white" />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-1 bg-white/30 origin-left"
              onAnimationComplete={onDismiss}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
