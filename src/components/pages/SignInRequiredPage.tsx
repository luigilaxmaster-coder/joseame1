import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { LogIn, Shield, Users, Briefcase, Sparkles, CheckCircle, Star, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SignInRequiredPage() {
  const { actions } = useMember();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Tu información está protegida con los más altos estándares de seguridad',
      color: 'from-primary to-support2',
    },
    {
      icon: Users,
      title: 'Comunidad Verificada',
      description: 'Conecta con profesionales y clientes verificados',
      color: 'from-accent to-support',
    },
    {
      icon: Briefcase,
      title: 'Gestión Completa',
      description: 'Administra tus trabajos y pagos en un solo lugar',
      color: 'from-support to-secondary',
    },
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Acceso instantáneo a miles de trabajos' },
    { icon: Star, text: 'Sistema de calificaciones transparente' },
    { icon: TrendingUp, text: 'Crece tu negocio con nosotros' },
    { icon: Award, text: 'Certificaciones y badges exclusivos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-support/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/30 to-support/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-support2/20 to-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="text-2xl font-heading font-bold bg-gradient-to-r from-primary via-support2 to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Piquete
            </motion.button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => actions.login()}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent/20 to-support/20 rounded-full border border-accent/30 shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold bg-gradient-to-r from-accent to-support bg-clip-text text-transparent">
                  Acceso Seguro y Rápido
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-heading text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-primary via-support2 to-accent bg-clip-text text-transparent">
                  Inicia Sesión
                </span>
                <br />
                <span className="text-foreground">para Continuar</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-muted-text leading-relaxed"
              >
                Accede a tu cuenta para gestionar tus trabajos, conectar con profesionales
                verificados y disfrutar de todas las funcionalidades de Piquete.
              </motion.p>
            </div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => actions.login()}
                  size="lg"
                  className="w-full sm:w-auto gap-3 text-lg px-10 py-7 bg-gradient-to-r from-primary via-support2 to-accent hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 text-white font-semibold relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent via-support to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <LogIn className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Iniciar Sesión Ahora</span>
                  <Zap className="w-5 h-5 relative z-10" />
                </Button>
              </motion.div>
              
              <p className="text-sm text-muted-text">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => actions.login()}
                  className="text-primary hover:text-accent font-semibold underline decoration-2 underline-offset-2 transition-colors"
                >
                  Regístrate gratis
                </button>
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 gap-4 pt-6"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all"
                >
                  <benefit.icon className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-border/50 hover:border-accent/50 hover:shadow-lg transition-all group"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-text leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Image & Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Image Card */}
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-3xl">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://static.wixstatic.com/media/307f6c_cf2b966e2f5e495fba48595306220934~mv2.png?originWidth=768&originHeight=576"
                    alt="Profesionales trabajando en equipo"
                    className="w-full h-full object-cover"
                    width={800}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-support2/40 to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="absolute bottom-0 left-0 right-0 p-8 text-white"
                  >
                    <h3 className="font-heading text-3xl font-bold mb-3 drop-shadow-lg">
                      Únete a Nuestra Comunidad
                    </h3>
                    <p className="text-white/95 text-lg drop-shadow-md">
                      Miles de profesionales y clientes confían en Piquete
                    </p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="absolute -top-8 -right-8 bg-gradient-to-br from-primary to-support2 rounded-3xl shadow-2xl p-8 border-4 border-white"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-heading font-bold text-white mb-2"
                >
                  10K+
                </motion.div>
                <div className="text-sm text-white/90 font-semibold">
                  Usuarios Activos
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="absolute -bottom-8 -left-8 bg-gradient-to-br from-accent to-support rounded-3xl shadow-2xl p-8 border-4 border-white"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="text-4xl font-heading font-bold text-white mb-2"
                >
                  98%
                </motion.div>
                <div className="text-sm text-white/90 font-semibold">
                  Satisfacción
                </div>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 -left-12 w-24 h-24 bg-gradient-to-br from-support/30 to-accent/30 rounded-full blur-xl"
            />
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 -right-12 w-32 h-32 bg-gradient-to-br from-primary/30 to-support2/30 rounded-full blur-xl"
            />
          </motion.div>
        </div>

        {/* Bottom Section - Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="mt-24 pt-16 border-t border-border/50"
        >
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="text-base text-muted-text font-semibold flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5 text-accent fill-accent" />
              Confiado por profesionales en toda la región
              <Star className="w-5 h-5 text-accent fill-accent" />
            </motion.p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-36 h-20 bg-gradient-to-br from-white to-background rounded-2xl flex items-center justify-center shadow-md border border-border/50 hover:shadow-xl transition-all"
              >
                <span className="text-muted-text/60 font-heading font-bold text-xl">
                  LOGO {i}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/70 backdrop-blur-md mt-24 relative z-10">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-muted-text font-medium">
              © 2026 Piquete. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.05, color: '#0E9FA8' }}
                onClick={() => navigate('/about')}
                className="text-sm text-muted-text hover:text-primary transition-colors font-medium"
              >
                Acerca de
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, color: '#0E9FA8' }}
                className="text-sm text-muted-text hover:text-primary transition-colors font-medium"
              >
                Privacidad
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, color: '#0E9FA8' }}
                className="text-sm text-muted-text hover:text-primary transition-colors font-medium"
              >
                Términos
              </motion.button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
