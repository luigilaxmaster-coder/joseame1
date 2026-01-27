import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio } from '@/entities';
import { Wallet, MapPin, Search, LogOut, User, Briefcase, MessageSquare, ShoppingCart, RefreshCw, TrendingUp, Zap, DollarSign, Eye, Flame, Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getPiqueteBalance } from '@/lib/piquete-service';
import { useSyncUser } from '@/lib/user-sync-hook';
import DashboardWithBottomTabs from '@/components/DashboardWithBottomTabs';

function JoseadorDashboardContent() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [walletBalance] = useState(0);
  const [piquetesBalance, setPiquetesBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previousJobsRef = useRef<string[]>([]);

  // Sync user to registeredusers collection
  useSyncUser();

  useEffect(() => {
    setUserRole('joseador');
    loadJobs();
    loadPiqueteBalance();
    
    // Set up auto-refresh every 30 seconds (reduced for better performance)
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadPiqueteBalance();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [member?.loginEmail]);

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    const openJobs = items.filter(job => job.status === 'open');
    
    // Detect new jobs
    const currentJobIds = openJobs.map(job => job._id);
    const newIds = currentJobIds.filter(id => !previousJobsRef.current.includes(id));
    
    if (newIds.length > 0) {
      setNewJobIds(new Set(newIds));
      // Remove "new" badge after 10 seconds
      setTimeout(() => {
        setNewJobIds(new Set());
      }, 10000);
    }
    
    previousJobsRef.current = currentJobIds;
    setJobs(openJobs);
  };

  const loadPiqueteBalance = async () => {
    if (!member?.loginEmail) return;
    const balance = await getPiqueteBalance(member.loginEmail);
    setPiquetesBalance(balance);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || job.serviceCategory === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'Plomería',
    'Electricidad',
    'Limpieza',
    'Construcción',
    'Jardinería',
    'Tecnología',
    'Pintura',
    'Carpintería',
    'Reparación de Electrodomésticos',
    'Climatización (AC)',
    'Cerrajería',
    'Albañilería',
    'Instalación de Puertas y Ventanas',
    'Reparación de Techos',
    'Servicios de Mudanza',
    'Limpieza de Alfombras',
    'Reparación de Muebles',
    'Servicios de Fontanería Avanzada',
    'Instalación de Sistemas de Seguridad',
    'Reparación de Ascensores',
    'Servicios de Decoración',
    'Reparación de Piscinas',
    'Servicios de Limpieza Comercial',
    'Instalación de Pisos y Azulejos',
    'Reparación de Puertas de Garaje',
    'Servicios de Desinfección',
    'Reparación de Persianas',
    'Servicios de Jardinería Avanzada',
    'Instalación de Sistemas de Riego',
    'Reparación de Calefacción',
    'Servicios de Consultoría Técnica',
    'Otro'
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background relative overflow-hidden pb-[90px]">
      {/* Animated background elements - optimized */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-2xl -z-10" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-support/5 rounded-full blur-2xl -z-10" />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-lg md:text-2xl bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent tracking-tight font-bold not-italic">
              JOSEAME
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/joseador/dashboard" className="font-paragraph text-foreground font-semibold hover:text-secondary transition-colors relative group">
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/joseador/my-applications" className="font-paragraph text-foreground hover:text-secondary transition-colors relative group">
                Mis Aplicaciones
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/joseador/wallet" className="font-paragraph text-foreground hover:text-secondary transition-colors relative group">
                Wallet
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/joseador/inbox" className="font-paragraph text-foreground hover:text-secondary transition-colors relative group">
                Mensajes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="font-paragraph text-xs text-muted-text font-medium hidden md:block">Joseador</span>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setUserRole('client');
                    navigate('/client/dashboard');
                  }}
                  className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-gradient-to-r from-secondary via-accent to-support hover:shadow-lg transition-all text-white"
                  title="Cambiar a Cliente"
                >
                  <RefreshCw size={16} />
                </motion.button>
              </div>
              <Link to="/profile">
                <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl hover:bg-background transition-colors">
                  <User size={16} className="text-muted-text" />
                  <span className="font-paragraph text-xs md:text-sm text-foreground hidden md:block">
                    {member?.profile?.nickname || 'Perfil'}
                  </span>
                </button>
              </Link>
              <button
                onClick={() => {
                  const { clearAllUserData } = useRoleStore.getState();
                  clearAllUserData();
                  actions.logout();
                }}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-muted-text hover:text-foreground transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-3 md:px-6 py-6 md:py-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-12"
        >
          <h1 className="font-heading text-2xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent mb-1 md:mb-3">
            ¡Bienvenido, {member?.profile?.nickname || 'Joseador'}!
          </h1>
          <p className="font-paragraph text-xs md:text-xl text-muted-text max-w-2xl">
            Encuentra trabajos, crece tu negocio y gestiona tus ganancias
          </p>
        </motion.div>

        {/* Wallet Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-6 md:mb-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-accent/30 to-support/30 rounded-2xl md:rounded-3xl blur-xl transition-all opacity-70 group-hover:opacity-100" />
          <div className="relative bg-gradient-to-br from-secondary via-accent to-support rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 md:mb-8">
                <div className="flex items-center gap-2 md:gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center"
                  >
                    <Wallet size={20} className="md:w-8 md:h-8" />
                  </motion.div>
                  <div>
                    <p className="font-paragraph text-white/80 text-xs md:text-sm">Mi Wallet</p>
                    <h2 className="font-heading text-lg md:text-3xl font-bold">Gestiona tus Fondos</h2>
                  </div>
                </div>
                <Link to="/joseador/wallet">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 md:px-6 py-2 md:py-3 bg-white/20 hover:bg-white/30 rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base font-semibold transition-all backdrop-blur-sm border border-white/20"
                  >
                    Ver Detalles
                  </motion.button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Balance Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20"
                >
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                    <p className="font-paragraph text-white/80 text-xs md:text-sm">Balance Disponible</p>
                  </div>
                  <p className="font-heading text-2xl md:text-4xl font-bold">RD$ {walletBalance.toLocaleString()}</p>
                  <p className="font-paragraph text-white/60 text-xs md:text-sm mt-1 md:mt-2">Fondos listos para retirar</p>
                </motion.div>

                {/* Piquetes Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap size={16} />
                      </div>
                      <p className="font-paragraph text-white/80 text-xs md:text-sm">Piquetes Disponibles</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-lg md:text-2xl font-bold"
                    >
                      {piquetesBalance}
                    </motion.div>
                  </div>
                  <p className="font-paragraph text-white/60 text-xs md:text-sm mb-2 md:mb-4">Créditos para aplicar a trabajos</p>
                  <Link to="/joseador/buy-piquetes">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-white text-secondary rounded-lg md:rounded-xl font-paragraph text-xs md:text-base font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-1 md:gap-2"
                    >
                      <ShoppingCart size={14} />
                      Comprar Piquetes
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/joseador/my-applications">
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
                    <h3 className="font-heading text-base md:text-2xl font-bold text-foreground mb-2 md:mb-3">Mis Aplicaciones</h3>
                  </div>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">Gestiona tus solicitudes</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/joseador/inbox">
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
                  <p className="font-paragraph text-sm md:text-base text-muted-text">Chatea con clientes</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="group">
            <Link to="/joseador/wallet">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-support/20 to-secondary/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-support/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-support/20 to-secondary/20 flex items-center justify-center mb-4 md:mb-6"
                    >
                      <Wallet className="text-support w-6 h-6 md:w-6 md:h-6" />
                    </motion.div>
                    <h3 className="font-heading text-base md:text-2xl font-bold text-foreground mb-2 md:mb-3">Wallet</h3>
                  </div>
                  <p className="font-paragraph text-sm md:text-base text-muted-text">Gestiona tus fondos</p>
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
          className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-3 md:p-6 border border-border/50 shadow-lg mb-6 md:mb-12"
        >
          <div className="flex flex-col gap-2 md:gap-4 items-end">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-muted-text group-focus-within:text-secondary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar trabajos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border border-border rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all bg-white/50"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 md:flex-none px-2 md:px-4 py-2 md:py-3 border border-border rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all bg-white/50"
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
                className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-lg md:rounded-2xl font-paragraph text-xs md:text-base font-semibold hover:shadow-lg transition-all flex items-center gap-1 md:gap-2 disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden md:block">Actualizar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Jobs Feed - Live Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="font-heading text-lg md:text-3xl font-bold text-foreground">
                Trabajos Disponibles
              </h2>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full border border-secondary/30"
              >
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-secondary"
                />
                <span className="font-paragraph text-xs font-semibold text-secondary">En vivo</span>
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
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Search className="text-secondary" size={32} />
              </div>
              <p className="font-paragraph text-sm md:text-lg text-muted-text">No hay trabajos disponibles en este momento</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              <AnimatePresence mode="wait">
                {filteredJobs.map((job) => {
                  const isNew = newJobIds.has(job._id);
                  return (
                    <motion.div
                      key={`job-${job._id}`}
                      variants={itemVariants}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      onClick={() => navigate(`/job/${job._id}`)}
                      initial={isNew ? { opacity: 0, scale: 0.8, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="group relative cursor-pointer h-full"
                    >
                      {/* New Job Badge */}
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
                              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-secondary to-accent text-white rounded-full text-xs font-semibold shadow-lg"
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
                          ? 'bg-gradient-to-br from-secondary/30 to-accent/30' 
                          : 'bg-gradient-to-br from-secondary/10 to-accent/10'
                      }`} />

                      {/* Card Content */}
                      <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden border shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col ${
                        isNew
                          ? 'bg-gradient-to-br from-white to-secondary/5 border-secondary/30'
                          : 'bg-white border-border'
                      }`}>
                        {/* Image Section */}
                        <div className="relative w-full h-24 md:h-48 overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                          {job.jobImage ? (
                            <Image
                              src={job.jobImage}
                              alt={job.jobTitle || 'Trabajo'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              width={300}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1 text-secondary/50">
                              <Briefcase size={24} />
                              <span className="font-paragraph text-xs text-center">Sin imagen</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                        </div>

                        {/* Content Section */}
                        <div className="p-3 md:p-6 flex flex-col flex-grow gap-2 md:gap-3">
                          {/* Category Badge */}
                          {job.serviceCategory && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              <span className="inline-block px-2 md:px-4 py-1 md:py-2 bg-secondary/10 text-secondary text-xs font-paragraph font-semibold rounded-full border border-secondary/30">
                                {job.serviceCategory}
                              </span>
                            </motion.div>
                          )}

                          {/* Title */}
                          <div>
                            <h3 className="font-heading text-sm md:text-lg font-bold text-foreground line-clamp-2 group-hover:text-secondary transition-colors">
                              {job.jobTitle || 'Sin título'}
                            </h3>
                          </div>

                          {/* Description */}
                          {job.description && (
                            <p className="font-paragraph text-xs md:text-sm text-muted-text line-clamp-2">
                              {job.description}
                            </p>
                          )}

                          {/* Location and Budget */}
                          <div className="space-y-1 md:space-y-2 py-2 md:py-3 border-t border-border/50 border-b border-border/50">
                            {job.locationAddress && (
                              <div className="flex items-center gap-1 md:gap-2 text-muted-text">
                                <MapPin size={12} className="text-secondary flex-shrink-0" />
                                <span className="font-paragraph text-xs line-clamp-1">{job.locationAddress}</span>
                              </div>
                            )}
                            {job.budget && (
                              <div className="flex items-center justify-between">
                                <span className="font-paragraph text-xs text-muted-text">Presupuesto:</span>
                                <span className="font-heading text-sm md:text-lg font-bold text-secondary">
                                  RD$ {job.budget.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/job/${job._id}`);
                            }}
                            className={`w-full px-3 md:px-4 py-2 md:py-3 text-white rounded-lg md:rounded-xl font-paragraph text-xs md:text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1 md:gap-2 mt-auto ${
                              isNew
                                ? 'bg-gradient-to-r from-secondary via-accent to-support'
                                : 'bg-gradient-to-r from-secondary to-accent'
                            }`}
                          >
                            <Eye size={14} />
                            Ver Detalles
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function JoseadorDashboardPage() {
  return (
    <DashboardWithBottomTabs role="joseador">
      <JoseadorDashboardContent />
    </DashboardWithBottomTabs>
  );
}
