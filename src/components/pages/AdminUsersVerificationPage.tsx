import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserVerification, PiqueteBalances } from '@/entities';
import { ArrowLeft, Search, CheckCircle, XCircle, Plus, Minus, Shield, RefreshCw, Activity, Clock } from 'lucide-react';

interface MemberData {
  _id: string;
  loginEmail?: string;
  contact?: {
    firstName?: string;
    lastName?: string;
  };
  profile?: {
    nickname?: string;
    photo?: {
      url?: string;
    };
  };
  lastLoginDate?: Date;
  _createdDate?: Date;
  _updatedDate?: Date;
}

interface UserWithBalance extends MemberData {
  balance?: PiqueteBalances;
  isVerified?: boolean;
  verificationDate?: Date;
  isActive?: boolean;
  lastActivityTime?: Date;
  activityStatus?: 'online' | 'idle' | 'offline';
}

export default function AdminUsersVerificationPage() {
  const { member } = useMember();
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithBalance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterActivity, setFilterActivity] = useState<'all' | 'online' | 'idle' | 'offline'>('all');
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [piqueteInput, setPiqueteInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousUserCountRef = useRef(0);
  const activityTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    loadUsers();
    previousUserCountRef.current = 0;

    // Set up polling interval - refresh every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      loadUsers();
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      // Clear all activity timers
      activityTimersRef.current.forEach(timer => clearTimeout(timer));
      activityTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterVerified, filterActivity]);

  const loadUsers = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch all required data
      const [verificationData, balancesData, membersData] = await Promise.all([
        BaseCrudService.getAll<UserVerification>('userverification').catch(err => {
          console.error('Error fetching userverification:', err);
          return { items: [] };
        }),
        BaseCrudService.getAll<PiqueteBalances>('piquetebalances').catch(err => {
          console.error('Error fetching piquetebalances:', err);
          return { items: [] };
        }),
        BaseCrudService.getAll<MemberData>('Members/FullData').catch(err => {
          console.error('Error fetching Members/FullData:', err);
          return { items: [] };
        })
      ]);

      console.log('Loaded data:', {
        membersCount: membersData.items?.length || 0,
        verificationCount: verificationData.items?.length || 0,
        balancesCount: balancesData.items?.length || 0
      });

      // Create a map of verified users for quick lookup
      const verifiedUsersMap = new Map(
        (verificationData.items || []).map(user => [user.joseadorEmail, user])
      );

      // Combine member data with verification and balance data
      const usersWithBalance: UserWithBalance[] = (membersData.items || [])
        .filter(member => member.loginEmail) // Only include members with email
        .map(member => {
          const verificationInfo = verifiedUsersMap.get(member.loginEmail);
          const balance = (balancesData.items || []).find(b => b.joseadorEmail === member.loginEmail);
          const lastActivity = member.lastLoginDate ? new Date(member.lastLoginDate) : (member._updatedDate ? new Date(member._updatedDate) : new Date());
          const now = new Date();
          const timeDiffMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

          // Determine activity status based on last login time
          let activityStatus: 'online' | 'idle' | 'offline' = 'offline';
          if (timeDiffMinutes < 5) {
            activityStatus = 'online';
          } else if (timeDiffMinutes < 30) {
            activityStatus = 'idle';
          } else {
            activityStatus = 'offline';
          }

          return {
            ...member,
            balance,
            isVerified: verificationInfo?.isVerified || false,
            verificationDate: verificationInfo?.verificationDate,
            lastActivityTime: lastActivity,
            activityStatus,
            isActive: activityStatus === 'online' || activityStatus === 'idle'
          } as UserWithBalance;
        });

      console.log('Processed users:', usersWithBalance.length);

      // Detect new users
      const currentUserCount = usersWithBalance.length;
      if (previousUserCountRef.current > 0 && currentUserCount > previousUserCountRef.current) {
        const newCount = currentUserCount - previousUserCountRef.current;
        setNewUsersCount(newCount);
        // Auto-clear the notification after 5 seconds
        setTimeout(() => setNewUsersCount(0), 5000);
      }
      previousUserCountRef.current = currentUserCount;

      setUsers(usersWithBalance);
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const displayName = user.profile?.nickname || user.contact?.firstName || user.loginEmail || '';
        return displayName.toLowerCase().includes(term) ||
          user.loginEmail?.toLowerCase().includes(term);
      });
    }

    // Filter by verification status
    if (filterVerified === 'verified') {
      filtered = filtered.filter(user => user.isVerified === true);
    } else if (filterVerified === 'unverified') {
      filtered = filtered.filter(user => user.isVerified !== true);
    }

    // Filter by activity status
    if (filterActivity !== 'all') {
      filtered = filtered.filter(user => user.activityStatus === filterActivity);
    }

    setFilteredUsers(filtered);
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      // Update or create verification record
      const verificationId = user._id;
      const verificationData = {
        _id: verificationId,
        joseadorId: userId,
        joseadorEmail: user.loginEmail || '',
        joseadorName: user.profile?.nickname || user.contact?.firstName || user.loginEmail || '',
        isVerified: !currentStatus,
        verificationDate: !currentStatus ? new Date().toISOString() : undefined,
        verifiedByAdmin: !currentStatus ? member?.profile?.nickname || member?.loginEmail || 'Admin' : undefined
      };

      // Try to update existing verification record
      await BaseCrudService.update('userverification', verificationData);
      await loadUsers();
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const updatePiquetes = async (userId: string, userEmail: string, action: 'add' | 'remove', amount: number) => {
    if (amount <= 0) return;

    try {
      // Find or create balance record
      let balance = users.find(u => u._id === userId)?.balance;

      if (!balance) {
        // Create new balance record
        const newBalance: PiqueteBalances = {
          _id: crypto.randomUUID(),
          joseadorEmail: userEmail,
          joseadorId: userId,
          currentBalance: action === 'add' ? amount : -amount,
          freeQuotaBalance: 0,
          totalPiquetesEarned: action === 'add' ? amount : 0,
          totalPiquetesSpent: action === 'remove' ? amount : 0,
          lastUpdated: new Date().toISOString()
        };
        await BaseCrudService.create('piquetebalances', newBalance);
      } else {
        // Update existing balance
        const newBalance = action === 'add'
          ? (balance.currentBalance || 0) + amount
          : (balance.currentBalance || 0) - amount;

        await BaseCrudService.update('piquetebalances', {
          _id: balance._id,
          currentBalance: newBalance,
          totalPiquetesEarned: action === 'add'
            ? (balance.totalPiquetesEarned || 0) + amount
            : balance.totalPiquetesEarned,
          totalPiquetesSpent: action === 'remove'
            ? (balance.totalPiquetesSpent || 0) + amount
            : balance.totalPiquetesSpent,
          lastUpdated: new Date().toISOString()
        });
      }

      await loadUsers();
      setEditingUserId(null);
      setPiqueteInput('');
    } catch (error) {
      console.error('Error updating piquetes:', error);
    }
  };

  const verifiedCount = users.filter(u => u.isVerified).length;
  const unverifiedCount = users.length - verifiedCount;
  const onlineCount = users.filter(u => u.activityStatus === 'online').length;
  const idleCount = users.filter(u => u.activityStatus === 'idle').length;
  const offlineCount = users.filter(u => u.activityStatus === 'offline').length;

  const getActivityColor = (status?: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online':
        return 'text-accent';
      case 'idle':
        return 'text-secondary';
      case 'offline':
        return 'text-muted-text';
      default:
        return 'text-muted-text';
    }
  };

  const getActivityBgColor = (status?: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online':
        return 'bg-accent/10';
      case 'idle':
        return 'bg-secondary/10';
      case 'offline':
        return 'bg-muted-text/10';
      default:
        return 'bg-muted-text/10';
    }
  };

  const getActivityLabel = (status?: 'online' | 'idle' | 'offline') => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'idle':
        return 'Inactivo';
      case 'offline':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-DO');
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
              onClick={loadUsers}
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
          {/* New Users Notification */}
          {newUsersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-accent/10 border border-accent rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CheckCircle size={24} className="text-accent" />
                </motion.div>
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {newUsersCount} nuevo{newUsersCount > 1 ? 's' : ''} usuario{newUsersCount > 1 ? 's' : ''} registrado{newUsersCount > 1 ? 's' : ''}
                  </p>
                  <p className="font-paragraph text-sm text-muted-text">
                    {newUsersCount > 1 ? 'Los nuevos usuarios' : 'El nuevo usuario'} aparecerá{newUsersCount > 1 ? 'n' : ''} en la lista abajo
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {/* Title */}
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
              Verificación de Usuarios
            </h1>
            <p className="font-paragraph text-muted-text">
              Gestiona la verificación de Joseadores y administra sus piquetes
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={28} className="text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Total de Usuarios</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{users.length}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={28} className="text-accent" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Verificados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-accent">{verifiedCount}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <XCircle size={28} className="text-destructive" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Sin Verificar</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-destructive">{unverifiedCount}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Activity size={28} className="text-accent" />
                </motion.div>
                <h3 className="font-heading text-lg font-semibold text-foreground">En Línea</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-accent">{onlineCount}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={28} className="text-secondary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Inactivos</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-secondary">{idleCount}</p>
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

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterVerified('all')}
                  className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                    filterVerified === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-background text-foreground border border-border hover:bg-border'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterVerified('verified')}
                  className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                    filterVerified === 'verified'
                      ? 'bg-accent text-white'
                      : 'bg-background text-foreground border border-border hover:bg-border'
                  }`}
                >
                  Verificados
                </button>
                <button
                  onClick={() => setFilterVerified('unverified')}
                  className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                    filterVerified === 'unverified'
                      ? 'bg-destructive text-white'
                      : 'bg-background text-foreground border border-border hover:bg-border'
                  }`}
                >
                  Sin Verificar
                </button>
              </div>
            </div>

            {/* Activity Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterActivity('all')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all ${
                  filterActivity === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                Todos los Estados
              </button>
              <button
                onClick={() => setFilterActivity('online')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 ${
                  filterActivity === 'online'
                    ? 'bg-accent text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className={`w-2 h-2 rounded-full ${
                    filterActivity === 'online' ? 'bg-white' : 'bg-accent'
                  }`} />
                </motion.div>
                En Línea
              </button>
              <button
                onClick={() => setFilterActivity('idle')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 ${
                  filterActivity === 'idle'
                    ? 'bg-secondary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  filterActivity === 'idle' ? 'bg-white' : 'bg-secondary'
                }`} />
                Inactivos
              </button>
              <button
                onClick={() => setFilterActivity('offline')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 ${
                  filterActivity === 'offline'
                    ? 'bg-muted-text text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  filterActivity === 'offline' ? 'bg-white' : 'bg-muted-text'
                }`} />
                Desconectados
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="font-paragraph text-muted-text">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-paragraph text-muted-text">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Nombre</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Email</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Estado Actividad</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Última Actividad</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Piquetes</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Verificación</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border hover:bg-background/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-paragraph font-semibold text-foreground">{user.profile?.nickname || user.contact?.firstName || user.loginEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-paragraph text-sm text-muted-text">{user.loginEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-paragraph text-sm font-semibold ${getActivityBgColor(user.activityStatus)} ${getActivityColor(user.activityStatus)}`}>
                            {user.activityStatus === 'online' && (
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                <div className="w-2 h-2 rounded-full bg-current" />
                              </motion.div>
                            )}
                            {user.activityStatus === 'idle' && <div className="w-2 h-2 rounded-full bg-current" />}
                            {user.activityStatus === 'offline' && <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                            {getActivityLabel(user.activityStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-paragraph text-sm text-muted-text">{formatLastActivity(user.lastActivityTime)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-primary">
                              {user.balance?.currentBalance || 0}
                            </span>
                            {editingUserId === user._id ? (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={piqueteInput}
                                  onChange={(e) => setPiqueteInput(e.target.value)}
                                  placeholder="Cantidad"
                                  className="w-20 px-2 py-1 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                  onClick={() => updatePiquetes(user._id, user.loginEmail || '', 'add', parseInt(piqueteInput) || 0)}
                                  className="p-1 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
                                  title="Agregar piquetes"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  onClick={() => updatePiquetes(user._id, user.loginEmail || '', 'remove', parseInt(piqueteInput) || 0)}
                                  className="p-1 bg-destructive text-white rounded-lg hover:bg-destructive/80 transition-colors"
                                  title="Quitar piquetes"
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setPiqueteInput('');
                                  }}
                                  className="px-2 py-1 bg-muted-text/20 text-foreground rounded-lg hover:bg-muted-text/30 transition-colors font-paragraph text-sm"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingUserId(user._id)}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-paragraph text-sm"
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full font-paragraph text-sm font-semibold">
                                <CheckCircle size={16} />
                                Verificado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-full font-paragraph text-sm font-semibold">
                                <XCircle size={16} />
                                Sin Verificar
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleVerification(user._id, user.isVerified || false)}
                            className={`px-4 py-2 rounded-lg font-paragraph font-semibold transition-all ${
                              user.isVerified
                                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                : 'bg-accent/10 text-accent hover:bg-accent/20'
                            }`}
                          >
                            {user.isVerified ? 'Desverificar' : 'Verificar'}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
