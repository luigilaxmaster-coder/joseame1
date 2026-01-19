import { useMember } from '@/integrations';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useEffect } from 'react';

export default function LoginPage() {
  const { actions, isAuthenticated } = useMember();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/role-selection');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    { icon: CheckCircle2, text: 'Conexión directa con profesionales verificados' },
    { icon: Shield, text: 'Pagos seguros y protección garantizada' },
    { icon: Zap, text: 'Encuentra trabajos o servicios en minutos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background">
      <div className="min-h-screen flex items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Branding & Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo/Brand */}
            <div className="text-center lg:text-left">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4"
              >
                JOSEAME
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-paragraph text-lg md:text-xl text-muted-text max-w-md mx-auto lg:mx-0"
              >
                La infraestructura digital del joseo
              </motion.p>
            </div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl p-4 shadow-2xl">
                <Image
                  src="https://static.wixstatic.com/media/307f6c_a1b161314d9547989f805eba98a34236~mv2.png?originWidth=576&originHeight=384"
                  alt="Profesionales trabajando en JOSEAME"
                  className="w-full h-auto rounded-xl"
                  width={600}
                />
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4 hidden lg:block"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 text-foreground"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <feature.icon size={20} className="text-white" />
                  </div>
                  <p className="font-paragraph text-base">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-border shadow-2xl">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-muted-text hover:text-foreground mb-8 transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-paragraph">Volver al inicio</span>
              </Link>

              <div className="mb-10">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Iniciar Sesión
                </h1>
                <p className="font-paragraph text-lg text-muted-text">
                  Accede a tu cuenta de JOSEAME
                </p>
              </div>

              <div className="space-y-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={actions.login}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <LogIn size={24} />
                  Iniciar Sesión
                </motion.button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white font-paragraph text-muted-text">
                      ¿Primera vez en JOSEAME?
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={actions.login}
                  className="w-full px-6 py-4 bg-transparent text-primary font-heading font-semibold rounded-xl border-2 border-primary hover:bg-primary/5 transition-colors text-lg"
                >
                  Crear Cuenta Nueva
                </motion.button>
              </div>

              {/* Mobile Features */}
              <div className="mt-8 space-y-3 lg:hidden">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <feature.icon size={16} className="text-white" />
                    </div>
                    <p className="font-paragraph text-sm">{feature.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <p className="font-paragraph text-sm text-muted-text text-center">
                  Al continuar, aceptas nuestros{' '}
                  <Link to="/about" className="text-primary hover:underline">
                    Términos de Servicio
                  </Link>
                  {' '}y{' '}
                  <Link to="/about" className="text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
