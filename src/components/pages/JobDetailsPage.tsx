import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio, JobApplications } from '@/entities';
import { ArrowLeft, MapPin, DollarSign, Calendar, User, Briefcase, AlertCircle, Zap, Info, TrendingUp, MessageSquare, Award, Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { calculatePiquetes, getExpertiseDescription, type ExpertiseLevel } from '@/lib/piquete-calculator';
import { deductPiquetes, getPiqueteBalance } from '@/lib/piquete-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JoseadorInfo {
  email: string;
  name: string;
  nickname?: string;
  photo?: string;
}

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { member } = useMember();
  const { userRole } = useRoleStore();
  const [job, setJob] = useState<TrabajosdeServicio | null>(null);
  const [applications, setApplications] = useState<JobApplications[]>([]);
  const [joseadorInfoMap, setJoseadorInfoMap] = useState<Record<string, JoseadorInfo>>({});
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>('beginner');
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    proposedPrice: ''
  });
  const [piqueteInfo, setPiqueteInfo] = useState<ReturnType<typeof calculatePiquetes> | null>(null);
  const [currentPiqueteBalance, setCurrentPiqueteBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [selectedJoseador, setSelectedJoseador] = useState<JoseadorInfo | null>(null);
  const [showJoseadorModal, setShowJoseadorModal] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
      loadApplications();
    }
    // Load piquete balance for joseador
    if (userRole === 'joseador' && member?.loginEmail) {
      loadPiqueteBalance();
    }
  }, [jobId, userRole, member?.loginEmail]);

  // Load joseador info when applications are loaded
  useEffect(() => {
    if (applications.length > 0) {
      loadJoseadorInfo();
    }
  }, [applications]);

  // Update piquete calculation when expertise level or proposed price changes
  useEffect(() => {
    if (applicationData.proposedPrice) {
      // Calculate based on joseador's proposed price
      const proposedAmount = parseFloat(applicationData.proposedPrice);
      if (!isNaN(proposedAmount) && proposedAmount > 0) {
        const calculation = calculatePiquetes(proposedAmount, expertiseLevel);
        setPiqueteInfo(calculation);
      }
    } else if (job?.budget) {
      // Show calculation based on client's budget when no proposed price is entered
      const calculation = calculatePiquetes(job.budget, expertiseLevel);
      setPiqueteInfo(calculation);
    }
  }, [expertiseLevel, applicationData.proposedPrice, job?.budget]);

  const loadPiqueteBalance = async () => {
    if (!member?.loginEmail) return;
    const balance = await getPiqueteBalance(member.loginEmail);
    setCurrentPiqueteBalance(balance);
  };

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

  const loadJoseadorInfo = async () => {
    const infoMap: Record<string, JoseadorInfo> = {};
    
    for (const app of applications) {
      if (app.joseadorId && !infoMap[app.joseadorId]) {
        // Try to get member info from Members/FullData collection
        const { items } = await BaseCrudService.getAll('Members/FullData');
        const memberData = items.find((m: any) => m.loginEmail === app.joseadorId);
        
        if (memberData) {
          infoMap[app.joseadorId] = {
            email: memberData.loginEmail,
            name: memberData.contact?.firstName && memberData.contact?.lastName 
              ? `${memberData.contact.firstName} ${memberData.contact.lastName}`
              : memberData.profile?.nickname || memberData.loginEmail,
            nickname: memberData.profile?.nickname,
            photo: memberData.profile?.photo?.url
          };
        } else {
          // Fallback if member not found
          infoMap[app.joseadorId] = {
            email: app.joseadorId,
            name: app.joseadorId
          };
        }
      }
    }
    
    setJoseadorInfoMap(infoMap);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!piqueteInfo || !member?.loginEmail) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Deduct piquetes from joseador's balance
      const deductionResult = await deductPiquetes(
        member.loginEmail,
        job?.budget || 0,
        expertiseLevel
      );

      if (!deductionResult.success) {
        setSubmissionError(deductionResult.error || 'Error al deducir piquetes');
        setIsSubmitting(false);
        return;
      }

      // Create application record
      const newApplication: JobApplications = {
        _id: crypto.randomUUID(),
        jobId: jobId,
        joseadorId: member.loginEmail,
        status: 'pending',
        applicationDate: new Date().toISOString(),
        coverLetter: applicationData.coverLetter,
        proposedPrice: parseFloat(applicationData.proposedPrice)
      };

      await BaseCrudService.create('jobapplications', newApplication);
      
      // Update UI
      setShowApplicationForm(false);
      setApplicationData({ coverLetter: '', proposedPrice: '' });
      setExpertiseLevel('beginner');
      
      // Reload data
      await loadApplications();
      await loadPiqueteBalance();
      
      // Show success message
      setSubmissionError(null);
    } catch (error) {
      console.error('Error applying to job:', error);
      setSubmissionError('Error al enviar la aplicación. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
              className="sticky top-24 space-y-6"
            >
              {userRole === 'joseador' ? (
                <>
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-secondary via-support to-accent rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={24} className="text-white" />
                        <h3 className="font-heading text-2xl font-bold">Aplicar Ahora</h3>
                      </div>
                      <p className="font-paragraph text-sm opacity-90">
                        Destaca tu propuesta entre los demás Joseadores
                      </p>
                    </div>
                  </div>

                  {/* Joseame Balance Card */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border-2 border-secondary/30 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-secondary/10 rounded-lg">
                            <Zap size={20} className="text-secondary" />
                          </div>
                          <span className="font-paragraph text-sm text-muted-text">Joseames Disponibles</span>
                        </div>
                        <p className="font-heading text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                          {currentPiqueteBalance}
                        </p>
                      </div>
                      <div className="p-3 bg-secondary/10 rounded-xl">
                        <TrendingUp size={24} className="text-secondary" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="font-paragraph text-xs text-muted-text">
                        Cada aplicación cuesta joseames según tu nivel de experiencia
                      </p>
                    </div>
                  </motion.div>

                  {!showApplicationForm ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {/* Info Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
                          <div className="p-2 bg-accent/10 rounded-lg mb-2 w-fit">
                            <Award size={18} className="text-accent" />
                          </div>
                          <p className="font-heading text-sm font-bold text-foreground">Destaca</p>
                          <p className="font-paragraph text-xs text-muted-text mt-1">Sé el elegido</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
                          <div className="p-2 bg-primary/10 rounded-lg mb-2 w-fit">
                            <MessageSquare size={18} className="text-primary" />
                          </div>
                          <p className="font-heading text-sm font-bold text-foreground">Comunica</p>
                          <p className="font-paragraph text-xs text-muted-text mt-1">Tu propuesta</p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-secondary via-accent to-support text-white font-heading font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles size={20} />
                        Aplicar Ahora
                      </motion.button>
                      
                      {piqueteInfo && (
                        <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-4 border border-secondary/20">
                          <div className="flex items-center justify-between">
                            <span className="font-paragraph text-sm text-foreground">Costo estimado:</span>
                            <span className="font-heading font-bold text-secondary">
                              {piqueteInfo.totalPiquetes} 
                              <span className="text-xs ml-1">joseame{piqueteInfo.totalPiquetes > 1 ? 's' : ''}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.form 
                      onSubmit={handleApply} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 border border-border shadow-lg space-y-5"
                    >
                      {/* Proposed Price */}
                      <div>
                        <label className="font-heading font-bold text-foreground mb-3 block flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign size={18} className="text-primary" />
                          </div>
                          Tu Propuesta de Precio
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 font-heading font-bold text-muted-text">RD$</span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={applicationData.proposedPrice}
                            onChange={(e) => setApplicationData({ ...applicationData, proposedPrice: e.target.value })}
                            placeholder="5000"
                            className="w-full pl-12 pr-4 py-3 border-2 border-primary/20 rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          />
                        </div>
                        
                        {/* Joseame Calculator */}
                        {piqueteInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-gradient-to-br from-secondary/10 to-accent/10 border-2 border-secondary/30 rounded-xl"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Zap size={18} className="text-secondary" />
                              <span className="font-heading font-bold text-foreground">Cálculo de Joseames</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                                <span className="font-paragraph text-sm text-foreground">Total a cobrar:</span>
                                <span className="font-heading text-lg font-bold text-secondary">
                                  {piqueteInfo.totalPiquetes}
                                </span>
                              </div>
                              <div className="text-xs text-muted-text space-y-1 pt-2">
                                <p className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                                  Base: {piqueteInfo.basePiquetes} joseame{piqueteInfo.basePiquetes > 1 ? 's' : ''}
                                </p>
                                {expertiseLevel !== 'beginner' && (
                                  <p className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                    Ajuste {expertiseLevel === 'intermediate' ? 'Intermedio' : 'Experto'}: +{Math.round((piqueteInfo.expertiseMultiplier - 1) * 100)}%
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Insufficient Balance Warning */}
                            {currentPiqueteBalance < piqueteInfo.totalPiquetes && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2"
                              >
                                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-heading text-xs font-bold text-red-700">
                                    Joseames insuficientes
                                  </p>
                                  <p className="font-paragraph text-xs text-red-600 mt-1">
                                    Necesitas {piqueteInfo.totalPiquetes} pero tienes {currentPiqueteBalance}
                                  </p>
                                  <Link to="/joseador/buy-joseames" className="font-heading text-xs font-bold text-red-700 underline mt-1 inline-block">
                                    Compra más joseames →
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Expertise Level */}
                      <div>
                        <label className="font-heading font-bold text-foreground mb-3 block flex items-center gap-2">
                          <div className="p-2 bg-accent/10 rounded-lg">
                            <Award size={18} className="text-accent" />
                          </div>
                          Nivel de Experiencia
                        </label>
                        <select
                          value={expertiseLevel}
                          onChange={(e) => setExpertiseLevel(e.target.value as ExpertiseLevel)}
                          className="w-full px-4 py-3 border-2 border-accent/20 rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                        >
                          <option value="beginner">🌱 Principiante (Sin ajuste)</option>
                          <option value="intermediate">⭐ Intermedio (+25%)</option>
                          <option value="expert">👑 Experto (+50%)</option>
                        </select>
                      </div>

                      {/* Cover Letter */}
                      <div>
                        <label className="font-heading font-bold text-foreground mb-3 block flex items-center gap-2">
                          <div className="p-2 bg-secondary/10 rounded-lg">
                            <MessageSquare size={18} className="text-secondary" />
                          </div>
                          Carta de Presentación
                        </label>
                        <textarea
                          required
                          value={applicationData.coverLetter}
                          onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                          placeholder="Explica por qué eres el mejor candidato para este trabajo..."
                          rows={5}
                          className="w-full px-4 py-3 border-2 border-secondary/20 rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none transition-all"
                        />
                      </div>

                      {/* Error Message */}
                      {submissionError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
                        >
                          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="font-paragraph text-sm text-red-700">{submissionError}</p>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setShowApplicationForm(false);
                            setExpertiseLevel('beginner');
                            setSubmissionError(null);
                          }}
                          className="flex-1 px-4 py-3 border-2 border-border rounded-xl font-heading font-bold hover:bg-background transition-colors"
                        >
                          Cancelar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting || (piqueteInfo && currentPiqueteBalance < piqueteInfo.totalPiquetes)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-heading font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Sparkles size={18} />
                          {isSubmitting ? 'Enviando...' : 'Enviar'}
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-border shadow-lg text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Info size={32} className="text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Panel de Cliente
                  </h3>
                  <p className="font-paragraph text-muted-text mb-4">
                    Aquí verás y podrás gestionar todas las aplicaciones que recibas para este trabajo.
                  </p>
                  <p className="font-paragraph text-sm text-muted-text">
                    Revisa las propuestas en la sección de abajo y elige al mejor Joseador.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Joseador Info Modal */}
      <Dialog open={showJoseadorModal} onOpenChange={setShowJoseadorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Información del Joseador</DialogTitle>
          </DialogHeader>
          {selectedJoseador && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                  {selectedJoseador.photo ? (
                    <Image src={selectedJoseador.photo} alt={selectedJoseador.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {selectedJoseador.name}
                </h3>
                {selectedJoseador.nickname && (
                  <p className="font-paragraph text-sm text-muted-text">
                    @{selectedJoseador.nickname}
                  </p>
                )}
              </div>
              <div className="bg-background rounded-xl p-4 border border-border">
                <p className="font-paragraph text-sm text-muted-text mb-2">Correo Electrónico</p>
                <p className="font-paragraph font-semibold text-foreground break-all">
                  {selectedJoseador.email}
                </p>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}