import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRoleStore } from '@/store/roleStore';
import { ArrowRight, CheckCircle, Wallet, CheckSquare, Square } from 'lucide-react';

export default function JoseadorOnboardingPage() {
  const navigate = useNavigate();
  const { setJoseadorOnboardingCompleted } = useRoleStore();
  const [step, setStep] = useState(1);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (dontShowAgain) {
        setJoseadorOnboardingCompleted(true);
      }
      navigate('/joseador/dashboard');
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      setJoseadorOnboardingCompleted(true);
    }
    navigate('/joseador/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="font-paragraph text-sm text-muted-text">
              Paso {step} de {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="font-paragraph text-sm text-primary hover:text-secondary transition-colors"
            >
              Saltar
            </button>
          </div>
          <div className="w-full h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-secondary via-accent to-support"
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-8 md:p-12 border border-border shadow-lg"
        >
          {step === 1 && (
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-6">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¡Bienvenido, Joseador!
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Estás a punto de acceder a cientos de oportunidades de trabajo cerca de ti.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Encuentra trabajos gratis</h3>
                    <p className="font-paragraph text-muted-text">Navega y aplica a trabajos sin costo inicial.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Aplica con piquetes</h3>
                    <p className="font-paragraph text-muted-text">Usa paquetes de aplicaciones para maximizar tus oportunidades.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Recibe pagos seguros</h3>
                    <p className="font-paragraph text-muted-text">Tu dinero está protegido y se libera al completar el trabajo.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                Sistema de Piquetes
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Para aplicar a trabajos, necesitas piquetes. Así funciona:
              </p>
              <div className="bg-gradient-to-r from-secondary/10 via-accent/10 to-support/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-secondary" size={32} />
                  <h3 className="font-heading text-xl font-semibold text-foreground">
                    ¿Qué son los piquetes?
                  </h3>
                </div>
                <p className="font-paragraph text-muted-text">
                  Los piquetes son créditos que usas para aplicar a trabajos. Cada aplicación consume 1 piquete. 
                  Puedes comprar paquetes de piquetes a precios accesibles.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-xl font-bold text-white">1</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Explora trabajos</h3>
                    <p className="font-paragraph text-muted-text">Busca trabajos que coincidan con tus habilidades</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-xl font-bold text-white">2</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Aplica con piquetes</h3>
                    <p className="font-paragraph text-muted-text">Usa 1 piquete por cada aplicación que envíes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                    <span className="font-heading text-xl font-bold text-white">3</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Recarga cuando necesites</h3>
                    <p className="font-paragraph text-muted-text">Compra más piquetes en cualquier momento</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¡Todo listo!
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Ya puedes empezar a buscar trabajos y ganar dinero.
              </p>
              <div className="bg-gradient-to-r from-secondary/10 via-accent/10 to-support/10 rounded-xl p-6 mb-8">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Consejo para empezar
                </h3>
                <p className="font-paragraph text-muted-text">
                  Completa tu perfil profesional con tus habilidades, experiencia y fotos de trabajos anteriores. 
                  Esto aumentará tus posibilidades de ser seleccionado por los clientes.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Perfil de Joseador creado</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Listo para aplicar a trabajos</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Wallet activado</span>
                </div>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-secondary via-accent to-support text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {step === totalSteps ? 'Ir al Dashboard' : 'Continuar'}
            <ArrowRight className="inline-block ml-2" size={20} />
          </motion.button>

          {/* Checkbox and Button Section */}
          <label className="flex items-center gap-3 cursor-pointer group mt-6 p-4 bg-background rounded-xl hover:bg-border/50 transition-colors">
            <button
              onClick={() => setDontShowAgain(!dontShowAgain)}
              className="flex-shrink-0 transition-colors"
            >
              {dontShowAgain ? (
                <CheckSquare size={20} className="text-secondary" />
              ) : (
                <Square size={20} className="text-border group-hover:text-muted-text" />
              )}
            </button>
            <span className="font-paragraph text-sm text-muted-text group-hover:text-foreground transition-colors">
              No volver a mostrar este onboarding
            </span>
          </label>
        </motion.div>
      </div>
    </div>
  );
}
