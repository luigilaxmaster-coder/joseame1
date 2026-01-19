import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { LogIn, Shield, Users, Briefcase } from 'lucide-react';
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
    },
    {
      icon: Users,
      title: 'Comunidad Verificada',
      description: 'Conecta con profesionales y clientes verificados',
    },
    {
      icon: Briefcase,
      title: 'Gestión Completa',
      description: 'Administra tus trabajos y pagos en un solo lugar',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-heading font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Piquete
            </button>
            <Button
              onClick={() => actions.login()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Acceso Seguro</span>
              </div>
              
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Inicia Sesión para Continuar
              </h1>
              
              <p className="text-lg text-muted-text leading-relaxed">
                Accede a tu cuenta para gestionar tus trabajos, conectar con profesionales
                verificados y disfrutar de todas las funcionalidades de Piquete.
              </p>
            </div>

            {/* Sign In Button */}
            <div className="space-y-4">
              <Button
                onClick={() => actions.login()}
                size="lg"
                className="w-full sm:w-auto gap-3 text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </Button>
              
              <p className="text-sm text-muted-text">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => actions.login()}
                  className="text-primary hover:text-primary/80 font-medium underline"
                >
                  Regístrate gratis
                </button>
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-text">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Image & Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image Card */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-white">
              <div className="aspect-[4/3] relative">
                <Image
                  src="https://static.wixstatic.com/media/307f6c_cf2b966e2f5e495fba48595306220934~mv2.png?originWidth=768&originHeight=576"
                  alt="Profesionales trabajando en equipo"
                  className="w-full h-full object-cover"
                  width={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-heading text-2xl font-bold mb-2">
                    Únete a Nuestra Comunidad
                  </h3>
                  <p className="text-white/90">
                    Miles de profesionales y clientes confían en Piquete
                  </p>
                </div>
              </div>
            </Card>

            {/* Floating Stats Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-border"
            >
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-primary mb-1">
                  10K+
                </div>
                <div className="text-sm text-muted-text">
                  Usuarios Activos
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border border-border"
            >
              <div className="text-center">
                <div className="text-3xl font-heading font-bold text-accent mb-1">
                  98%
                </div>
                <div className="text-sm text-muted-text">
                  Satisfacción
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section - Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 pt-12 border-t border-border"
        >
          <div className="text-center mb-8">
            <p className="text-sm text-muted-text font-medium">
              Confiado por profesionales en toda la región
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-32 h-16 bg-muted-text/10 rounded-lg flex items-center justify-center"
              >
                <span className="text-muted-text/40 font-heading font-bold text-lg">
                  LOGO {i}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 backdrop-blur-sm mt-20">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-text">
              © 2026 Piquete. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/about')}
                className="text-sm text-muted-text hover:text-foreground transition-colors"
              >
                Acerca de
              </button>
              <button className="text-sm text-muted-text hover:text-foreground transition-colors">
                Privacidad
              </button>
              <button className="text-sm text-muted-text hover:text-foreground transition-colors">
                Términos
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
