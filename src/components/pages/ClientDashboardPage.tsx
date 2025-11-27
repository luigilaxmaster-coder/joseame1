import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio } from '@/entities';
import { Plus, MapPin, List, Map, Search, LogOut, User, Briefcase, MessageSquare, RefreshCw, RotateCcw, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useJobStore } from '@/store/jobStore';

export default function ClientDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const { setJobToDuplicate } = useJobStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setUserRole('client');
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    setJobs(items);
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setUserRole('joseador');
                  navigate('/joseador/dashboard');
                }}
                className="p-2 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all text-white"
                title="Cambiar a Joseador"
              >
                <RefreshCw size={20} />
              </motion.button>
              <Link to="/profile">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-background transition-colors">
                  <User size={20} className="text-muted-text" />
                  <span className="font-paragraph text-sm text-foreground hidden md:block">
                    {member?.profile?.nickname || 'Perfil'}
                  </span>
                </button>
              </Link>
              <button
                onClick={actions.logout}
                className="flex items-center gap-2 px-4 py-2 text-muted-text hover:text-foreground transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
            ¡Bienvenido, {member?.profile?.nickname || 'Cliente'}!
          </h1>
          <p className="font-paragraph text-xl text-muted-text max-w-2xl">{"Gestiona tus trabajos, encuentra joseadores y supervisa tus proyectos"}</p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <AlertCircle className="text-primary" size={28} />
                </div>
                <TrendingUp className="text-primary/50" size={20} />
              </div>
              <p className="font-paragraph text-muted-text text-sm mb-1">Trabajos Abiertos</p>
              <h3 className="font-heading text-4xl font-bold text-primary">{openJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Clock className="text-secondary" size={28} />
                </div>
                <TrendingUp className="text-secondary/50" size={20} />
              </div>
              <p className="font-paragraph text-muted-text text-sm mb-1">En Progreso</p>
              <h3 className="font-heading text-4xl font-bold text-secondary">{inProgressJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-support/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-accent/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center">
                  <CheckCircle2 className="text-accent" size={28} />
                </div>
                <TrendingUp className="text-accent/50" size={20} />
              </div>
              <p className="font-paragraph text-muted-text text-sm mb-1">Completados</p>
              <h3 className="font-heading text-4xl font-bold text-accent">{completedJobs}</h3>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/client/publish-job">
              <div className="relative overflow-hidden rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4"
                    >
                      <Plus size={32} />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold mb-2">Publicar Trabajo</h3>
                  </div>
                  <p className="font-paragraph text-white/90">Crea una nueva solicitud de servicio</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/client/my-jobs">
              <div className="relative overflow-hidden rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-4"
                    >
                      <Briefcase className="text-secondary" size={32} />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Mis Solicitudes</h3>
                  </div>
                  <p className="font-paragraph text-muted-text">Gestiona todos tus trabajos publicados</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/client/inbox">
              <div className="relative overflow-hidden rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center mb-4"
                    >
                      <MessageSquare className="text-accent" size={32} />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Mensajes</h3>
                  </div>
                  <p className="font-paragraph text-muted-text">Chatea con Joseadores</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-lg mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar trabajos por título o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-2xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-2xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="px-4 py-3 border border-border rounded-2xl hover:bg-primary/10 hover:border-primary transition-all font-paragraph font-semibold text-foreground"
              >
                {viewMode === 'list' ? <Map size={20} /> : <List size={20} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Jobs List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
            Trabajos Disponibles
            <span className="ml-3 text-2xl text-primary">({filteredJobs.length})</span>
          </h2>
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-border/50 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary" size={40} />
              </div>
              <p className="font-paragraph text-lg text-muted-text">No hay trabajos disponibles con los filtros seleccionados</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  onClick={() => navigate(`/job/${job._id}`)}
                  className="group relative cursor-pointer"
                >
                  {/* Card Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />

                  {/* Card Content */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/50 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col">
                    {/* Image Section */}
                    {job.jobImage && (
                      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Image
                          src={job.jobImage}
                          alt={job.jobTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Category Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-4"
                      >
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs font-paragraph font-semibold rounded-full border border-primary/20">
                          {job.serviceCategory}
                        </span>
                      </motion.div>

                      {/* Title */}
                      <h3 className="font-heading text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {job.jobTitle}
                      </h3>

                      {/* Description */}
                      <p className="font-paragraph text-muted-text mb-4 line-clamp-2 flex-grow">
                        {job.description}
                      </p>

                      {/* Location and Budget */}
                      <div className="space-y-3 mb-4 pb-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-text pt-4">
                          <MapPin size={16} className="text-primary flex-shrink-0" />
                          <span className="font-paragraph text-sm line-clamp-1">{job.locationAddress}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-paragraph text-sm text-muted-text">Presupuesto:</span>
                          <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            RD$ {job.budget?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Status and Action */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-paragraph font-semibold border ${
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
                            className="w-full px-4 py-3 bg-gradient-to-r from-accent/20 to-support/20 text-accent rounded-2xl font-paragraph text-sm font-semibold hover:from-accent/30 hover:to-support/30 transition-all flex items-center justify-center gap-2 border border-accent/20"
                          >
                            <RotateCcw size={16} />
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
