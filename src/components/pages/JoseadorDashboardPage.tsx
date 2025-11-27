import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio } from '@/entities';
import { Wallet, MapPin, Search, LogOut, User, Briefcase, MessageSquare, ShoppingCart, RefreshCw, TrendingUp, Zap, DollarSign, Eye } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { getPiqueteBalance } from '@/lib/piquete-service';

export default function JoseadorDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [walletBalance] = useState(0);
  const [piquetesBalance, setPiquetesBalance] = useState(0);

  useEffect(() => {
    setUserRole('joseador');
    loadJobs();
    loadPiqueteBalance();
    
    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadJobs();
      loadPiqueteBalance();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [member?.loginEmail]);

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    const openJobs = items.filter(job => job.status === 'open');
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

  const categories = ['Plomería', 'Electricidad', 'Limpieza', 'Construcción', 'Jardinería', 'Tecnología'];

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
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-support/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-paragraph text-xs text-muted-text font-medium">Joseador</span>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setUserRole('client');
                    navigate('/client/dashboard');
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-secondary via-accent to-support hover:shadow-lg transition-all text-white"
                  title="Cambiar a Cliente"
                >
                  <RefreshCw size={20} />
                </motion.button>
              </div>
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
          <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent mb-3">
            ¡Bienvenido, {member?.profile?.nickname || 'Joseador'}!
          </h1>
          <p className="font-paragraph text-xl text-muted-text max-w-2xl">
            Encuentra trabajos, crece tu negocio y gestiona tus ganancias
          </p>
        </motion.div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mb-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-support/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-gradient-to-br from-secondary via-accent to-support rounded-3xl p-8 md:p-10 text-white shadow-2xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
                  >
                    <Wallet size={32} />
                  </motion.div>
                  <div>
                    <p className="font-paragraph text-white/80 text-sm">Mi Wallet</p>
                    <h2 className="font-heading text-3xl font-bold">Gestiona tus Fondos</h2>
                  </div>
                </div>
                <Link to="/joseador/wallet">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-paragraph font-semibold transition-all backdrop-blur-sm border border-white/20"
                  >
                    Ver Detalles
                  </motion.button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                    <p className="font-paragraph text-white/80 text-sm">Balance Disponible</p>
                  </div>
                  <p className="font-heading text-4xl font-bold">RD$ {walletBalance.toLocaleString()}</p>
                  <p className="font-paragraph text-white/60 text-sm mt-2">Fondos listos para retirar</p>
                </motion.div>

                {/* Piquetes Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Zap size={20} />
                      </div>
                      <p className="font-paragraph text-white/80 text-sm">Piquetes Disponibles</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl font-bold"
                    >
                      {piquetesBalance}
                    </motion.div>
                  </div>
                  <p className="font-paragraph text-white/60 text-sm mb-4">Créditos para aplicar a trabajos</p>
                  <Link to="/joseador/buy-piquetes">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-4 py-3 bg-white text-secondary rounded-xl font-paragraph font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/joseador/my-applications">
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
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Mis Aplicaciones</h3>
                  </div>
                  <p className="font-paragraph text-muted-text">Gestiona tus solicitudes enviadas</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/joseador/inbox">
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
                  <p className="font-paragraph text-muted-text">Chatea con clientes</p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8 }} className="group">
            <Link to="/joseador/wallet">
              <div className="relative overflow-hidden rounded-3xl h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-support/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-support/20 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col justify-between">
                  <div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-support/20 to-secondary/20 flex items-center justify-center mb-4"
                    >
                      <Wallet className="text-support" size={32} />
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Wallet</h3>
                  </div>
                  <p className="font-paragraph text-muted-text">Gestiona tus fondos</p>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text group-focus-within:text-secondary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar trabajos disponibles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-2xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all bg-white/50"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-2xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all bg-white/50"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Jobs Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
            Trabajos Disponibles
            <span className="ml-3 text-2xl text-secondary">({filteredJobs.length})</span>
          </h2>
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-border/50 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                <Search className="text-secondary" size={40} />
              </div>
              <p className="font-paragraph text-lg text-muted-text">No hay trabajos disponibles en este momento</p>
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
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />

                  {/* Card Content */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-border/50 shadow-lg group-hover:shadow-2xl transition-all h-full flex flex-col">
                    {/* Image Section */}
                    {job.jobImage && (
                      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-secondary/20 to-accent/20">
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
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary text-xs font-paragraph font-semibold rounded-full border border-secondary/20">
                          {job.serviceCategory}
                        </span>
                      </motion.div>

                      {/* Title */}
                      <h3 className="font-heading text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                        {job.jobTitle}
                      </h3>

                      {/* Description */}
                      <p className="font-paragraph text-muted-text mb-4 line-clamp-2 flex-grow">
                        {job.description}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-muted-text mb-4 pb-4 border-t border-border/50 pt-4">
                        <MapPin size={16} className="text-secondary flex-shrink-0" />
                        <span className="font-paragraph text-sm line-clamp-1">{job.locationAddress}</span>
                      </div>

                      {/* Budget and Action */}
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                          RD$ {job.budget?.toLocaleString()}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/job/${job._id}`);
                          }}
                          className="px-4 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl font-paragraph font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Eye size={16} />
                          Ver
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
