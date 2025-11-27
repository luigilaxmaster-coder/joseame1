// HPI 1.6-V
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { ArrowRight, Briefcase, Users, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0, threshold = 0.1 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    element.classList.add('is-visible');
                }, delay);
                observer.unobserve(element);
            }
        }, { threshold });

        observer.observe(element);
        return () => observer.disconnect();
    }, [delay, threshold]);

    return <div ref={ref} className={cn('animate-reveal', className)}>{children}</div>;
};

const ParallaxImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <div ref={ref} className={cn("overflow-clip", className)}>
      <motion.div style={{ y }} className="h-[140%] w-full">
        <Image src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
};

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Rápido y Fácil',
      description: 'Publica trabajos o aplica a oportunidades en minutos con nuestra interfaz intuitiva.',
      color: 'from-primary to-secondary'
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Con sistema de pagos protegido y perfiles verificados, tu tranquilidad es nuestra prioridad.',
      color: 'from-secondary to-accent'
    },
    {
      icon: Users,
      title: 'Comunidad Local',
      description: 'Conecta con el talento y los clientes de tu propia comunidad en República Dominicana.',
      color: 'from-accent to-support'
    },
    {
      icon: Briefcase,
      title: 'Múltiples Servicios',
      description: 'Desde reparaciones del hogar y tecnología hasta consultoría profesional y creativa.',
      color: 'from-support to-primary'
    }
  ];

  const clientSteps = [
    { step: '1', text: 'Publica tu trabajo con detalles claros y tu presupuesto.' },
    { step: '2', text: 'Recibe aplicaciones de Joseadores calificados y revisa sus perfiles.' },
    { step: '3', text: 'Elige al mejor profesional y formaliza el acuerdo en la plataforma.' },
    { step: '4', text: 'Realiza el pago de forma segura. Los fondos se liberan al completar el trabajo.' }
  ];

  const joseadorSteps = [
    { step: '1', text: 'Crea tu perfil profesional, destaca tus habilidades y verifica tu identidad.' },
    { step: '2', text: 'Explora un feed de trabajos relevantes para ti, filtrados por categoría y ubicación.' },
    { step: '3', text: 'Envía propuestas atractivas para los trabajos que te interesen.' },
    { step: '4', text: 'Completa el trabajo con excelencia y recibe tu pago directamente en tu wallet.' }
  ];
  
  const popularCategories = [
    { name: "Reparaciones del Hogar", image: "https://static.wixstatic.com/media/307f6c_61f95d8473ac41ca814dfe229da11d7c~mv2.png?originWidth=320&originHeight=448" },
    { name: "Diseño Gráfico y Creativo", image: "https://static.wixstatic.com/media/307f6c_8ccdf3d4e86f4f5f8a61a88014e52c49~mv2.png?originWidth=320&originHeight=448" },
    { name: "Desarrollo Web y App", image: "https://static.wixstatic.com/media/307f6c_f778337da6854a3dba5db8beb618ee53~mv2.png?originWidth=320&originHeight=448" },
    { name: "Servicios de Limpieza", image: "https://static.wixstatic.com/media/307f6c_8c037a2899024e9aa708cadcc6975cb6~mv2.png?originWidth=320&originHeight=448" },
    { name: "Consultoría de Negocios", image: "https://static.wixstatic.com/media/307f6c_e2795e63b1c2467b88994052f4fa0535~mv2.png?originWidth=320&originHeight=448" },
    { name: "Clases y Tutorías", image: "https://static.wixstatic.com/media/307f6c_ca9a52e42a0c41b4b7a7518af1bc2036~mv2.png?originWidth=320&originHeight=448" },
  ];

  return (
    <>
      <style>{`
        .btn-gradient {
          background-image: linear-gradient(90deg, #0E9FA8, #3AB689, #71D261);
          background-size: 200% auto;
          transition: background-position 0.5s ease;
        }
        .btn-gradient:hover {
          background-position: right center;
        }
        .animate-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .how-it-works-card {
          clip-path: polygon(0 0, 100% 0, 100% 95%, 90% 100%, 0 100%);
        }
        .category-card-mask {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
        }
      `}</style>
      <div className="min-h-screen bg-background text-foreground font-paragraph overflow-clip">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ParallaxImage 
              src="https://static.wixstatic.com/media/307f6c_459db4e37d4c4a09830e7ff2da30e8f8~mv2.png?originWidth=1600&originHeight=896"
              alt="Un profesional dominicano sonriendo en un entorno de trabajo moderno y luminoso"
              className="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-secondary/50 to-transparent"></div>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 max-w-[120rem] mx-auto px-6 md:px-12 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative z-20"
            >
              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                JOSEAME
              </h1>
              <p className="font-heading text-2xl md:text-3xl text-white mb-8" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                Trabajo cerca, rápido y fácil.
              </p>
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
                Conectamos clientes con los mejores profesionales de República Dominicana. Publica un trabajo o encuentra tu próximo joseo en minutos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 text-lg btn-gradient text-white font-heading font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Comenzar Ahora
                    <ArrowRight className="inline-block ml-2" size={20} />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 text-lg bg-white/10 backdrop-blur-sm text-white font-heading font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all"
                  >
                    Conocer Más
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
              <div className="lg:sticky top-32 h-fit">
                <AnimatedElement>
                  <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                    La plataforma del joseador moderno.
                  </h2>
                  <p className="text-lg text-muted-text max-w-md">
                    Todo lo que necesitas para contratar o trabajar, en un solo lugar. Eficiente, seguro y 100% dominicano.
                  </p>
                </AnimatedElement>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <AnimatedElement key={index} delay={index * 100}>
                    <motion.div
                      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                      className="bg-background rounded-2xl p-8 h-full border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md`}>
                        <feature.icon className="text-white" size={32} />
                      </div>
                      <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-text">
                        {feature.description}
                      </p>
                    </motion.div>
                  </AnimatedElement>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12">
            <AnimatedElement className="text-center mb-16 md:mb-24">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                Simple, Transparente y Directo.
              </h2>
              <p className="text-lg text-muted-text max-w-3xl mx-auto">
                Diseñamos un flujo de trabajo que te da control y confianza en cada paso del proceso.
              </p>
            </AnimatedElement>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
              {/* Para Clientes */}
              <div className="flex flex-col gap-8">
                <AnimatedElement className="lg:sticky top-32">
                  <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                    <Image src="https://static.wixstatic.com/media/307f6c_e70ee8c65a1d48f8a687759c30af3f76~mv2.png?originWidth=576&originHeight=384" alt="Cliente planificando un proyecto en una tableta" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent"></div>
                    <h3 className="absolute top-4 right-8 font-heading text-4xl font-bold text-white">Para Clientes</h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-8 mt-8 lg:mt-0">
                  {clientSteps.map((item, index) => (
                    <AnimatedElement key={index} delay={index * 150}>
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="font-heading text-xl font-bold text-white">{item.step}</span>
                        </div>
                        <p className="pt-2.5 text-[#030303] text-lg font-heading">{item.text}</p>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>

              {/* Para Joseadores */}
              <div className="flex flex-col gap-8">
                <AnimatedElement className="lg:sticky top-32">
                  <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
                    <Image src="https://static.wixstatic.com/media/307f6c_2411ca2d1f6b42fa9707362c9d239248~mv2.png?originWidth=576&originHeight=384" alt="Joseador trabajando en su laptop en un café" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/70 to-transparent"></div>
                    <h3 className="absolute top-4 right-8 font-heading text-4xl font-bold text-white">Para Joseadores</h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-8 mt-8 lg:mt-0">
                  {joseadorSteps.map((item, index) => (
                    <AnimatedElement key={index} delay={index * 150}>
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="font-heading text-xl font-bold text-white">{item.step}</span>
                        </div>
                        <p className="font-paragraph text-lg pt-2.5 text-foreground">{item.text}</p>
                      </div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Popular Categories Section */}
        <section className="py-20 md:py-32 bg-white w-full">
          <div className="max-w-[120rem] mx-auto px-6 md:px-12">
            <AnimatedElement className="mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Encuentra el talento que necesitas</h2>
              <p className="text-lg text-muted-text mt-2">Desde tareas rápidas hasta proyectos complejos.</p>
            </AnimatedElement>
          </div>
          <div className="w-full relative">
            <div className="flex gap-8 pb-8 px-6 md:px-12 overflow-x-auto">
              {popularCategories.map((category, index) => (
                <AnimatedElement key={index} delay={index * 100} className="flex-shrink-0 w-[300px] sm:w-[350px]">
                  <motion.div whileHover={{ y: -5 }} className="group">
                    <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-lg category-card-mask">
                      <Image src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent"></div>
                      <h3 className="absolute top-8 left-8 font-heading text-4xl font-bold text-white">{category.name}</h3>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 md:px-12">
          <div className="max-w-[120rem] mx-auto rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute -top-1/2 -left-1/4 w-full h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -rotate-45"></div>
            <AnimatedElement className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">{"¿Listo para josear?"}</h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                Únete a miles de dominicanos que ya están transformando la forma en que trabajan.
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 py-5 bg-white text-primary font-heading text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="inline-block ml-2" size={24} />
                </motion.button>
              </Link>
            </AnimatedElement>
          </div>
        </section>
      </div>
    </>
  );
}
