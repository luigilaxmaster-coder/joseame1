import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';
import { ArrowLeft, User, Mail, Calendar, Shield } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ProfilePage() {
  const { member, actions } = useMember();
  const { userRole, setUserRole } = useRoleStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            Mi Perfil
          </h1>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg mb-8">
            <div className="flex items-center gap-6 mb-8">
              {member?.profile?.photo?.url ? (
                <Image src={member.profile.photo.url} alt={member.profile.nickname || 'Usuario'} className="w-24 h-24 rounded-full object-cover border-4 border-primary" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
              <div>
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
                  {member?.profile?.nickname || member?.contact?.firstName || 'Usuario'}
                </h2>
                {member?.profile?.title && (
                  <p className="font-paragraph text-lg text-muted-text">
                    {member.profile.title}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {member?.loginEmail && (
                <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
                  <Mail size={24} className="text-primary" />
                  <div>
                    <p className="font-paragraph text-sm text-muted-text">Email</p>
                    <p className="font-paragraph text-foreground font-semibold">{member.loginEmail}</p>
                  </div>
                </div>
              )}

              {member?.contact?.firstName && (
                <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
                  <User size={24} className="text-primary" />
                  <div>
                    <p className="font-paragraph text-sm text-muted-text">Nombre Completo</p>
                    <p className="font-paragraph text-foreground font-semibold">
                      {member.contact.firstName} {member.contact.lastName}
                    </p>
                  </div>
                </div>
              )}

              {member?._createdDate && (
                <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
                  <Calendar size={24} className="text-primary" />
                  <div>
                    <p className="font-paragraph text-sm text-muted-text">Miembro desde</p>
                    <p className="font-paragraph text-foreground font-semibold">
                      {new Date(member._createdDate).toLocaleDateString('es-DO')}
                    </p>
                  </div>
                </div>
              )}

              {member?.status && (
                <div className="flex items-center gap-3 p-4 bg-background rounded-xl">
                  <Shield size={24} className="text-primary" />
                  <div>
                    <p className="font-paragraph text-sm text-muted-text">Estado de la Cuenta</p>
                    <p className="font-paragraph text-foreground font-semibold">
                      {member.status === 'APPROVED' ? 'Verificado' : 'Activo'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg mb-8">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
              Cambiar Rol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('client');
                  window.location.href = '/client/dashboard';
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Ir a Dashboard Cliente
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setUserRole('joseador');
                  window.location.href = '/joseador/dashboard';
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-secondary to-accent text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Ir a Dashboard Joseador
              </motion.button>
            </div>
          </div>

          {/* Logout */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={actions.logout}
              className="px-8 py-3 border-2 border-destructive text-destructive font-heading font-semibold rounded-xl hover:bg-destructive hover:text-white transition-all"
            >
              Cerrar Sesión
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
