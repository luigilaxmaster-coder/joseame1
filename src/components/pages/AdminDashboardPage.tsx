import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { DisputasdeTrabajos, TrabajosdeServicio, JobApplications, UserVerification } from '@/entities';
import { AlertTriangle, Briefcase, Users, LogOut, User, Shield, Edit2, Trash2, MapPin, DollarSign, Calendar, X, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function AdminDashboardPage() {
  const { member, actions } = useMember();
  const [disputes, setDisputes] = useState<DisputasdeTrabajos[]>([]);
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [applications, setApplications] = useState<JobApplications[]>([]);
  const [users, setUsers] = useState<UserVerification[]>([]);
  const [adminMember, setAdminMember] = useState(member);
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TrabajosdeServicio>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Update admin member info when member changes
    if (member) {
      setAdminMember(member);
    }
  }, [member]);

  const loadData = async () => {
    const [disputesData, jobsData, applicationsData, usersData] = await Promise.all([
      BaseCrudService.getAll<DisputasdeTrabajos>('jobdisputes'),
      BaseCrudService.getAll<TrabajosdeServicio>('servicejobs'),
      BaseCrudService.getAll<JobApplications>('jobapplications'),
      BaseCrudService.getAll<UserVerification>('userverification')
    ]);
    
    setDisputes(disputesData.items);
    setJobs(jobsData.items);
    setApplications(applicationsData.items);
    setUsers(usersData.items);
  };

  const handleEditJob = (job: TrabajosdeServicio) => {
    setEditingJobId(job._id);
    setEditFormData(job);
  };

  const handleSaveJob = async () => {
    if (!editingJobId) return;
    setIsLoading(true);
    try {
      await BaseCrudService.update<TrabajosdeServicio>('servicejobs', {
        _id: editingJobId,
        ...editFormData
      });
      setEditingJobId(null);
      setEditFormData({});
      await loadData();
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      await BaseCrudService.delete('servicejobs', jobId);
      setDeleteConfirmId(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setEditFormData({});
  };

  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'in_review');
  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'in_progress');
  const unverifiedUsers = users.filter(u => !u.isVerified).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-heading text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              JOSEAME Admin
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-background transition-colors">
                  <User size={20} className="text-muted-text" />
                  <span className="font-paragraph text-sm text-foreground hidden md:block">
                    {adminMember?.profile?.nickname || adminMember?.contact?.firstName || 'Admin'}
                  </span>
                </button>
              </Link>
              <button
                onClick={() => {
                  const { clearAllUserData } = useRoleStore.getState();
                  clearAllUserData();
                  actions.logout();
                }}
                className="flex items-center gap-2 px-4 py-2 text-muted-text hover:text-foreground transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            Panel de Administración
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={28} className="text-destructive" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Disputas Activas</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{openDisputes.length}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={28} className="text-primary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Trabajos Activos</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{activeJobs.length}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={28} className="text-secondary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Total Trabajos</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{jobs.length}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Users size={28} className="text-accent" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Aplicaciones</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{applications.length}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link to="/admin/disputes">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-6 md:p-8 border border-destructive/20 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
              >
                <AlertTriangle size={32} className="text-destructive mb-3 md:mb-4" />
                <h3 className="font-heading text-lg md:text-2xl font-bold text-foreground mb-2">
                  Gestionar Disputas
                </h3>
                <p className="font-paragraph text-sm md:text-base text-muted-text mb-4 flex-grow">
                  Revisa y resuelve disputas entre clientes y Joseadores
                </p>
                <div className="flex items-center gap-2 text-destructive font-paragraph font-semibold text-sm md:text-base">
                  <span>{openDisputes.length} disputas pendientes</span>
                </div>
              </motion.div>
            </Link>

            <Link to="/admin/users-verification">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 md:p-8 border border-accent/20 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
              >
                <Shield size={32} className="text-accent mb-3 md:mb-4" />
                <h3 className="font-heading text-lg md:text-2xl font-bold text-foreground mb-2">
                  Verificación de Usuarios
                </h3>
                <p className="font-paragraph text-sm md:text-base text-muted-text mb-4 flex-grow">
                  Gestiona la verificación de Joseadores y sus piquetes
                </p>
                <div className="flex items-center gap-2 text-accent font-paragraph font-semibold text-sm md:text-base">
                  <span>{unverifiedUsers} usuarios sin verificar</span>
                </div>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setShowJobsModal(true)}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
            >
              <Briefcase size={32} className="text-primary mb-3 md:mb-4" />
              <h3 className="font-heading text-lg md:text-2xl font-bold text-foreground mb-2">
                Monitorear Trabajos
              </h3>
              <p className="font-paragraph text-sm md:text-base text-muted-text mb-4 flex-grow">
                Supervisa todos los trabajos en la plataforma
              </p>
              <div className="flex items-center gap-2 text-primary font-paragraph font-semibold text-sm md:text-base">
                <span>{activeJobs.length} trabajos activos</span>
              </div>
            </motion.div>
          </div>

          {/* Jobs Modal */}
          {showJobsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowJobsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">
                    Monitorear Trabajos ({jobs.length})
                  </h2>
                  <button
                    onClick={() => setShowJobsModal(false)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <X size={24} className="text-muted-text" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase size={48} className="mx-auto text-muted-text mb-4 opacity-50" />
                      <p className="font-paragraph text-muted-text">No hay trabajos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          {editingJobId === job._id ? (
                            // Edit Mode
                            <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                              <h3 className="font-heading text-lg font-bold text-foreground mb-4">
                                Editar Trabajo
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">
                                    Título
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.jobTitle || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                </div>

                                <div>
                                  <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">
                                    Descripción
                                  </label>
                                  <textarea
                                    value={editFormData.description || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">
                                      Presupuesto
                                    </label>
                                    <input
                                      type="number"
                                      value={editFormData.budget || ''}
                                      onChange={(e) => setEditFormData({ ...editFormData, budget: parseFloat(e.target.value) })}
                                      className="w-full px-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                  </div>

                                  <div>
                                    <label className="block font-paragraph text-sm font-semibold text-foreground mb-2">
                                      Estado
                                    </label>
                                    <select
                                      value={editFormData.status || ''}
                                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                      className="w-full px-4 py-2 border border-border rounded-lg font-paragraph text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                      <option value="open">Abierto</option>
                                      <option value="in_progress">En Progreso</option>
                                      <option value="completed">Completado</option>
                                      <option value="cancelled">Cancelado</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSaveJob}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-paragraph font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    <Check size={18} />
                                    {isLoading ? 'Guardando...' : 'Guardar'}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCancelEdit}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 border-2 border-primary/30 text-foreground font-paragraph font-semibold rounded-lg hover:bg-primary/5 transition-all disabled:opacity-50"
                                  >
                                    Cancelar
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                                    {job.jobTitle}
                                  </h3>
                                  <p className="font-paragraph text-sm text-muted-text mb-3 line-clamp-2">
                                    {job.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-text">
                                      <DollarSign size={16} />
                                      <span className="font-paragraph font-semibold">${job.budget}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-text">
                                      <MapPin size={16} />
                                      <span className="font-paragraph text-xs">{job.locationAddress}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-text">
                                      <Calendar size={16} />
                                      <span className="font-paragraph text-xs">
                                        {job.postedDate ? new Date(job.postedDate).toLocaleDateString('es-DO') : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className={`px-3 py-1 rounded-full text-xs font-paragraph font-semibold ${
                                    job.status === 'open' ? 'bg-primary/10 text-primary' :
                                    job.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                                    job.status === 'completed' ? 'bg-accent/10 text-accent' :
                                    'bg-destructive/10 text-destructive'
                                  }`}>
                                    {job.status === 'open' ? 'Abierto' :
                                     job.status === 'in_progress' ? 'En Progreso' :
                                     job.status === 'completed' ? 'Completado' :
                                     'Cancelado'}
                                  </span>
                                </div>
                              </div>

                              {job.jobImage && (
                                <div className="mb-4 rounded-lg overflow-hidden h-40 bg-gray-200">
                                  <Image
                                    src={job.jobImage}
                                    alt={job.jobTitle || 'Job image'}
                                    className="w-full h-full object-cover"
                                    width={300}
                                  />
                                </div>
                              )}

                              <div className="flex gap-3 pt-4 border-t border-border">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditJob(job)}
                                  className="flex-1 px-4 py-2 bg-primary/10 text-primary font-paragraph font-semibold rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setDeleteConfirmId(job._id)}
                                  className="flex-1 px-4 py-2 bg-destructive/10 text-destructive font-paragraph font-semibold rounded-lg hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Eliminar
                                </motion.button>
                              </div>

                              {/* Delete Confirmation */}
                              {deleteConfirmId === job._id && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg"
                                >
                                  <p className="font-paragraph text-sm text-destructive font-semibold mb-3">
                                    ¿Estás seguro de que deseas eliminar este trabajo? Esta acción no se puede deshacer.
                                  </p>
                                  <div className="flex gap-3">
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handleDeleteJob(job._id)}
                                      disabled={isLoading}
                                      className="flex-1 px-3 py-2 bg-destructive text-white font-paragraph font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm"
                                    >
                                      {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setDeleteConfirmId(null)}
                                      disabled={isLoading}
                                      className="flex-1 px-3 py-2 border-2 border-destructive/30 text-destructive font-paragraph font-semibold rounded-lg hover:bg-destructive/5 transition-all disabled:opacity-50 text-sm"
                                    >
                                      Cancelar
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Disputas Recientes
              </h2>
              <Link to="/admin/disputes" className="font-paragraph text-primary hover:text-secondary transition-colors">
                Ver todas
              </Link>
            </div>
            {openDisputes.length === 0 ? (
              <p className="font-paragraph text-muted-text text-center py-8">
                No hay disputas pendientes
              </p>
            ) : (
              <div className="space-y-4">
                {openDisputes.slice(0, 5).map((dispute) => (
                  <Link key={dispute._id} to={`/admin/dispute/${dispute._id}`}>
                    <div className="p-4 bg-background rounded-xl hover:bg-border/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-foreground mb-1">
                            {dispute.title}
                          </h3>
                          <p className="font-paragraph text-sm text-muted-text mb-2">
                            {dispute.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-text">
                            <span>Trabajo: {dispute.jobTitle}</span>
                            <span>Por: {dispute.raisedByRole === 'client' ? 'Cliente' : 'Joseador'}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-paragraph ${
                          dispute.status === 'open' ? 'bg-destructive/10 text-destructive' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {dispute.status === 'open' ? 'Abierta' : 'En Revisión'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
