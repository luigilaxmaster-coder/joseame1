import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRoleStore } from '@/store/roleStore';
import { ArrowRight, CheckCircle, CheckSquare, Square } from 'lucide-react';

export default function ClientOnboardingPage() {
  const navigate = useNavigate();
  const { setClientOnboardingCompleted } = useRoleStore();
  const [step, setStep] = useState(1);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      if (dontShowAgain) {
        setClientOnboardingCompleted(true);
      }
      navigate('/client/dashboard');
    }
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      setClientOnboardingCompleted(true);
    }
    navigate('/client/dashboard');
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
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¡Bienvenido, Cliente!
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Estás a punto de acceder a miles de profesionales dominicanos listos para ayudarte con tus proyectos.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Publica trabajos gratis</h3>
                    <p className="font-paragraph text-muted-text">No hay costo por publicar. Solo pagas cuando contratas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Recibe aplicaciones rápido</h3>
                    <p className="font-paragraph text-muted-text">Los Joseadores empezarán a aplicar en minutos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-accent text-2xl">✓</span>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">Pago seguro</h3>
                    <p className="font-paragraph text-muted-text">Tu dinero está protegido hasta que el trabajo esté completo.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Es muy simple. Sigue estos pasos:
              </p>
              <div className="space-y-6">
                {[
                  {
                    num: '1',
                    title: 'Publica tu trabajo',
                    desc: 'Describe qué necesitas, tu presupuesto y ubicación'
                  },
                  {
                    num: '2',
                    title: 'Revisa aplicaciones',
                    desc: 'Los Joseadores aplicarán con sus propuestas y precios'
                  },
                  {
                    num: '3',
                    title: 'Selecciona y paga',
                    desc: 'Elige el mejor candidato y realiza el pago seguro'
                  },
                  {
                    num: '4',
                    title: 'Completa el trabajo',
                    desc: 'El Joseador completa el trabajo y tú lo apruebas'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <span className="font-heading text-xl font-bold text-white">{item.num}</span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="font-paragraph text-muted-text">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¡Todo listo!
              </h2>
              <p className="font-paragraph text-lg text-muted-text mb-8">
                Ya puedes empezar a publicar trabajos y contratar profesionales.
              </p>
              <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-6 mb-8">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  Consejo para empezar
                </h3>
                <p className="font-paragraph text-muted-text">
                  Sé específico en la descripción de tu trabajo. Incluye detalles como ubicación exacta, 
                  horario preferido y cualquier requisito especial. Esto atraerá a los mejores Joseadores.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Perfil de cliente creado</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Listo para publicar trabajos</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle size={20} />
                  <span className="font-paragraph">Acceso a todos los Joseadores</span>
                </div>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
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
                <CheckSquare size={20} className="text-primary" />
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
