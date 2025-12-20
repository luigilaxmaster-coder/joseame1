import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Zap,
  XCircle,
  TrendingUp,
  Shield,
  User,
} from 'lucide-react';

interface TimelineEvent {
  _id: string;
  action: string;
  actorId: string;
  meta?: Record<string, any>;
  createdAt: string | Date;
}

interface JobTimelineProps {
  jobOrderId: string;
  events: TimelineEvent[];
  isLoading?: boolean;
}

const getEventIcon = (action: string) => {
  switch (action) {
    case 'COMPLETION_PROPOSED':
      return <CheckCircle className="w-5 h-5 text-secondary" />;
    case 'COMPLETION_ACCEPTED':
      return <CheckCircle className="w-5 h-5 text-accent" />;
    case 'COMPLETION_REJECTED':
      return <XCircle className="w-5 h-5 text-destructive" />;
    case 'REWORK_REQUESTED':
      return <AlertCircle className="w-5 h-5 text-primary" />;
    case 'DISPUTE_OPENED':
      return <Shield className="w-5 h-5 text-destructive" />;
    case 'STATUS_CHANGED':
      return <TrendingUp className="w-5 h-5 text-secondary" />;
    case 'MESSAGE_SENT':
      return <MessageSquare className="w-5 h-5 text-primary" />;
    default:
      return <Clock className="w-5 h-5 text-muted-text" />;
  }
};

const getEventLabel = (action: string): string => {
  const labels: Record<string, string> = {
    COMPLETION_PROPOSED: 'Finalización Propuesta',
    COMPLETION_ACCEPTED: 'Finalización Aceptada',
    COMPLETION_REJECTED: 'Finalización Rechazada',
    REWORK_REQUESTED: 'Retrabajar Solicitado',
    DISPUTE_OPENED: 'Disputa Abierta',
    STATUS_CHANGED: 'Estado Cambiado',
    MESSAGE_SENT: 'Mensaje Enviado',
  };
  return labels[action] || action;
};

const getEventDescription = (action: string, meta?: Record<string, any>): string => {
  switch (action) {
    case 'COMPLETION_PROPOSED':
      return `Propuesta de finalización por ${meta?.proposedByRole === 'client' ? 'cliente' : 'joseador'}`;
    case 'COMPLETION_ACCEPTED':
      return 'La finalización fue aceptada';
    case 'COMPLETION_REJECTED':
      return `Finalización rechazada: ${meta?.context || 'razón no especificada'}`;
    case 'REWORK_REQUESTED':
      return 'Se solicitó retrabajar';
    case 'DISPUTE_OPENED':
      return 'Se abrió una disputa';
    case 'STATUS_CHANGED':
      return `Estado cambió a: ${meta?.newStatus || 'desconocido'}`;
    case 'MESSAGE_SENT':
      return 'Nuevo mensaje en el chat';
    default:
      return 'Evento registrado';
  }
};

const getEventColor = (action: string): string => {
  switch (action) {
    case 'COMPLETION_PROPOSED':
      return 'bg-secondary/10 border-secondary/30';
    case 'COMPLETION_ACCEPTED':
      return 'bg-accent/10 border-accent/30';
    case 'COMPLETION_REJECTED':
      return 'bg-destructive/10 border-destructive/30';
    case 'REWORK_REQUESTED':
      return 'bg-primary/10 border-primary/30';
    case 'DISPUTE_OPENED':
      return 'bg-destructive/10 border-destructive/30';
    case 'STATUS_CHANGED':
      return 'bg-secondary/10 border-secondary/30';
    case 'MESSAGE_SENT':
      return 'bg-primary/10 border-primary/30';
    default:
      return 'bg-background border-border';
  }
};

export default function JobTimeline({ jobOrderId, events, isLoading = false }: JobTimelineProps) {
  const [sortedEvents, setSortedEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Sort events by date (newest first)
    const sorted = [...events].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    setSortedEvents(sorted);
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <Clock className="w-8 h-8 text-secondary" />
        </div>
      </div>
    );
  }

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-muted-text/30 mx-auto mb-3" />
        <p className="font-paragraph text-muted-text">No hay eventos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="relative"
        >
          {/* Timeline line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-6 top-14 w-0.5 h-8 bg-gradient-to-b from-border to-transparent" />
          )}

          {/* Event card */}
          <div className={`flex gap-4 p-4 rounded-xl border-2 ${getEventColor(event.action)}`}>
            {/* Icon */}
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-border">
              {getEventIcon(event.action)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h4 className="font-heading font-semibold text-foreground">
                  {getEventLabel(event.action)}
                </h4>
                <span className="font-paragraph text-xs text-muted-text whitespace-nowrap">
                  {new Date(event.createdAt).toLocaleDateString('es-DO', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="font-paragraph text-sm text-muted-text mb-2">
                {getEventDescription(event.action, event.meta)}
              </p>

              {/* Additional metadata */}
              {event.meta && Object.keys(event.meta).length > 0 && (
                <div className="text-xs text-muted-text space-y-1">
                  {event.meta.proposedByRole && (
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      <span>
                        Por: <span className="font-semibold">{
                          event.meta.proposedByRole === 'client' ? 'Cliente' : 'Joseador'
                        }</span>
                      </span>
                    </p>
                  )}
                  {event.meta.newStatus && (
                    <p className="flex items-center gap-2">
                      <TrendingUp size={14} />
                      <span>
                        Nuevo estado: <span className="font-semibold">{event.meta.newStatus}</span>
                      </span>
                    </p>
                  )}
                  {event.meta.outcome && (
                    <p className="flex items-center gap-2">
                      <AlertCircle size={14} />
                      <span>
                        Resultado: <span className="font-semibold">{event.meta.outcome}</span>
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
