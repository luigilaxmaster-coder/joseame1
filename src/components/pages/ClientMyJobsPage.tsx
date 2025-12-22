import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrabajosdeServicio } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Calendar, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useJobStore } from '@/store/jobStore';
import DashboardWithBottomTabs from '@/components/DashboardWithBottomTabs';

function ClientMyJobsContent() {
  const navigate = useNavigate();
  const { member } = useMember();
  const { setJobToDuplicate } = useJobStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadClientJobs();
  }, [member]);

  const loadClientJobs = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
      // Filter jobs published by the current client
      // In a real app, you'd have a clientId field in the job
      // For now, we'll show all jobs (you should add clientId to servicejobs collection)
      setJobs(items);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setDeletingId(jobId);
      await BaseCrudService.delete('servicejobs', jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateJob = (job: TrabajosdeServicio) => {
    setJobToDuplicate(job);
    navigate('/client/publish-job');
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);

  return (
    <div className="min-h-screen bg-background pb-[90px]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Mis Solicitudes
          </h1>
          <p className="font-paragraph text-muted-text text-sm">
            Gestiona los trabajos que has publicado
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'open', label: 'Abiertos' },
              { value: 'in_progress', label: 'En Progreso' },
              { value: 'completed', label: 'Completados' }
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

          {/* Jobs List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <p className="font-paragraph text-muted-text">Cargando tus solicitudes...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <p className="font-paragraph text-muted-text mb-4">No tienes solicitudes en esta categoría</p>
              <Link to="/client/publish-job">
                <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-paragraph font-semibold hover:shadow-lg transition-shadow">
                  Publicar Nueva Solicitud
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all"
                >
                  {job.jobImage && (
                    <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-background">
                      <Image src={job.jobImage} alt={job.jobTitle} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-paragraph rounded-full">
                      {job.serviceCategory}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                    {job.jobTitle}
                  </h3>
                  <p className="font-paragraph text-muted-text mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-muted-text">
                      <MapPin size={16} />
                      <span className="font-paragraph text-sm">{job.locationAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-text">
                      <Calendar size={16} />
                      <span className="font-paragraph text-sm">
                        {job.postedDate ? new Date(job.postedDate).toLocaleDateString('es-DO') : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-heading text-lg font-bold text-primary">
                      RD$ {job.budget?.toLocaleString()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-paragraph ${
                      job.status === 'open' ? 'bg-accent/10 text-accent' :
                      job.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                      'bg-muted-text/10 text-muted-text'
                    }`}>
                      {job.status === 'open' ? 'Abierto' :
                       job.status === 'in_progress' ? 'En Progreso' :
                       'Completado'}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="w-full mt-4 px-4 py-2 bg-primary/10 text-primary rounded-xl font-paragraph font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </motion.button>

                  {/* Duplicate Button - Only for completed jobs */}
                  {job.status === 'completed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDuplicateJob(job)}
                      className="w-full mt-3 px-4 py-2 bg-accent/10 text-accent rounded-xl font-paragraph font-semibold hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Solicitar de Nuevo
                    </motion.button>
                  )}
                  
                  {/* Delete Button */}
                  {showDeleteConfirm === job._id ? (
                    <div className="mt-3 p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                      <p className="font-paragraph text-sm text-foreground mb-3">
                        ¿Estás seguro de que deseas eliminar este trabajo?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-3 py-2 bg-white border border-border rounded-lg font-paragraph text-sm font-semibold hover:bg-background transition-colors"
                        >
                          Cancelar
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={deletingId === job._id}
                          className="flex-1 px-3 py-2 bg-destructive text-white rounded-lg font-paragraph text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50"
                        >
                          {deletingId === job._id ? 'Eliminando...' : 'Eliminar'}
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDeleteConfirm(job._id)}
                      className="w-full mt-3 px-4 py-2 bg-destructive/10 text-destructive rounded-xl font-paragraph font-semibold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ClientMyJobsPage() {
  return (
    <DashboardWithBottomTabs role="client">
      <ClientMyJobsContent />
    </DashboardWithBottomTabs>
  );
}
