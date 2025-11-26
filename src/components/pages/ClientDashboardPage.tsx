import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrabajosdeServicio } from '@/entities';
import { Plus, MapPin, List, Map, Search, Filter, LogOut, User, Briefcase, MessageSquare } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ClientDashboardPage() {
  const { member, actions } = useMember();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const { items } = await BaseCrudService.getAll<TrabajosdeServicio>('servicejobs');
    setJobs(items);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || job.serviceCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Plomería', 'Electricidad', 'Limpieza', 'Construcción', 'Jardinería', 'Tecnología'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              JOSEAME
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/client/dashboard" className="font-paragraph text-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/client/my-jobs" className="font-paragraph text-foreground hover:text-primary transition-colors">
                Mis Trabajos
              </Link>
              <Link to="/client/inbox" className="font-paragraph text-foreground hover:text-primary transition-colors">
                Mensajes
              </Link>
            </nav>
            <div className="flex items-center gap-4">
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
            Bienvenido, {member?.profile?.nickname || 'Cliente'}
          </h1>
          <p className="font-paragraph text-lg text-muted-text">
            Gestiona tus trabajos y encuentra profesionales
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ y: -4 }}>
            <Link to="/client/publish-job">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                <Plus size={32} className="mb-3" />
                <h3 className="font-heading text-xl font-semibold mb-2">Publicar Trabajo</h3>
                <p className="font-paragraph text-white/80">Crea una nueva solicitud de servicio</p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Link to="/client/my-jobs">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <Briefcase size={32} className="text-secondary mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Mis Trabajos</h3>
                <p className="font-paragraph text-muted-text">Ver trabajos activos y completados</p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}>
            <Link to="/client/inbox">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <MessageSquare size={32} className="text-accent mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Mensajes</h3>
                <p className="font-paragraph text-muted-text">Chatea con Joseadores</p>
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
                placeholder="Buscar trabajos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="px-4 py-3 border border-border rounded-xl hover:bg-background transition-colors"
              >
                {viewMode === 'list' ? <Map size={20} /> : <List size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
            Trabajos Disponibles ({filteredJobs.length})
          </h2>
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-border text-center">
              <p className="font-paragraph text-muted-text">No hay trabajos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-text">
                      <MapPin size={16} />
                      <span className="font-paragraph text-sm">{job.locationAddress}</span>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary">
                      RD$ {job.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
