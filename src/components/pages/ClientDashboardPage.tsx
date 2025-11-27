import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio } from '@/entities';
import { Plus, MapPin, List, Map, Search, LogOut, User, Briefcase, MessageSquare, RefreshCw, RotateCcw, TrendingUp, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useJobStore } from '@/store/jobStore';

export default function ClientDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const { setJobToDuplicate } = useJobStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [availableJobs, setAvailableJobs] = useState<TrabajosdeServicio[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    setUserRole('client');
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
      setJobs(items);
      
      // Filter available jobs - show all jobs that are not completed
      const openJobs = items.filter(job => job.status !== 'completed');
      // Sort by most recent first
      const sortedJobs = openJobs.sort((a, b) => {
        const dateA = new Date(a.postedDate || 0).getTime();
        const dateB = new Date(b.postedDate || 0).getTime();
        return dateB - dateA;
      });
      setAvailableJobs(sortedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
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

  const filteredAvailableJobs = availableJobs.filter(job => {
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
      {/* Animated background elements - hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="hidden sm:block absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="hidden sm:block absolute top-1/2 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link to="/" className="font-heading text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent flex-shrink-0">
              JOSEAME
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 ml-6 lg:ml-8">
              <Link to="/client/dashboard" className="font-paragraph text-sm lg:text-base text-foreground font-semibold hover:text-primary transition-colors relative group whitespace-nowrap">
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/client/my-jobs" className="font-paragraph text-sm lg:text-base text-foreground hover:text-primary transition-colors relative group whitespace-nowrap">
                Mis Trabajos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/client/inbox" className="font-paragraph text-sm lg:text-base text-foreground hover:text-primary transition-colors relative group whitespace-nowrap">
                Mensajes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>
            
            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-paragraph text-xs text-muted-text font-medium">Cliente</span>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setUserRole('joseador');
                    navigate('/joseador/dashboard');
                  }}
                  className="p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:shadow-lg transition-all text-white flex-shrink-0"
                  title="Cambiar a Joseador"
                >
                  <RefreshCw size={16} className="sm:hidden" />
                  <RefreshCw size={18} className="hidden sm:block" />
                </motion.button>
              </div>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <Link to="/profile" className="p-2 rounded-lg hover:bg-background transition-colors flex-shrink-0">
                  <User size={18} className="text-muted-text" />
                </Link>
                <button
                  onClick={actions.logout}
                  className="p-2 text-muted-text hover:text-foreground transition-colors flex-shrink-0"
                >
                  <LogOut size={18} />
                </button>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile">
                  <button className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg lg:rounded-xl hover:bg-background transition-colors">
                    <User size={18} className="text-muted-text" />
                    <span className="font-paragraph text-xs lg:text-sm text-foreground hidden lg:block">
                      {member?.profile?.nickname || 'Perfil'}
                    </span>
                  </button>
                </Link>
                <button
                  onClick={actions.logout}
                  className="flex items-center gap-2 px-3 lg:px-4 py-2 text-muted-text hover:text-foreground transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2 sm:mb-3">
            ¡Bienvenido, {member?.profile?.nickname || 'Cliente'}!
          </h1>
          <p className="font-paragraph text-base sm:text-lg md:text-xl text-muted-text max-w-2xl">
            Gestiona tus trabajos, encuentra joseadores y supervisa tus proyectos
          </p>
        </motion.div>

        {/* Stats Section - Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <AlertCircle className="text-primary" size={22} />
                </div>
                <TrendingUp className="text-primary/50" size={16} />
              </div>
              <p className="font-paragraph text-xs sm:text-sm text-muted-text mb-1">Trabajos Abiertos</p>
              <h3 className="font-heading text-3xl sm:text-4xl font-bold text-primary">{openJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Clock className="text-secondary" size={22} />
                </div>
                <TrendingUp className="text-secondary/50" size={16} />
              </div>
              <p className="font-paragraph text-xs sm:text-sm text-muted-text mb-1">En Progreso</p>
              <h3 className="font-heading text-3xl sm:text-4xl font-bold text-secondary">{inProgressJobs}</h3>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative group sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-support/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-accent/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center">
                  <CheckCircle2 className="text-accent" size={22} />
                </div>
                <TrendingUp className="text-accent/50" size={16} />
              </div>
              <p className="font-paragraph text-xs sm:text-sm text-muted-text mb-1">Completados</p>
              <h3 className="font-heading text-3xl sm:text-4xl font-bold text-accent">{completedJobs}</h3>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions - Responsive Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group sm:col-span-1">
            <Link to="/client/publish-job">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-primary to-secondary rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl bg-white/20 flex items-center justify-center mb-3 sm:mb-4"
                    >
                      <Plus size={20} className="sm:hidden" />
                      <Plus size={28} className="hidden sm:block" />
                    </motion.div>
                    <h3 className="font-heading text-lg sm:text-2xl font-bold mb-2">Publicar Trabajo</h3>
                  </div>
                  <p className="font-paragraph text-xs sm:text-base text-white/90">Crea una nueva solicitud de servicio</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group sm:col-span-1">
            <Link to="/client/my-jobs">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-3 sm:mb-4"
                    >
                      <Briefcase className="text-secondary sm:hidden" size={20} />
                      <Briefcase className="text-secondary hidden sm:block" size={28} />
                    </motion.div>
                    <h3 className="font-heading text-lg sm:text-2xl font-bold text-foreground mb-2">Mis Solicitudes</h3>
                  </div>
                  <p className="font-paragraph text-xs sm:text-base text-muted-text">Gestiona todos tus trabajos publicados</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group sm:col-span-2 lg:col-span-1">
            <Link to="/client/inbox">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center mb-3 sm:mb-4"
                    >
                      <MessageSquare className="text-accent sm:hidden" size={20} />
                      <MessageSquare className="text-accent hidden sm:block" size={28} />
                    </motion.div>
                    <h3 className="font-heading text-lg sm:text-2xl font-bold text-foreground mb-2">Mensajes</h3>
                  </div>
                  <p className="font-paragraph text-xs sm:text-base text-muted-text">Chatea con Joseadores</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Search and Filters - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border/50 shadow-lg mb-8 sm:mb-12"
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar trabajos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-border rounded-lg sm:rounded-2xl font-paragraph text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 min-w-[120px] px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg sm:rounded-2xl font-paragraph text-xs sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/50"
              >
                <option value="all">Todas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg sm:rounded-2xl hover:bg-primary/10 hover:border-primary transition-all font-paragraph font-semibold text-foreground flex-shrink-0"
              >
                {viewMode === 'list' ? <Map size={16} /> : <List size={16} />}
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
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">
            Trabajos Disponibles
            <span className="ml-2 sm:ml-3 text-xl sm:text-2xl text-primary">({filteredAvailableJobs.length})</span>
          </h2>
          {loadingJobs ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent mx-auto my-12"
            />
          ) : filteredAvailableJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-16 border border-border/50 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary" size={28} />
              </div>
              <p className="font-paragraph text-base sm:text-lg text-muted-text">No hay trabajos disponibles con los filtros seleccionados</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredAvailableJobs.map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  onClick={() => navigate(`/job/${job._id}`)}
                  className="group relative cursor-pointer h-full"
                >
                  {/* Card Glow Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100 -z-10" />

                  {/* Card Content */}
                  <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      {job.jobImage ? (
                        <Image
                          src={job.jobImage}
                          alt={job.jobTitle || 'Trabajo'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          width={300}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-primary/50">
                          <Briefcase size={32} />
                          <span className="font-paragraph text-xs text-center">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-6 flex flex-col flex-grow gap-3 sm:gap-4">
                      {/* Category Badge */}
                      {job.serviceCategory && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary text-xs font-paragraph font-semibold rounded-full border border-primary/30">
                            {job.serviceCategory}
                          </span>
                        </motion.div>
                      )}

                      {/* Title */}
                      <div>
                        <h3 className="font-heading text-base sm:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {job.jobTitle || 'Sin título'}
                        </h3>
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p className="font-paragraph text-xs sm:text-sm text-muted-text line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* Location and Budget */}
                      <div className="space-y-2 sm:space-y-3 py-3 sm:py-4 border-t border-border/50 border-b border-border/50">
                        {job.locationAddress && (
                          <div className="flex items-center gap-2 text-muted-text">
                            <MapPin size={14} className="text-primary flex-shrink-0" />
                            <span className="font-paragraph text-xs sm:text-sm line-clamp-1">{job.locationAddress}</span>
                          </div>
                        )}
                        {job.budget && (
                          <div className="flex items-center justify-between">
                            <span className="font-paragraph text-xs sm:text-sm text-muted-text">Presupuesto:</span>
                            <span className="font-heading text-base sm:text-xl font-bold text-primary">
                              RD$ {job.budget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Posted Date and Action */}
                      <div className="space-y-2 sm:space-y-3 mt-auto">
                        {job.postedDate && (
                          <div className="flex items-center gap-2 text-muted-text text-xs">
                            <Clock size={14} className="text-primary flex-shrink-0" />
                            <span className="font-paragraph">
                              {new Date(job.postedDate).toLocaleDateString('es-DO')}
                            </span>
                          </div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/job/${job._id}`);
                          }}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg sm:rounded-xl font-paragraph text-xs sm:text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                          <Eye size={14} />
                          Ver Detalles
                        </motion.button>
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
