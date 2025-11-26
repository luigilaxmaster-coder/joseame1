import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { DisputasdeTrabajos } from '@/entities';
import { ArrowLeft, AlertTriangle, Calendar, User } from 'lucide-react';

export default function DisputesPage() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<DisputasdeTrabajos[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    const { items } = await BaseCrudService.getAll<DisputasdeTrabajos>('jobdisputes');
    setDisputes(items);
  };

  const filteredDisputes = filter === 'all' 
    ? disputes 
    : disputes.filter(d => filter === 'open' ? d.status === 'open' : d.status === 'resolved');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-4xl font-bold text-foreground">
              Gestión de Disputas
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'open', label: 'Abiertas' },
              { value: 'resolved', label: 'Resueltas' }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-6 py-3 rounded-xl font-paragraph font-semibold transition-all ${
                  filter === item.value
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'bg-white text-foreground border border-border hover:shadow-md'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Disputes List */}
          {filteredDisputes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <AlertTriangle size={64} className="text-muted-text mx-auto mb-4" />
              <p className="font-paragraph text-muted-text">No hay disputas en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <motion.div
                  key={dispute._id}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/admin/dispute/${dispute._id}`)}
                  className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle size={24} className="text-destructive" />
                        <h3 className="font-heading text-xl font-semibold text-foreground">
                          {dispute.title}
                        </h3>
                      </div>
                      <p className="font-paragraph text-muted-text mb-3">
                        {dispute.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-text">
                          <User size={16} />
                          <span className="font-paragraph">
                            Trabajo: {dispute.jobTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-text">
                          <Calendar size={16} />
                          <span className="font-paragraph">
                            {dispute.raisedAt ? new Date(dispute.raisedAt).toLocaleDateString('es-DO') : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-text">
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
                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
