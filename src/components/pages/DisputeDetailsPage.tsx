import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { DisputasdeTrabajos } from '@/entities';
import { ArrowLeft, AlertTriangle, Calendar, User, FileText } from 'lucide-react';

export default function DisputeDetailsPage() {
  const { disputeId } = useParams();
  const [dispute, setDispute] = useState<DisputasdeTrabajos | null>(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (disputeId) {
      loadDispute();
    }
  }, [disputeId]);

  const loadDispute = async () => {
    if (!disputeId) return;
    const disputeData = await BaseCrudService.getById<DisputasdeTrabajos>('jobdisputes', disputeId);
    setDispute(disputeData);
    setResolution(disputeData.resolutionDetails || '');
    setAdminNotes(disputeData.adminNotes || '');
  };

  const handleResolve = async () => {
    if (!disputeId || !dispute) return;
    
    await BaseCrudService.update<DisputasdeTrabajos>('jobdisputes', {
      _id: disputeId,
      status: 'resolved',
      resolutionDetails: resolution,
      adminNotes: adminNotes
    });
    
    loadDispute();
  };

  if (!dispute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-paragraph text-muted-text">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/admin/disputes" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver a Disputas</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Dispute Header */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={32} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  {dispute.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-text">
                    <Calendar size={16} />
                    <span className="font-paragraph">
                      {dispute.raisedAt ? new Date(dispute.raisedAt).toLocaleDateString('es-DO') : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-text">
                    <User size={16} />
                    <span className="font-paragraph">
                      Levantada por: {dispute.raisedByRole === 'client' ? 'Cliente' : 'Joseador'}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-paragraph font-semibold ${
                dispute.status === 'open' ? 'bg-destructive/10 text-destructive' :
                dispute.status === 'in_review' ? 'bg-primary/10 text-primary' :
                'bg-accent/10 text-accent'
              }`}>
                {dispute.status === 'open' ? 'Abierta' :
                 dispute.status === 'in_review' ? 'En Revisión' :
                 'Resuelta'}
              </span>
            </div>

            <div className="space-y-6">
              {/* Job Details */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  Detalles del Trabajo
                </h3>
                <div className="bg-background rounded-xl p-4">
                  <p className="font-paragraph text-foreground mb-2">
                    <span className="font-semibold">Trabajo:</span> {dispute.jobTitle}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="font-paragraph text-muted-text">Cliente: </span>
                      <span className="font-paragraph font-semibold text-foreground">
                        {dispute.clientDisplayName}
                      </span>
                    </div>
                    <div>
                      <span className="font-paragraph text-muted-text">Joseador: </span>
                      <span className="font-paragraph font-semibold text-foreground">
                        {dispute.joseadorDisplayName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                  Descripción de la Disputa
                </h3>
                <div className="bg-background rounded-xl p-4">
                  <p className="font-paragraph text-foreground whitespace-pre-line">
                    {dispute.description}
                  </p>
                </div>
              </div>

              {/* Resolution (if resolved) */}
              {dispute.status === 'resolved' && dispute.resolutionDetails && (
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                    Resolución
                  </h3>
                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                    <p className="font-paragraph text-foreground whitespace-pre-line">
                      {dispute.resolutionDetails}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Notes (if any) */}
              {dispute.adminNotes && (
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3">
                    Notas del Administrador
                  </h3>
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="font-paragraph text-foreground whitespace-pre-line">
                      {dispute.adminNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Form (if not resolved) */}
          {dispute.status !== 'resolved' && (
            <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Resolver Disputa
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                    <FileText size={20} className="text-primary" />
                    Detalles de la Resolución
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe cómo se resolvió la disputa..."
                    rows={6}
                    className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-heading font-semibold text-foreground mb-3">
                    <FileText size={20} className="text-primary" />
                    Notas Administrativas (Opcional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notas internas sobre la resolución..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResolve}
                  disabled={!resolution.trim()}
                  className={`w-full px-6 py-4 font-heading text-lg font-semibold rounded-xl transition-all ${
                    resolution.trim()
                      ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-md hover:shadow-lg cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Marcar como Resuelta
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
