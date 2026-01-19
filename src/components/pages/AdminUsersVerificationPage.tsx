import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { RegisteredUsers, JoseadoresProfiles, UserDirectory } from '@/entities';
import { ArrowLeft, Search, CheckCircle, XCircle, RefreshCw, Activity, Clock, Award, User, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useSyncUser } from '@/lib/user-sync-hook';
import { Image } from '@/components/ui/image';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  total: number;
  aprobado: number;
  pendiente: number;
  rechazado: number;
  clientes: number;
  joseadores: number;
  admins: number;
}

export default function AdminUsersVerificationPage() {
  const { member } = useMember();
  const { toast } = useToast();
  useSyncUser(); // Sync current admin user
  
  const [users, setUsers] = useState<RegisteredUsers[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    aprobado: 0,
    pendiente: 0,
    rechazado: 0,
    clientes: 0,
    joseadores: 0,
    admins: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerification, setFilterVerification] = useState<'all' | 'Aprobado' | 'Pendiente' | 'Rechazado'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'Cliente' | 'Joseador' | 'Admin'>('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load users and stats
  const loadData = async () => {
    try {
      setIsRefreshing(true);
      
      // Get all users from registeredusers collection
      const { items } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
      
      // Calculate stats
      const newStats: UserStats = {
        total: items.length,
        aprobado: items.filter(u => u.verificationStatus === 'Aprobado').length,
        pendiente: items.filter(u => u.verificationStatus === 'Pendiente').length,
        rechazado: items.filter(u => u.verificationStatus === 'Rechazado').length,
        clientes: items.filter(u => u.role === 'Cliente').length,
        joseadores: items.filter(u => u.role === 'Joseador').length,
        admins: items.filter(u => u.role === 'Admin').length
      };
      setStats(newStats);

      // Apply filters
      let filtered = [...items];

      // Verification filter
      if (filterVerification !== 'all') {
        filtered = filtered.filter(u => u.verificationStatus === filterVerification);
      }

      // Role filter
      if (filterRole !== 'all') {
        filtered = filtered.filter(u => u.role === filterRole);
      }

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(u => {
          const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
          const nickname = (u.nickname || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          return fullName.includes(search) || nickname.includes(search) || email.includes(search);
        });
      }

      // Sort by last login (most recent first)
      filtered.sort((a, b) => {
        const dateA = a.lastLoginDate ? new Date(a.lastLoginDate).getTime() : 0;
        const dateB = b.lastLoginDate ? new Date(b.lastLoginDate).getTime() : 0;
        return dateB - dateA;
      });

      // Apply pagination
      setTotalUsers(filtered.length);
      const start = (currentPage - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setUsers(paginated);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load and setup polling
  useEffect(() => {
    loadData();

    // Set up polling - refresh every 10 seconds
    pollIntervalRef.current = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Reload when filters or search change
  useEffect(() => {
    setCurrentPage(1);
    loadData();
  }, [searchTerm, filterVerification, filterRole]);

  // Reload when page changes
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  // Sync verification status to related profiles
  const syncVerificationToProfiles = async (user: RegisteredUsers, newStatus: 'Aprobado' | 'Pendiente' | 'Rechazado') => {
    try {
      // Sync to UserDirectory
      const { items: directoryItems } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
      const directoryUser = directoryItems.find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (directoryUser) {
        await BaseCrudService.update('userdirectory', {
          _id: directoryUser._id,
          verificationStatus: newStatus
        });
      }

      // Sync to JoseadoresProfiles if user is a Joseador
      if (user.role === 'Joseador') {
        const { items: joseadorItems } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores');
        const joseadorProfile = joseadorItems.find(j => j.email?.toLowerCase() === user.email?.toLowerCase());
        if (joseadorProfile) {
          await BaseCrudService.update('joseadores', {
            _id: joseadorProfile._id,
            verificationStatus: newStatus
          });
        }
      }
    } catch (error) {
      console.error('Error syncing verification status to profiles:', error);
    }
  };

  // Handle verification status change
  const handleChangeVerificationStatus = async (userId: string, newStatus: 'Aprobado' | 'Pendiente' | 'Rechazado') => {
    try {
      // Find the user to get their email and role
      const user = users.find(u => u._id === userId);
      if (!user) return;

      // Update in registeredusers
      await BaseCrudService.update('registeredusers', {
        _id: userId,
        verificationStatus: newStatus
      });

      // Sync to related profiles
      await syncVerificationToProfiles(user, newStatus);

      // Show success toast
      toast({
        title: 'Estado actualizado',
        description: `El estado de verificación se actualizó a ${newStatus} y se sincronizó con todos los perfiles.`,
      });

      await loadData();
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de verificación.',
        variant: 'destructive',
      });
    }
  };

  // Sync role to related profiles
  const syncRoleToProfiles = async (user: RegisteredUsers, newRole: 'Cliente' | 'Joseador' | 'Admin') => {
    try {
      // Sync to UserDirectory
      const { items: directoryItems } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
      const directoryUser = directoryItems.find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (directoryUser) {
        // UserDirectory doesn't have a role field, but we keep it in sync for consistency
        await BaseCrudService.update('userdirectory', {
          _id: directoryUser._id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.nickname || 'Sin nombre'
        });
      }

      // If changing to Joseador, create profile if it doesn't exist
      if (newRole === 'Joseador') {
        const { items: joseadorItems } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores');
        const joseadorProfile = joseadorItems.find(j => j.email?.toLowerCase() === user.email?.toLowerCase());
        
        if (!joseadorProfile) {
          // Create new Joseador profile
          await BaseCrudService.create('joseadores', {
            _id: crypto.randomUUID(),
            userId: user.userId,
            email: user.email,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.nickname || 'Sin nombre',
            verificationStatus: user.verificationStatus || 'Pendiente',
            badges: user.badges || ''
          });
        }
      }
    } catch (error) {
      console.error('Error syncing role to profiles:', error);
    }
  };

  // Handle role change
  const handleChangeRole = async (userId: string, newRole: 'Cliente' | 'Joseador' | 'Admin') => {
    try {
      // Find the user to get their email
      const user = users.find(u => u._id === userId);
      if (!user) return;

      // Update in registeredusers
      await BaseCrudService.update('registeredusers', {
        _id: userId,
        role: newRole
      });

      // Sync to related profiles
      await syncRoleToProfiles(user, newRole);

      // Show success toast
      toast({
        title: 'Rol actualizado',
        description: `El rol se actualizó a ${newRole} y se sincronizó con todos los perfiles.`,
      });

      await loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol.',
        variant: 'destructive',
      });
    }
  };

  // Sync badges to related profiles
  const syncBadgesToProfiles = async (user: RegisteredUsers, badges: string) => {
    try {
      // Sync to JoseadoresProfiles if user is a Joseador
      if (user.role === 'Joseador') {
        const { items: joseadorItems } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores');
        const joseadorProfile = joseadorItems.find(j => j.email?.toLowerCase() === user.email?.toLowerCase());
        if (joseadorProfile) {
          await BaseCrudService.update('joseadores', {
            _id: joseadorProfile._id,
            badges
          });
        }
      }
    } catch (error) {
      console.error('Error syncing badges to profiles:', error);
    }
  };

  // Handle badges update
  const handleUpdateBadges = async (userId: string, badges: string) => {
    try {
      // Find the user to get their email and role
      const user = users.find(u => u._id === userId);
      if (!user) return;

      // Update in registeredusers
      await BaseCrudService.update('registeredusers', {
        _id: userId,
        badges
      });

      // Sync to related profiles
      await syncBadgesToProfiles(user, badges);

      // Show success toast
      toast({
        title: 'Badges actualizados',
        description: 'Los badges se actualizaron y sincronizaron con todos los perfiles.',
      });

      await loadData();
    } catch (error) {
      console.error('Error updating badges:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los badges.',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  const formatLastLogin = (date?: Date | string): string => {
    if (!date) return 'Nunca';
    
    const loginDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return loginDate.toLocaleDateString('es-DO');
  };

  const getVerificationColor = (status?: string) => {
    switch (status) {
      case 'Aprobado':
        return 'text-accent';
      case 'Rechazado':
        return 'text-destructive';
      default:
        return 'text-secondary';
    }
  };

  const getVerificationBgColor = (status?: string) => {
    switch (status) {
      case 'Aprobado':
        return 'bg-accent/10';
      case 'Rechazado':
        return 'bg-destructive/10';
      default:
        return 'bg-secondary/10';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'text-primary';
      case 'Joseador':
        return 'text-support';
      case 'Cliente':
        return 'text-support2';
      default:
        return 'text-muted-text';
    }
  };

  const getRoleBgColor = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-primary/10';
      case 'Joseador':
        return 'bg-support/10';
      case 'Cliente':
        return 'bg-support2/10';
      default:
        return 'bg-muted-text/10';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-primary transition-colors font-paragraph font-semibold">
            <ArrowLeft size={20} />
            <span>Volver al Panel</span>
          </Link>
          
          {/* Refresh Status */}
          <div className="flex items-center gap-3">
            {lastRefreshTime && (
              <span className="text-xs font-paragraph text-muted-text">
                Última actualización: {lastRefreshTime.toLocaleTimeString('es-ES')}
              </span>
            )}
            <motion.button
              onClick={loadData}
              disabled={isRefreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar ahora"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              >
                <RefreshCw size={20} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Title */}
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
              Verificación de Usuarios
            </h1>
            <p className="font-paragraph text-muted-text">
              Gestiona la verificación de usuarios reales de Wix Members. Los cambios se sincronizan automáticamente con todos los perfiles relacionados.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Activity size={28} className="text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Total</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{stats.total}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={28} className="text-accent" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Aprobados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-accent">{stats.aprobado}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={28} className="text-secondary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Pendientes</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-secondary">{stats.pendiente}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <XCircle size={28} className="text-destructive" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Rechazados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-destructive">{stats.rechazado}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <User size={28} className="text-support2" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Clientes</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-support2">{stats.clientes}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Award size={28} className="text-support" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Joseadores</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-support">{stats.joseadores}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={28} className="text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Admins</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-primary">{stats.admins}</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-3 text-muted-text" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Verification Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterVerification('all')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterVerification === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterVerification('Aprobado')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterVerification === 'Aprobado'
                    ? 'bg-accent text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Aprobados
              </button>
              <button
                onClick={() => setFilterVerification('Pendiente')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterVerification === 'Pendiente'
                    ? 'bg-secondary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilterVerification('Rechazado')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterVerification === 'Rechazado'
                    ? 'bg-destructive text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Rechazados
              </button>
            </div>

            {/* Role Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterRole === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Todos los Roles
              </button>
              <button
                onClick={() => setFilterRole('Cliente')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterRole === 'Cliente'
                    ? 'bg-support2 text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setFilterRole('Joseador')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterRole === 'Joseador'
                    ? 'bg-support text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Joseadores
              </button>
              <button
                onClick={() => setFilterRole('Admin')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterRole === 'Admin'
                    ? 'bg-primary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Administradores
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="font-paragraph text-muted-text">Cargando usuarios...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-paragraph text-muted-text">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Usuario</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Email</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Rol</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Estado</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Badges</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Último Login</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      const displayName = user.nickname || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre';
                      return (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border hover:bg-background/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.photoUrl ? (
                                <Image src={user.photoUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User size={20} className="text-primary" />
                                </div>
                              )}
                              <p className="font-paragraph font-semibold text-foreground">{displayName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-paragraph text-sm text-muted-text">{user.email || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role || 'member'}
                              onChange={(e) => handleChangeRole(user._id, e.target.value as 'Cliente' | 'Joseador' | 'Admin')}
                              className={`px-3 py-1 rounded-full font-paragraph text-sm font-semibold border-0 ${getRoleBgColor(user.role)} ${getRoleColor(user.role)} focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                              <option value="member">Usuario</option>
                              <option value="Cliente">Cliente</option>
                              <option value="Joseador">Joseador</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.verificationStatus || 'Pendiente'}
                              onChange={(e) => handleChangeVerificationStatus(user._id, e.target.value as 'Aprobado' | 'Pendiente' | 'Rechazado')}
                              className={`px-3 py-1 rounded-full font-paragraph text-sm font-semibold border-0 ${getVerificationBgColor(user.verificationStatus)} ${getVerificationColor(user.verificationStatus)} focus:outline-none focus:ring-2 focus:ring-primary`}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Aprobado">Aprobado</option>
                              <option value="Rechazado">Rechazado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={user.badges || ''}
                              onChange={(e) => handleUpdateBadges(user._id, e.target.value)}
                              placeholder="Agregar badges..."
                              className="px-3 py-1 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-[150px]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-paragraph text-sm text-muted-text">{formatLastLogin(user.lastLoginDate)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChangeVerificationStatus(user._id, 'Aprobado')}
                                className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                                title="Aprobar"
                              >
                                <CheckCircle size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChangeVerificationStatus(user._id, 'Rechazado')}
                                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                title="Rechazar"
                              >
                                <XCircle size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-4">
                <span className="font-paragraph text-sm text-muted-text">
                  Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalUsers)} de {totalUsers} usuarios
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </motion.button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <motion.button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-lg font-paragraph font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'border border-border hover:bg-background'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg border border-border hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
