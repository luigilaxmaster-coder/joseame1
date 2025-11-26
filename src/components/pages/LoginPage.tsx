import { useMember } from '@/integrations';
import { motion } from 'framer-motion';
import { LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

export default function LoginPage() {
  const { actions } = useMember();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-20 rounded-3xl" />
            <Image
              src="https://static.wixstatic.com/media/307f6c_9e7a3837679146e69bdb9807a315947a~mv2.png?originWidth=768&originHeight=576"
              alt="JOSEAME Platform"
              className="relative z-10 w-full h-auto rounded-3xl"
            />
          </div>
          <div className="mt-8">
            <h2 className="font-heading text-4xl font-bold text-foreground mb-4">
              Bienvenido a JOSEAME
            </h2>
            <p className="font-paragraph text-lg text-muted-text">
              La infraestructura digital del joseo. Conecta con profesionales o encuentra trabajos en minutos.
            </p>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-8 md:p-12 border border-border shadow-lg"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al inicio</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
              Iniciar Sesión
            </h1>
            <p className="font-paragraph text-muted-text">
              Accede a tu cuenta de JOSEAME
            </p>
          </div>

          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={actions.login}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <LogIn size={24} />
              Iniciar Sesión
            </motion.button>

            <div className="relative">
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
              className="w-full px-6 py-4 bg-transparent text-primary font-heading font-semibold rounded-xl border-2 border-primary hover:bg-primary/5 transition-colors"
            >
              Crear Cuenta Nueva
            </motion.button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="font-paragraph text-sm text-muted-text text-center">
              Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
