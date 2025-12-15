import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { DisputasdeTrabajos, TrabajosdeServicio, JobApplications, UserVerification } from '@/entities';
import { AlertTriangle, Briefcase, Users, LogOut, User, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  const { member, actions } = useMember();
  const [disputes, setDisputes] = useState<DisputasdeTrabajos[]>([]);
  const [jobs, setJobs] = useState<TrabajosdeServicio[]>([]);
  const [applications, setApplications] = useState<JobApplications[]>([]);
  const [users, setUsers] = useState<UserVerification[]>([]);

  useEffect(() => {
    loadData();
  }, []);

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
                    {member?.profile?.nickname || 'Admin'}
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
                className="bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-2xl p-8 border border-destructive/20 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <AlertTriangle size={40} className="text-destructive mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Gestionar Disputas
                </h3>
                <p className="font-paragraph text-muted-text mb-4">
                  Revisa y resuelve disputas entre clientes y Joseadores
                </p>
                <div className="flex items-center gap-2 text-destructive font-paragraph font-semibold">
                  <span>{openDisputes.length} disputas pendientes</span>
                </div>
              </motion.div>
            </Link>

            <Link to="/admin/users-verification">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20 shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <Shield size={40} className="text-accent mb-4" />
                <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                  Verificación de Usuarios
                </h3>
                <p className="font-paragraph text-muted-text mb-4">
                  Gestiona la verificación de Joseadores y sus piquetes
                </p>
                <div className="flex items-center gap-2 text-accent font-paragraph font-semibold">
                  <span>{unverifiedUsers} usuarios sin verificar</span>
                </div>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <Briefcase size={40} className="text-primary mb-4" />
              <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                Monitorear Trabajos
              </h3>
              <p className="font-paragraph text-muted-text mb-4">
                Supervisa todos los trabajos en la plataforma
              </p>
              <div className="flex items-center gap-2 text-primary font-paragraph font-semibold">
                <span>{activeJobs.length} trabajos activos</span>
              </div>
            </motion.div>
          </div>

          {/* Recent Disputes */}
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
