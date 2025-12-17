import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { UserVerification, PiqueteBalances } from '@/entities';
import { ArrowLeft, Search, CheckCircle, XCircle, Plus, Minus, Shield, RefreshCw } from 'lucide-react';

interface UserWithBalance extends UserVerification {
  balance?: PiqueteBalances;
}

export default function AdminUsersVerificationPage() {
  const { member } = useMember();
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithBalance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [piqueteInput, setPiqueteInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [newUsersCount, setNewUsersCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousUserCountRef = useRef(0);

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
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterVerified]);

  const loadUsers = async () => {
    try {
      setIsRefreshing(true);
      const [verificationData, balancesData] = await Promise.all([
        BaseCrudService.getAll<UserVerification>('userverification'),
        BaseCrudService.getAll<PiqueteBalances>('piquetebalances')
      ]);

      // Combine user verification data with their piquete balances
      const usersWithBalance: UserWithBalance[] = verificationData.items.map(user => {
        const balance = balancesData.items.find(b => b.joseadorEmail === user.joseadorEmail);
        return {
          ...user,
          balance
        };
      });

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
      filtered = filtered.filter(user =>
        user.joseadorName?.toLowerCase().includes(term) ||
        user.joseadorEmail?.toLowerCase().includes(term)
      );
    }

    // Filter by verification status
    if (filterVerified === 'verified') {
      filtered = filtered.filter(user => user.isVerified === true);
    } else if (filterVerified === 'unverified') {
      filtered = filtered.filter(user => user.isVerified !== true);
    }

    setFilteredUsers(filtered);
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await BaseCrudService.update('userverification', {
        _id: userId,
        isVerified: !currentStatus,
        verificationDate: !currentStatus ? new Date().toISOString() : undefined,
        verifiedByAdmin: !currentStatus ? member?.profile?.nickname || member?.loginEmail || 'Admin' : undefined
      });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="flex gap-2">
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
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Piquetes</th>
                      <th className="px-6 py-4 text-left font-heading font-semibold text-foreground">Estado</th>
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
                          <p className="font-paragraph font-semibold text-foreground">{user.joseadorName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-paragraph text-sm text-muted-text">{user.joseadorEmail}</p>
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
                                  onClick={() => updatePiquetes(user._id, user.joseadorEmail || '', 'add', parseInt(piqueteInput) || 0)}
                                  className="p-1 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
                                  title="Agregar piquetes"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  onClick={() => updatePiquetes(user._id, user.joseadorEmail || '', 'remove', parseInt(piqueteInput) || 0)}
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
