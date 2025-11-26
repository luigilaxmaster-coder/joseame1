import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrabajosdeServicio } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Calendar, Eye } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ClientMyJobsPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

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

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/client/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
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
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
              Mis Solicitudes
            </h1>
            <p className="font-paragraph text-muted-text">
              Gestiona los trabajos que has publicado
            </p>
          </div>

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
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
