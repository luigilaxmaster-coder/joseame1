import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSyncUser } from '@/lib/user-sync-hook';
import Flow3DCarousel from '@/components/Flow3DCarousel';

export default function HomePage() {
  // Sync user to registeredusers collection when they visit home page
  useSyncUser();
  
  const { member, isAuthenticated, actions } = useMember();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/role-selection');
    } else {
      actions.login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-background">
      {/* Hero Section */}
      <section className="relative w-full max-w-[120rem] mx-auto px-4 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-foreground">
            Conecta con Profesionales
            <span className="block text-primary mt-2">Verificados</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-text mb-8 max-w-2xl mx-auto">
            JOSEAME es la plataforma que conecta clientes con profesionales de confianza.
            Descubre cómo funciona navegando por nuestro flujo interactivo 3D.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              {isAuthenticated ? 'Ir al Dashboard' : 'Comenzar Ahora'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')} className="text-lg px-8 py-6">
              Más Información
            </Button>
          </div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </section>

      {/* 3D Interactive Flow Carousel */}
      <section className="w-full">
        <Flow3DCarousel onStepChange={setCurrentStep} />
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-[100rem] mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 md:p-16 text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Únete a miles de clientes y profesionales que confían en JOSEAME
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGetStarted}
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-slate-50"
          >
            Crear Cuenta Gratis
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
