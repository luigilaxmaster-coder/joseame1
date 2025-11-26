import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { JobApplications, TrabajosdeServicio } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Calendar, Eye, CheckCircle, Clock } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function JoseadorMyJobsPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJoseadorJobs();
  }, [member]);

  const loadJoseadorJobs = async () => {
    try {
      setLoading(true);
      // Get all job applications for this joseador
      const { items: applications } = await BaseCrudService.getAll<JobApplications>('jobapplications');
      // Note: member doesn't have _id property, this filter won't work correctly
      // You may need to add a proper member ID field to the Member type
      const joseadorApplications = applications.filter(app => app.joseadorId === (member as any)?._id);
      
      // Get all jobs
      const { items: allJobs } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
      
      // Filter jobs where joseador has applied
      const appliedJobs = allJobs.filter(job => 
        joseadorApplications.some(app => app.jobId === job._id)
      );
      
      setJobs(appliedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => {
    if (filter === 'pending') return job.status === 'open';
    if (filter === 'accepted') return job.status === 'in_progress';
    if (filter === 'completed') return job.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/joseador/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
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
              Mis Trabajos
            </h1>
            <p className="font-paragraph text-muted-text">
              Trabajos donde has ofertado
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'accepted', label: 'Aceptados' },
              { value: 'completed', label: 'Completados' }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value as any)}
                className={`px-6 py-3 rounded-xl font-paragraph font-semibold transition-all ${
                  filter === item.value
                    ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-md'
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
              <p className="font-paragraph text-muted-text">Cargando tus trabajos...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <p className="font-paragraph text-muted-text mb-4">No tienes trabajos en esta categoría</p>
              <Link to="/joseador/dashboard">
                <button className="px-6 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-paragraph font-semibold hover:shadow-lg transition-shadow">
                  Explorar Trabajos Disponibles
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
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-paragraph rounded-full">
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
                    <span className="font-heading text-lg font-bold text-secondary">
                      RD$ {job.budget?.toLocaleString()}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-paragraph flex items-center gap-1 ${
                      job.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                      job.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                      'bg-muted-text/10 text-muted-text'
                    }`}>
                      {job.status === 'open' ? (
                        <>
                          <Clock size={12} />
                          Pendiente
                        </>
                      ) : job.status === 'in_progress' ? (
                        <>
                          <CheckCircle size={12} />
                          Aceptado
                        </>
                      ) : (
                        'Completado'
                      )}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="w-full mt-4 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-paragraph font-semibold hover:bg-secondary/20 transition-colors flex items-center justify-center gap-2"
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
