import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ArrowRight, Zap, MapPin, DollarSign, Users, Star, TrendingUp } from 'lucide-react';
import { useMember } from '@/integrations';
import { useRoleStore } from '@/store/roleStore';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [selectedRole, setSelectedRole] = useState<'client' | 'joseador' | null>(null);
  const { setUserRole } = useRoleStore();

  const handleContinue = () => {
    if (selectedRole === 'client') {
      setUserRole('client');
      navigate('/client/onboarding');
    } else if (selectedRole === 'joseador') {
      setUserRole('joseador');
      navigate('/joseador/onboarding');
    }
  };

  // Animated background elements
  const FloatingElement = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
    <motion.div
      animate={{
        y: [0, 30, 0],
        x: [0, 20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute rounded-full opacity-10 pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    />
  );

  const clientFeatures = [
    { icon: Zap, label: 'Publica trabajos ilimitados' },
    { icon: Users, label: 'Recibe aplicaciones de Joseadores' },
    { icon: DollarSign, label: 'Paga de forma segura' },
  ];

  const joseadorFeatures = [
    { icon: MapPin, label: 'Encuentra trabajos cerca de ti' },
    { icon: TrendingUp, label: 'Aplica a múltiples proyectos' },
    { icon: Star, label: 'Recibe pagos seguros' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background overflow-hidden relative">
      {/* Animated background elements */}
      <FloatingElement delay={0} duration={8} x={10} y={20} />
      <FloatingElement delay={1} duration={10} x={80} y={70} />
      <FloatingElement delay={2} duration={12} x={50} y={50} />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Briefcase className="text-white" size={32} />
              </div>
            </motion.div>

            <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              ¡Bienvenido{member?.profile?.nickname ? `, ${member.profile.nickname}` : ''}!
            </h1>
            <p className="font-paragraph text-xl md:text-2xl text-muted-text max-w-2xl mx-auto">
              Elige tu rol y comienza a conectar con oportunidades increíbles
            </p>
          </motion.div>

          {/* Role Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {/* Cliente Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              onClick={() => setSelectedRole('client')}
              className={`relative group cursor-pointer`}
            >
              {/* Card Background Glow */}
              <div
                className={`absolute inset-0 rounded-3xl transition-all duration-300 ${
                  selectedRole === 'client'
                    ? 'bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl'
                    : 'bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:shadow-xl'
                }`}
              />

              {/* Card Content */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border-2 transition-all duration-300"
                style={{
                  borderColor: selectedRole === 'client' ? '#0E9FA8' : '#E5E7EB',
                }}
              >
                {/* Top Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block mb-6"
                >
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                    <span className="font-paragraph text-sm font-semibold text-primary">Para Clientes</span>
                  </div>
                </motion.div>

                {/* Icon */}
                <motion.div
                  animate={{ rotate: selectedRole === 'client' ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8 shadow-lg"
                >
                  <Search className="text-white" size={48} />
                </motion.div>

                {/* Title */}
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Soy Cliente
                </h2>

                {/* Description */}
                <p className="font-paragraph text-lg text-muted-text mb-8">
                  Necesito contratar profesionales para mis proyectos y trabajos
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {clientFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3 group/item"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                          <Icon className="text-primary" size={20} />
                        </div>
                        <span className="font-paragraph text-foreground">{feature.label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Selection Indicator */}
                {selectedRole === 'client' && (
                  <motion.div
                    layoutId="clientIndicator"
                    className="absolute top-6 right-6 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Joseador Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              onClick={() => setSelectedRole('joseador')}
              className={`relative group cursor-pointer`}
            >
              {/* Card Background Glow */}
              <div
                className={`absolute inset-0 rounded-3xl transition-all duration-300 ${
                  selectedRole === 'joseador'
                    ? 'bg-gradient-to-br from-secondary/20 to-accent/20 shadow-2xl'
                    : 'bg-gradient-to-br from-secondary/5 to-accent/5 group-hover:shadow-xl'
                }`}
              />

              {/* Card Content */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border-2 transition-all duration-300"
                style={{
                  borderColor: selectedRole === 'joseador' ? '#3AB689' : '#E5E7EB',
                }}
              >
                {/* Top Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block mb-6"
                >
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-secondary/20 to-accent/20 border border-secondary/30">
                    <span className="font-paragraph text-sm font-semibold text-secondary">Para Joseadores</span>
                  </div>
                </motion.div>

                {/* Icon */}
                <motion.div
                  animate={{ rotate: selectedRole === 'joseador' ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-8 shadow-lg"
                >
                  <Briefcase className="text-white" size={48} />
                </motion.div>

                {/* Title */}
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Soy Joseador
                </h2>

                {/* Description */}
                <p className="font-paragraph text-lg text-muted-text mb-8">
                  Quiero ofrecer mis servicios profesionales y ganar dinero
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {joseadorFeatures.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3 group/item"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                          <Icon className="text-secondary" size={20} />
                        </div>
                        <span className="font-paragraph text-foreground">{feature.label}</span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Selection Indicator */}
                {selectedRole === 'joseador' && (
                  <motion.div
                    layoutId="joseadorIndicator"
                    className="absolute top-6 right-6 w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: selectedRole ? 1.05 : 1 }}
              whileTap={{ scale: selectedRole ? 0.95 : 1 }}
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-12 py-5 font-heading text-lg font-semibold rounded-2xl transition-all inline-flex items-center gap-3 ${
                selectedRole
                  ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg hover:shadow-2xl cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar
              <motion.div
                animate={{ x: selectedRole ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight size={24} />
              </motion.div>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-paragraph text-sm text-muted-text mt-8"
            >
              Podrás cambiar de rol en cualquier momento desde tu perfil
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
