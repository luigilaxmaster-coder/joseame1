import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { UserDirectory } from '@/entities';
import { ArrowLeft, Search, CheckCircle, XCircle, RefreshCw, Activity, Clock, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  syncAllMembersToDirectory, 
  getSyncStatus, 
  SyncResult 
} from '@/lib/sync-members-service';
import {
  listDirectoryUsers,
  getDirectoryStats,
  toggleVerificationStatus,
  getActivityStatus,
  formatLastActivity,
  DirectoryFilters
} from '@/lib/user-directory-service';
import { touchLastSeen } from '@/lib/user-directory-service';

interface DirectoryStats {
  total: number;
  verified: number;
  unverified: number;
  online: number;
  inactive: number;
  offline: number;
}

export default function AdminUsersVerificationPage() {
  const { member } = useMember();
  const [users, setUsers] = useState<UserDirectory[]>([]);
  const [stats, setStats] = useState<DirectoryStats>({
    total: 0,
    verified: 0,
    unverified: 0,
    online: 0,
    inactive: 0,
    offline: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [filterActivity, setFilterActivity] = useState<'all' | 'online' | 'inactive' | 'offline'>('all');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [showSyncResult, setShowSyncResult] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ wixMembersCount: 0, directoryMembersCount: 0, syncNeeded: false });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load users and stats
  const loadData = async () => {
    try {
      setIsRefreshing(true);
      
      // Get stats
      const newStats = await getDirectoryStats();
      setStats(newStats);

      // Get filtered users with pagination
      const filters: DirectoryFilters = {
        verificationStatus: filterVerified === 'all' ? 'all' : filterVerified === 'verified' ? 'VERIFIED' : 'UNVERIFIED',
        activityStatus: filterActivity === 'all' ? 'all' : filterActivity,
        search: searchTerm || undefined
      };

      const { items, total } = await listDirectoryUsers(
        filters,
        { limit: pageSize, offset: (currentPage - 1) * pageSize }
      );

      setUsers(items);
      setTotalUsers(total);
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
    checkSyncStatus();

    // Set up polling - refresh every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      loadData();
    }, 5000);

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
  }, [searchTerm, filterVerified, filterActivity]);

  // Reload when page changes
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  // Check sync status
  const checkSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  // Handle sync
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncAllMembersToDirectory();
      setSyncResult(result);
      setShowSyncResult(true);
      
      // Reload data after sync
      await loadData();
      await checkSyncStatus();
    } catch (error) {
      console.error('Error syncing members:', error);
      setSyncResult({
        success: false,
        message: 'Error during sync',
        created: 0,
        updated: 0,
        skipped: 0,
        errors: []
      });
      setShowSyncResult(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle verification toggle
  const handleToggleVerification = async (memberId: string) => {
    try {
      await toggleVerificationStatus(memberId);
      await loadData();
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  // Touch last seen when member logs in (called from other pages)
  useEffect(() => {
    if (member?.loginEmail) {
      touchLastSeen(member.loginEmail).catch(err => console.error('Error touching lastSeen:', err));
    }
  }, [member?.loginEmail]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const getActivityColor = (status: 'online' | 'inactive' | 'offline') => {
    switch (status) {
      case 'online':
        return 'text-accent';
      case 'inactive':
        return 'text-secondary';
      case 'offline':
        return 'text-muted-text';
    }
  };

  const getActivityBgColor = (status: 'online' | 'inactive' | 'offline') => {
    switch (status) {
      case 'online':
        return 'bg-accent/10';
      case 'inactive':
        return 'bg-secondary/10';
      case 'offline':
        return 'bg-muted-text/10';
    }
  };

  const getActivityLabel = (status: 'online' | 'inactive' | 'offline') => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'inactive':
        return 'Inactivo';
      case 'offline':
        return 'Desconectado';
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
          {/* Sync Status Alert */}
          {syncStatus.syncNeeded && !showSyncResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-secondary/10 border border-secondary rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    Sincronización de Usuarios Necesaria
                  </h3>
                  <p className="font-paragraph text-sm text-muted-text mb-4">
                    Se detectaron {syncStatus.wixMembersCount - syncStatus.directoryMembersCount} usuario(s) nuevo(s) en Wix que no están en el directorio.
                    Haz clic en "Sincronizar Ahora" para importar todos los usuarios.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-paragraph text-muted-text mb-4">
                    <span>Usuarios en Wix: <strong className="text-foreground">{syncStatus.wixMembersCount}</strong></span>
                    <span>En Directorio: <strong className="text-foreground">{syncStatus.directoryMembersCount}</strong></span>
                  </div>
                  <motion.button
                    onClick={handleSync}
                    disabled={isSyncing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white font-heading font-semibold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 1, repeat: isSyncing ? Infinity : 0 }}
                    >
                      <Download size={18} />
                    </motion.div>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sync Result Alert */}
          {showSyncResult && syncResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl p-6 border ${
                syncResult.success
                  ? 'bg-accent/10 border-accent'
                  : 'bg-destructive/10 border-destructive'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    {syncResult.success ? '✓ Sincronización Completada' : '✗ Error en la Sincronización'}
                  </h3>
                  <p className="font-paragraph text-sm text-muted-text mb-3">
                    {syncResult.message}
                  </p>
                  {(syncResult.created > 0 || syncResult.updated > 0 || syncResult.skipped > 0) && (
                    <div className="grid grid-cols-3 gap-3 text-xs font-paragraph mb-4">
                      {syncResult.created > 0 && (
                        <div className="bg-white/50 rounded-lg p-2">
                          <p className="text-muted-text">Creados</p>
                          <p className="font-heading font-semibold text-accent">{syncResult.created}</p>
                        </div>
                      )}
                      {syncResult.updated > 0 && (
                        <div className="bg-white/50 rounded-lg p-2">
                          <p className="text-muted-text">Actualizados</p>
                          <p className="font-heading font-semibold text-secondary">{syncResult.updated}</p>
                        </div>
                      )}
                      {syncResult.skipped > 0 && (
                        <div className="bg-white/50 rounded-lg p-2">
                          <p className="text-muted-text">Omitidos</p>
                          <p className="font-heading font-semibold text-muted-text">{syncResult.skipped}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {syncResult.errors.length > 0 && (
                    <div className="bg-white/50 rounded-lg p-3 mb-4">
                      <p className="font-heading text-xs font-semibold text-destructive mb-2">
                        Errores ({syncResult.errors.length}):
                      </p>
                      <ul className="space-y-1 text-xs font-paragraph text-muted-text">
                        {syncResult.errors.slice(0, 3).map((err, idx) => (
                          <li key={idx}>• {err.email || err.memberId}: {err.error}</li>
                        ))}
                        {syncResult.errors.length > 3 && (
                          <li>... y {syncResult.errors.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <motion.button
                    onClick={() => setShowSyncResult(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-xs px-3 py-1 bg-white/50 text-foreground rounded-lg hover:bg-white transition-colors font-paragraph font-semibold"
                  >
                    Cerrar
                  </motion.button>
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
              Gestiona la verificación de usuarios y monitorea su actividad en tiempo real
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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
                <h3 className="font-heading text-lg font-semibold text-foreground">Verificados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-accent">{stats.verified}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <XCircle size={28} className="text-destructive" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Sin Verificar</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-destructive">{stats.unverified}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-7 h-7 rounded-full bg-accent" />
                </motion.div>
                <h3 className="font-heading text-lg font-semibold text-foreground">En Línea</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-accent">{stats.online}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={28} className="text-secondary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Inactivos</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-secondary">{stats.inactive}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-muted-text/30" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Desconectados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-muted-text">{stats.offline}</p>
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
                onClick={() => setFilterActivity('inactive')}
                className={`px-4 py-2 rounded-xl font-paragraph font-semibold transition-all flex items-center gap-2 ${
                  filterActivity === 'inactive'
                    ? 'bg-secondary text-white'
                    : 'bg-background text-foreground border border-border hover:bg-border'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  filterActivity === 'inactive' ? 'bg-white' : 'bg-secondary'
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
            ) : users.length === 0 ? (
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
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Estado</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Última Actividad</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Verificación</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      const activityStatus = getActivityStatus(user.lastSeen);
                      return (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border hover:bg-background/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-paragraph font-semibold text-foreground">{user.fullName}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-paragraph text-sm text-muted-text">{user.email || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-paragraph text-sm font-semibold ${getActivityBgColor(activityStatus)} ${getActivityColor(activityStatus)}`}>
                              {activityStatus === 'online' && (
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                  <div className="w-2 h-2 rounded-full bg-current" />
                                </motion.div>
                              )}
                              {activityStatus === 'inactive' && <div className="w-2 h-2 rounded-full bg-current" />}
                              {activityStatus === 'offline' && <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                              {getActivityLabel(activityStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-paragraph text-sm text-muted-text">{formatLastActivity(user.lastSeen)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.verificationStatus === 'VERIFIED' ? (
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
                              onClick={() => handleToggleVerification(user.memberId || '')}
                              className={`px-4 py-2 rounded-lg font-paragraph font-semibold transition-all ${
                                user.verificationStatus === 'VERIFIED'
                                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                  : 'bg-accent/10 text-accent hover:bg-accent/20'
                              }`}
                            >
                              {user.verificationStatus === 'VERIFIED' ? 'Desverificar' : 'Verificar'}
                            </motion.button>
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
