import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio, JobApplications } from '@/entities';
import { Plus, MapPin, List, Map, Search, LogOut, User, Briefcase, MessageSquare, RefreshCw, RotateCcw, TrendingUp, Clock, CheckCircle2, AlertCircle, Eye, Users, Flame } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useJobStore } from '@/store/jobStore';

export default function ClientDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const { setJobToDuplicate } = useJobStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [applications, setApplications] = useState<JobApplications[]>([]);
  const [newAppIds, setNewAppIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousAppsRef = useRef<string[]>([]);

  useEffect(() => {
    setUserRole('client');
    loadJobs();
    loadApplications();
    
    // Set up auto-refresh every 5 seconds for live updates
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadApplications();
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, []);

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    setJobs(items);
  };

  const loadApplications = async () => {
    const { items } = await BaseCrudService.getAll<JobApplications>('jobapplications');
    
    // Detect new applications
    const currentAppIds = items.map(app => app._id);
    const newIds = currentAppIds.filter(id => !previousAppsRef.current.includes(id));
    
    if (newIds.length > 0) {
      setNewAppIds(new Set(newIds));
      // Remove "new" badge after 10 seconds
      setTimeout(() => {
        setNewAppIds(new Set());
      }, 10000);
    }
    
    previousAppsRef.current = currentAppIds;
    setApplications(items);
  };

  const handleDuplicateJob = (job: TrabajosdeServicio) => {
    setJobToDuplicate(job);
    navigate('/client/publish-job');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || job.serviceCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Plomería', 'Electricidad', 'Limpieza', 'Construcción', 'Jardinería', 'Tecnología'];

  // Calculate stats
  const openJobs = jobs.filter(j => j.status === 'open').length;
  const inProgressJobs = jobs.filter(j => j.status === 'in_progress').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      {/* Header - Optimized */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-1.5 md:py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-base md:text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
              JOSEAME
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/client/dashboard" className="font-paragraph text-foreground font-semibold hover:text-primary transition-colors relative group">
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/client/my-jobs" className="font-paragraph text-foreground hover:text-primary transition-colors relative group">
                Mis Trabajos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/client/inbox" className="font-paragraph text-foreground hover:text-primary transition-colors relative group">
                Mensajes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>
            <div className="flex items-center gap-1 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="font-paragraph text-xs text-muted-text font-medium hidden md:block">Cliente</span>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setUserRole('joseador');
                    navigate('/joseador/dashboard');
                  }}
                  className="p-1 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all text-white"
                  title="Cambiar a Joseador"
                >
                  <RefreshCw size={14} className="md:w-4 md:h-4" />
                </motion.button>
              </div>
              <Link to="/profile">
                <button className="flex items-center gap-1 md:gap-2 px-1.5 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl hover:bg-background transition-colors">
                  <User size={14} className="text-muted-text md:w-4 md:h-4" />
                  <span className="font-paragraph text-xs md:text-sm text-foreground hidden md:block">
                    {member?.profile?.nickname || 'Perfil'}
                  </span>
                </button>
              </Link>
              <button
                onClick={actions.logout}
                className="flex items-center gap-1 md:gap-2 px-1.5 md:px-4 py-1 md:py-2 text-muted-text hover:text-foreground transition-colors"
              >
                <LogOut size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content - Optimized */}
      <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-3 md:py-12 relative z-10">
        {/* Welcome Section - Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 md:mb-12"
        >
          <h1 className="font-heading text-xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-0.5 md:mb-3">
            ¡Bienvenido, {member?.profile?.nickname || 'Cliente'}!
          </h1>
          <p className="font-paragraph text-xs md:text-xl text-muted-text max-w-2xl">Gestiona tus trabajos, encuentra joseadores y supervisa tus proyectos</p>
        </motion.div>

        {/* Stats Section - Optimized */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-12"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-8 border border-primary/20">
              <div className="flex items-center justify-between mb-1 md:mb-4">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <AlertCircle className="text-primary w-4 h-4 md:w-5 md:h-5" />
                </div>
                <TrendingUp className="text-primary/50 w-3 h-3 md:w-4 md:h-4" />
              </div>
              <p className="font-paragraph text-muted-text text-xs md:text-sm mb-0.5">Trabajos Abiertos</p>
              <h3 className="font-heading text-xl md:text-4xl font-bold text-primary">{openJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-8 border border-secondary/20">
              <div className="flex items-center justify-between mb-1 md:mb-4">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Clock className="text-secondary w-4 h-4 md:w-5 md:h-5" />
                </div>
                <TrendingUp className="text-secondary/50 w-3 h-3 md:w-4 md:h-4" />
              </div>
              <p className="font-paragraph text-muted-text text-xs md:text-sm mb-0.5">En Progreso</p>
              <h3 className="font-heading text-xl md:text-4xl font-bold text-secondary">{inProgressJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-support/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-8 border border-accent/20">
              <div className="flex items-center justify-between mb-1 md:mb-4">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center">
                  <CheckCircle2 className="text-accent w-4 h-4 md:w-5 md:h-5" />
                </div>
                <TrendingUp className="text-accent/50 w-3 h-3 md:w-4 md:h-4" />
              </div>
              <p className="font-paragraph text-muted-text text-xs md:text-sm mb-0.5">Completados</p>
              <h3 className="font-heading text-xl md:text-4xl font-bold text-accent">{completedJobs}</h3>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions - Optimized */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/client/publish-job">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-primary to-secondary rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center mb-4 md:mb-6"
                    >
                      <Plus size={24} className="md:w-6 md:h-6" />
                    </motion.div>
                    <h3 className="font-heading text-base md:text-2xl font-bold mb-2 md:mb-3">Publicar Trabajo</h3>
                  </div>
                  <p className="font-paragraph text-sm md:text-base text-white/90">Crea una nueva solicitud</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/client/my-jobs">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-4 md:mb-6"
                    >
                      <Briefcase className="text-secondary w-6 h-6 md:w-6 md:h-6" />
                    </motion.div>
                    <h3 className="font-heading text-base md:text-2xl font-bold text-foreground mb-2 md:mb-3">Mis Solicitudes</h3>
                  </div>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">Gestiona tus trabajos</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/client/inbox">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center mb-4 md:mb-6"
                    >
                      <MessageSquare className="text-accent w-6 h-6 md:w-6 md:h-6" />
                    </motion.div>
                    <h3 className="font-heading text-base md:text-2xl font-bold text-foreground mb-2 md:mb-3">Mensajes</h3>
                  </div>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">Chatea con Joseadores</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Applications Section - Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-6 md:mb-16"
        >
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="font-heading text-lg md:text-3xl font-bold text-foreground">
                Solicitudes Recibidas
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary"
                />
                <span className="font-paragraph text-xs font-semibold text-primary">En vivo</span>
              </motion.div>
              <span className="font-paragraph text-xs md:text-sm text-muted-text ml-1 md:ml-2">({applications.length})</span>
            </div>
          </div>

          {applications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-8 md:p-16 border border-border/50 text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="text-primary" size={32} />
              </div>
              <p className="font-paragraph text-sm md:text-lg text-muted-text">No hay solicitudes recibidas aún</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6"
            >
              <AnimatePresence mode="wait">
                {applications.map((app) => {
                  const relatedJob = jobs.find(j => j._id === app.jobId);
                  const isNew = newAppIds.has(app._id);
                  return (
                    <motion.div
                      key={`app-${app._id}`}
                      variants={itemVariants}
                      whileHover={{ y: -6, transition: { duration: 0.3 } }}
                      initial={isNew ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="group relative"
                    >
                      {/* New App Badge */}
                      <AnimatePresence>
                        {isNew && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute top-2 md:top-4 right-2 md:right-4 z-20"
                          >
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-xs font-semibold shadow-lg"
                            >
                              <Flame size={12} />
                              Nuevo
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Card Glow Background */}
                      <div className={`absolute inset-0 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100 -z-10 ${
                        isNew 
                          ? 'bg-gradient-to-br from-primary/30 to-secondary/30' 
                          : 'bg-gradient-to-br from-primary/10 to-secondary/10'
                      }`} />

                      {/* Card Content */}
                      <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden border shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col p-3 md:p-6 ${
                        isNew
                          ? 'bg-gradient-to-br from-white to-primary/5 border-primary/30'
                          : 'bg-white border-border'
                      }`}>
                        {/* Header with Status */}
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <div className="flex-1">
                            <h3 className="font-heading text-sm md:text-xl font-bold text-foreground mb-0.5 md:mb-1">
                              {relatedJob?.jobTitle || 'Trabajo'}
                            </h3>
                            <p className="font-paragraph text-xs md:text-sm text-muted-text">
                              Solicitud de {app.joseadorId}
                            </p>
                          </div>
                          <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-paragraph font-semibold border ${
                            app.status === 'pending' ? 'bg-accent/10 text-accent border-accent/30' :
                            app.status === 'accepted' ? 'bg-secondary/10 text-secondary border-secondary/30' :
                            'bg-muted-text/10 text-muted-text border-muted-text/30'
                          }`}>
                            {app.status === 'pending' ? '⏳ Pendiente' :
                             app.status === 'accepted' ? '✓ Aceptada' :
                             '✕ Rechazada'}
                          </span>
                        </div>

                        {/* Joseador Info */}
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg md:rounded-2xl p-2 md:p-4 mb-3 md:mb-4 border border-primary/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-paragraph text-xs text-muted-text mb-0.5">Joseador</p>
                              <p className="font-heading text-xs md:text-sm font-bold text-foreground">
                                {app.joseadorId}
                              </p>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/profile`)}
                              className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                              title="Ver perfil del Joseador"
                            >
                              <Eye size={14} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Description */}
                        {app.coverLetter && (
                          <div className="mb-3 md:mb-4">
                            <p className="font-paragraph text-xs text-muted-text mb-1 md:mb-2">Carta de Presentación</p>
                            <p className="font-paragraph text-xs md:text-sm text-foreground line-clamp-3">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}

                        {/* Proposed Price */}
                        <div className="py-2 md:py-3 border-t border-border/50 border-b border-border/50 mb-3 md:mb-4">
                          <div className="flex items-center justify-between">
                            <span className="font-paragraph text-xs md:text-sm text-muted-text">Precio Propuesto:</span>
                            <span className="font-heading text-sm md:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              RD$ {app.proposedPrice?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>

                        {/* Application Date */}
                        <p className="font-paragraph text-xs text-muted-text mb-3 md:mb-4">
                          Enviada: {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString('es-ES') : 'N/A'}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/job/${app.jobId}`)}
                            className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg md:rounded-xl font-paragraph text-xs md:text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1 md:gap-2"
                          >
                            <Eye size={14} />
                            Ver Solicitud
                          </motion.button>
                          {app.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-accent/10 text-accent rounded-lg md:rounded-xl font-paragraph text-xs md:text-sm font-semibold hover:bg-accent/20 transition-all border border-accent/30"
                            >
                              Responder
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filters - Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-6 border border-border/50 shadow-lg mb-6 md:mb-12"
        >
          <div className="flex flex-col gap-2 md:gap-4">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-muted-text group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar trabajos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border border-border rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2 w-full">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 md:flex-none px-2 md:px-4 py-2 md:py-3 border border-border rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              >
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsRefreshing(true);
                  loadJobs().then(() => setIsRefreshing(false));
                }}
                disabled={isRefreshing}
                className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base font-semibold hover:shadow-lg transition-all flex items-center gap-1 md:gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden md:block">Actualizar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Jobs List - Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="font-heading text-lg md:text-3xl font-bold text-foreground">
                Trabajos Disponibles
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary"
                />
                <span className="font-paragraph text-xs font-semibold text-primary">En vivo</span>
              </motion.div>
              <span className="font-paragraph text-xs md:text-sm text-muted-text ml-1 md:ml-2">({filteredJobs.length})</span>
            </div>
          </div>
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-8 md:p-16 border border-border/50 text-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Search className="text-primary" size={32} />
              </div>
              <p className="font-paragraph text-sm md:text-lg text-muted-text">No hay trabajos disponibles con los filtros seleccionados</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  onClick={() => navigate(`/job/${job._id}`)}
                  className="group relative cursor-pointer"
                >
                  {/* Card Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />

                  {/* Card Content */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl overflow-hidden border border-border/50 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col">
                    {/* Image Section */}
                    {job.jobImage && (
                      <div className="relative w-full h-20 md:h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Image
                          src={job.jobImage}
                          alt={job.jobTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-3 md:p-6 flex flex-col flex-grow">
                      {/* Category Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-2 md:mb-4"
                      >
                        <span className="inline-block px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs font-paragraph font-semibold rounded-full border border-primary/20">
                          {job.serviceCategory}
                        </span>
                      </motion.div>

                      {/* Title */}
                      <h3 className="font-heading text-sm md:text-xl font-bold text-foreground mb-2 md:mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {job.jobTitle}
                      </h3>

                      {/* Description */}
                      <p className="font-paragraph text-xs md:text-base text-muted-text mb-3 md:mb-4 line-clamp-2 flex-grow">
                        {job.description}
                      </p>

                      {/* Location and Budget */}
                      <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 pb-3 md:pb-4 border-t border-border/50">
                        <div className="flex items-center gap-1 md:gap-2 text-muted-text pt-2 md:pt-4">
                          <MapPin size={14} className="text-primary flex-shrink-0" />
                          <span className="font-paragraph text-xs md:text-sm line-clamp-1">{job.locationAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-paragraph text-xs md:text-sm text-muted-text">Presupuesto:</span>
                          <span className="font-heading text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            RD$ {job.budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Status and Action */}
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-paragraph font-semibold border ${
                            job.status === 'open' ? 'bg-accent/10 text-accent border-accent/30' :
                            job.status === 'in_progress' ? 'bg-secondary/10 text-secondary border-secondary/30' :
                            'bg-muted-text/10 text-muted-text border-muted-text/30'
                          }`}>
                            {job.status === 'open' ? '🔓 Abierto' :
                             job.status === 'in_progress' ? '⏳ En Progreso' :
                             '✓ Completado'}
                          </span>
                        </div>
                        {job.status === 'completed' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateJob(job);
                            }}
                            className="w-full px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-accent/20 to-support/20 text-accent rounded-lg md:rounded-2xl font-paragraph text-xs md:text-sm font-semibold hover:from-accent/30 hover:to-support/30 transition-all flex items-center justify-center gap-1 md:gap-2 border border-accent/20"
                          >
                            <RotateCcw size={14} />
                            Solicitar de Nuevo
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
