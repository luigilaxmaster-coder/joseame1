import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ArrowRight } from 'lucide-react';
import { useMember } from '@/integrations';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [selectedRole, setSelectedRole] = useState<'client' | 'joseador' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'client') {
      navigate('/client/onboarding');
    } else if (selectedRole === 'joseador') {
      navigate('/joseador/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¡Bienvenido{member?.profile?.nickname ? `, ${member.profile.nickname}` : ''}!
          </h1>
          <p className="font-paragraph text-xl text-muted-text">
            ¿Cómo quieres usar JOSEAME hoy?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Cliente Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8 }}
            onClick={() => setSelectedRole('client')}
            className={`bg-white rounded-2xl p-8 md:p-10 border-2 cursor-pointer transition-all ${
              selectedRole === 'client'
                ? 'border-primary shadow-xl'
                : 'border-border shadow-sm hover:shadow-lg'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
              <Search className="text-white" size={40} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
              Soy Cliente
            </h2>
            <p className="font-paragraph text-lg text-muted-text mb-6">
              Necesito contratar profesionales para mis proyectos y trabajos
            </p>
            <ul className="space-y-3 font-paragraph text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Publica trabajos ilimitados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Recibe aplicaciones de Joseadores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Paga de forma segura</span>
              </li>
            </ul>
          </motion.div>

          {/* Joseador Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8 }}
            onClick={() => setSelectedRole('joseador')}
            className={`bg-white rounded-2xl p-8 md:p-10 border-2 cursor-pointer transition-all ${
              selectedRole === 'joseador'
                ? 'border-secondary shadow-xl'
                : 'border-border shadow-sm hover:shadow-lg'
            }`}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-6">
              <Briefcase className="text-white" size={40} />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
              Soy Joseador
            </h2>
            <p className="font-paragraph text-lg text-muted-text mb-6">
              Quiero ofrecer mis servicios profesionales y ganar dinero
            </p>
            <ul className="space-y-3 font-paragraph text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Encuentra trabajos cerca de ti</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Aplica a múltiples proyectos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">✓</span>
                <span>Recibe pagos seguros</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: selectedRole ? 1.05 : 1 }}
            whileTap={{ scale: selectedRole ? 0.95 : 1 }}
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-12 py-5 font-heading text-lg font-semibold rounded-xl transition-all ${
              selectedRole
                ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
            <ArrowRight className="inline-block ml-2" size={24} />
          </motion.button>
          <p className="font-paragraph text-sm text-muted-text mt-6">
            Podrás cambiar de rol en cualquier momento desde tu perfil
          </p>
        </motion.div>
      </div>
    </div>
  );
}
