import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { TrabajosdeServicio } from '@/entities';
import { Wallet, MapPin, Search, Filter, LogOut, User, Briefcase, MessageSquare, ShoppingCart, Map, RefreshCw, Navigation } from 'lucide-react';
import { Image } from '@/components/ui/image';
import JobsMap from '@/components/JobsMap';

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function JoseadorDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const { setUserRole } = useRoleStore();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [walletBalance] = useState(0);
  const [piquetesBalance] = useState(5);
  const [showMap, setShowMap] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);

  useEffect(() => {
    setUserRole('joseador');
    loadJobs();
  }, []);

  const requestUserLocation = () => {
    setRequestingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalización no disponible en tu navegador');
      setRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setRequestingLocation(false);
      },
      (error) => {
        let errorMsg = 'No se pudo obtener tu ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Permiso de ubicación denegado. Habilítalo en la configuración del navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Información de ubicación no disponible';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Tiempo de espera agotado al obtener ubicación';
        }
        setLocationError(errorMsg);
        setRequestingLocation(false);
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    const openJobs = items.filter(job => job.status === 'open');
    setJobs(openJobs);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || job.serviceCategory === categoryFilter;
    
    // Filter by proximity if user location is available
    let matchesProximity = true;
    if (userLocation && job.latitude && job.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        job.latitude,
        job.longitude
      );
      matchesProximity = distance <= 50; // 50 km radius
    }
    
    return matchesSearch && matchesCategory && matchesProximity;
  });

  // Sort jobs by distance if user location is available
  const sortedJobs = userLocation ? [...filteredJobs].sort((a, b) => {
    if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
    const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
    const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
    return distA - distB;
  }) : filteredJobs;

  const categories = ['Plomería', 'Electricidad', 'Limpieza', 'Construcción', 'Jardinería', 'Tecnología'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent">
              JOSEAME
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/joseador/dashboard" className="font-paragraph text-foreground hover:text-secondary transition-colors">
                Inicio
              </Link>
              <Link to="/joseador/my-applications" className="font-paragraph text-foreground hover:text-secondary transition-colors">
                Mis Aplicaciones
              </Link>
              <Link to="/joseador/wallet" className="font-paragraph text-foreground hover:text-secondary transition-colors">
                Wallet
              </Link>
              <Link to="/joseador/inbox" className="font-paragraph text-foreground hover:text-secondary transition-colors">
                Mensajes
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setUserRole('client');
                  navigate('/client/dashboard');
                }}
                className="p-2 rounded-xl bg-gradient-to-r from-secondary via-accent to-support hover:shadow-lg transition-all"
                title="Cambiar a Cliente"
              >
                <RefreshCw size={20} className="text-white" />
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
      <div className="max-w-[100rem] mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bienvenido, {member?.profile?.nickname || 'Joseador'}
          </h1>
          <p className="font-paragraph text-lg text-muted-text">
            Encuentra trabajos y crece tu negocio
          </p>
        </div>

        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-secondary via-accent to-support rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Wallet size={32} />
              <h2 className="font-heading text-2xl font-bold">Mi Wallet</h2>
            </div>
            <Link to="/joseador/wallet">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-paragraph font-semibold transition-colors">
                Ver Detalles
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-paragraph text-white/80 mb-2">Balance Disponible</p>
              <p className="font-heading text-4xl font-bold">RD$ {walletBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-paragraph text-white/80 mb-2">Piquetes Disponibles</p>
              <p className="font-heading text-4xl font-bold">{piquetesBalance}</p>
              <Link to="/joseador/buy-piquetes">
                <button className="mt-3 px-4 py-2 bg-white text-secondary rounded-xl font-paragraph font-semibold hover:bg-white/90 transition-colors flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Comprar Piquetes
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ y: -4 }}>
            <Link to="/joseador/my-applications">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <Briefcase size={32} className="text-secondary mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Mis Aplicaciones</h3>
                <p className="font-paragraph text-muted-text">Ver aplicaciones enviadas</p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Link to="/joseador/inbox">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <MessageSquare size={32} className="text-accent mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Mensajes</h3>
                <p className="font-paragraph text-muted-text">Chatea con clientes</p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Link to="/joseador/wallet">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <Wallet size={32} className="text-support mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Wallet</h3>
                <p className="font-paragraph text-muted-text">Gestiona tus fondos</p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 border border-border shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text" size={20} />
              <input
                type="text"
                placeholder="Buscar trabajos disponibles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={requestUserLocation}
              disabled={requestingLocation}
              className="px-6 py-3 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-secondary to-accent text-white hover:shadow-lg disabled:opacity-50"
              title="Obtener mi ubicación"
            >
              <Navigation size={20} />
              {requestingLocation ? 'Localizando...' : 'Mi Ubicación'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMap(!showMap)}
              className={`px-6 py-3 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                showMap
                  ? 'bg-secondary text-white'
                  : 'bg-background border border-border text-foreground hover:bg-border'
              }`}
            >
              <Map size={20} />
              {showMap ? 'Ver Lista' : 'Ver Mapa'}
            </motion.button>
          </div>
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="font-paragraph text-xs text-red-700">{locationError}</p>
            </motion.div>
          )}
          {userLocation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="font-paragraph text-xs text-green-700">
                ✓ Tu ubicación ha sido detectada. Mostrando trabajos cercanos.
              </p>
            </motion.div>
          )}
        </div>

        {/* Map View */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <JobsMap
              jobs={filteredJobs}
              onJobSelect={(jobId) => {
                setSelectedJobId(jobId);
                navigate(`/job/${jobId}`);
              }}
              selectedJobId={selectedJobId}
            />
          </motion.div>
        )}

        {/* Jobs Feed */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
            Trabajos Disponibles ({sortedJobs.length})
            {userLocation && <span className="text-base text-muted-text font-paragraph ml-2">(ordenados por proximidad)</span>}
          </h2>
          {sortedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <p className="font-paragraph text-muted-text">
                {userLocation 
                  ? 'No hay trabajos disponibles en tu zona (50 km de radio)' 
                  : 'No hay trabajos disponibles en este momento'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedJobs.map((job) => {
                const distance = userLocation && job.latitude && job.longitude
                  ? calculateDistance(userLocation.latitude, userLocation.longitude, job.latitude, job.longitude)
                  : null;

                return (
                  <motion.div
                    key={job._id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/job/${job._id}`)}
                    className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  >
                    {job.jobImage && (
                      <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-background">
                        <Image src={job.jobImage} alt={job.jobTitle} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-paragraph rounded-full">
                        {job.serviceCategory}
                      </span>
                      {distance && (
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-paragraph rounded-full">
                          {distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      {job.jobTitle}
                    </h3>
                    <p className="font-paragraph text-muted-text mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 text-muted-text mb-4">
                      <MapPin size={16} />
                      <span className="font-paragraph text-sm">{job.locationAddress}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-heading text-xl font-bold text-secondary">
                        RD$ {job.budget?.toLocaleString()}
                      </span>
                      <button className="px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-xl font-paragraph font-semibold hover:shadow-lg transition-shadow">
                        Aplicar
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
