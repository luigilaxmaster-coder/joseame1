import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio, JobApplications } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Calendar, User, Briefcase, AlertCircle } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { calculatePiquetes, getExpertiseDescription, type ExpertiseLevel } from '@/lib/piquete-calculator';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { member } = useMember();
  const { userRole } = useRoleStore();
  const [job, setJob] = useState<TrabajosdeServicio | null>(null);
  const [applications, setApplications] = useState<JobApplications[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>('beginner');
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedPrice: ''
  });
  const [piqueteInfo, setPiqueteInfo] = useState<ReturnType<typeof calculatePiquetes> | null>(null);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
      loadApplications();
    }
  }, [jobId]);

  // Update piquete calculation when expertise level changes
  useEffect(() => {
    if (job?.budget) {
      const calculation = calculatePiquetes(job.budget, expertiseLevel);
      setPiqueteInfo(calculation);
    }
  }, [expertiseLevel, job?.budget]);

  const loadJobDetails = async () => {
    if (!jobId) return;
    const jobData = await BaseCrudService.getById<TrabajosdeServicio>('servicejobs', jobId);
    setJob(jobData);
  };

  const loadApplications = async () => {
    const { items } = await BaseCrudService.getAll<JobApplications>('jobapplications');
    const jobApps = items.filter(app => app.jobId === jobId);
    setApplications(jobApps);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!piqueteInfo) return;
    
    const newApplication: JobApplications = {
      _id: crypto.randomUUID(),
      jobId: jobId,
      joseadorId: member?.loginEmail,
      status: 'pending',
      applicationDate: new Date().toISOString(),
      coverLetter: applicationData.coverLetter,
      proposedPrice: parseFloat(applicationData.proposedPrice)
    };

    await BaseCrudService.create('jobapplications', newApplication);
    setShowApplicationForm(false);
    setApplicationData({ coverLetter: '', proposedPrice: '' });
    setExpertiseLevel('beginner');
    loadApplications();
  };

  const handleApplicationAction = async (applicationId: string, action: 'accepted' | 'rejected') => {
    await BaseCrudService.update('jobapplications', {
      _id: applicationId,
      status: action
    });
    
    // If accepting, create a chat automatically
    if (action === 'accepted') {
      const application = applications.find(app => app._id === applicationId);
      if (application) {
        // In a real app, you'd create a chat record here
        // For now, we'll just navigate to inbox
        setTimeout(() => {
          navigate('/client/inbox');
        }, 500);
      }
    }
    
    loadApplications();
  };

  if (!job) {
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
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-border shadow-lg"
            >
              {job.jobImage && (
                <div className="w-full h-64 mb-6 rounded-xl overflow-hidden bg-background">
                  <Image src={job.jobImage} alt={job.jobTitle} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-paragraph rounded-full">
                  {job.serviceCategory}
                </span>
              </div>

              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                {job.jobTitle}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 text-muted-text">
                  <DollarSign size={20} />
                  <span className="font-paragraph">
                    <span className="font-semibold text-foreground">RD$ {job.budget?.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-text">
                  <MapPin size={20} />
                  <span className="font-paragraph">{job.locationAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-text">
                  <Calendar size={20} />
                  <span className="font-paragraph">
                    {job.postedDate ? new Date(job.postedDate).toLocaleDateString('es-DO') : 'Fecha no disponible'}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                  Descripción del Trabajo
                </h2>
                <p className="font-paragraph text-foreground leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                  Estado del Trabajo
                </h2>
                <span className={`inline-block px-4 py-2 rounded-xl text-sm font-paragraph font-semibold ${
                  job.status === 'open' ? 'bg-accent/10 text-accent' :
                  job.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                  'bg-muted-text/10 text-muted-text'
                }`}>
                  {job.status === 'open' ? 'Abierto - Aceptando Aplicaciones' :
                   job.status === 'in_progress' ? 'En Progreso' :
                   'Completado'}
                </span>
              </div>

              {/* Applications List */}
              {applications.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
                    Aplicaciones Recibidas ({applications.length})
                  </h2>
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app._id} className="bg-background rounded-xl p-4 border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                              <User size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="font-heading font-semibold text-foreground">Joseador</p>
                              <p className="font-paragraph text-sm text-muted-text">
                                {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString('es-DO') : ''}
                              </p>
                            </div>
                          </div>
                          <span className="font-heading text-lg font-bold text-secondary">
                            RD$ {app.proposedPrice?.toLocaleString()}
                          </span>
                        </div>
                        <p className="font-paragraph text-foreground">{app.coverLetter}</p>
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-paragraph ${
                            app.status === 'pending' ? 'bg-primary/10 text-primary' :
                            app.status === 'accepted' ? 'bg-accent/10 text-accent' :
                            'bg-muted-text/10 text-muted-text'
                          }`}>
                            {app.status === 'pending' ? 'Pendiente' :
                             app.status === 'accepted' ? 'Aceptada' :
                             'Rechazada'}
                          </span>
                          {userRole === 'client' && app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApplicationAction(app._id, 'accepted')}
                                className="px-3 py-1 bg-accent text-white text-xs font-paragraph rounded-lg hover:bg-accent/90 transition-colors"
                              >
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleApplicationAction(app._id, 'rejected')}
                                className="px-3 py-1 bg-destructive text-white text-xs font-paragraph rounded-lg hover:bg-destructive/90 transition-colors"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-lg sticky top-24"
            >
              {userRole === 'joseador' ? (
                <>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                    Aplicar a este Trabajo
                  </h3>

                  {!showApplicationForm ? (
                    <div>
                      <p className="font-paragraph text-muted-text mb-6">
                        Envía tu propuesta para este trabajo y destaca entre los demás Joseadores.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-secondary via-accent to-support text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        Aplicar Ahora
                      </motion.button>
                      <p className="font-paragraph text-xs text-muted-text text-center mt-4">
                        Costo: 1 piquete
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4">
                      <div>
                        <label className="font-paragraph font-semibold text-foreground mb-2 block">
                          Tu Propuesta de Precio (RD$)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={applicationData.proposedPrice}
                          onChange={(e) => setApplicationData({ ...applicationData, proposedPrice: e.target.value })}
                          placeholder="5000"
                          className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>

                      <div>
                        <label className="font-paragraph font-semibold text-foreground mb-2 block">
                          Carta de Presentación
                        </label>
                        <textarea
                          required
                          value={applicationData.coverLetter}
                          onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                          placeholder="Explica por qué eres el mejor candidato..."
                          rows={5}
                          className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowApplicationForm(false);
                            setExpertiseLevel('beginner');
                          }}
                          className="flex-1 px-4 py-3 border border-border rounded-xl font-paragraph font-semibold hover:bg-background transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-paragraph font-semibold hover:shadow-lg transition-shadow"
                        >
                          Enviar Aplicación
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="font-paragraph text-muted-text mb-4">
                    Como cliente, puedes aceptar o rechazar las aplicaciones que recibas.
                  </p>
                  <p className="font-paragraph text-sm text-muted-text">
                    Revisa las aplicaciones en la sección de abajo.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
