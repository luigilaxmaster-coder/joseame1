// HPI 1.6-V
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { ArrowRight, Briefcase, Users, Shield, Zap, Sparkles, TrendingUp, CheckCircle, Star, Rocket, Target, Search, FileText, Handshake, Wallet } from 'lucide-react';
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
        <Image src={src} alt={alt} className="w-full h-full object-cover" width={1600} />
      </motion.div>
    </div>
  );
};

// Floating Orbs Background Component
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/20 to-support/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], x: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-secondary/15 to-accent/10 rounded-full blur-3xl"
      />
    </div>
  );
};

export default function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Rápido y Fácil',
      description: 'Publica trabajos o aplica a oportunidades en minutos con nuestra interfaz intuitiva.',
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Con sistema de pagos protegido y perfiles verificados, tu tranquilidad es nuestra prioridad.',
      color: 'from-secondary to-accent',
      bgColor: 'bg-secondary/10'
    },
    {
      icon: Users,
      title: 'Comunidad Local',
      description: 'Conecta con el talento y los clientes de tu propia comunidad en República Dominicana.',
      color: 'from-accent to-support',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Briefcase,
      title: 'Múltiples Servicios',
      description: 'Desde reparaciones del hogar y tecnología hasta consultoría profesional y creativa.',
      color: 'from-support to-primary',
      bgColor: 'bg-support/10'
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
        .gradient-text {
          background: linear-gradient(135deg, #0E9FA8 0%, #3AB689 50%, #71D261 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(14, 159, 168, 0.15);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-background via-white to-background text-foreground font-paragraph overflow-clip">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden pt-20">
          <FloatingOrbs />
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
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-8"
              >
                <Sparkles size={18} className="text-yellow-300" />
                <span className="text-white font-heading font-semibold">Bienvenido a la revolución del trabajo</span>
              </motion.div>

              <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                JOSEAME
              </h1>
              <p className="font-heading text-2xl md:text-3xl text-white mb-8 font-semibold">
                Trabajo cerca, rápido y fácil.
              </p>
              <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
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

        {/* App Flow Diagram Section */}
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            <AnimatedElement className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                Cómo Funciona JOSEAME
              </h2>
              <p className="text-lg text-muted-text max-w-3xl mx-auto">
                Un flujo simple y directo para conectar clientes con profesionales
              </p>
            </AnimatedElement>

            {/* Flow Diagram */}
            <div className="relative">
              {/* Desktop Flow */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between gap-4 mb-8">
                  {[
                    { icon: Search, label: 'Busca o Publica', color: 'from-primary to-secondary', step: '1' },
                    { icon: FileText, label: 'Revisa Propuestas', color: 'from-secondary to-accent', step: '2' },
                    { icon: Handshake, label: 'Acuerda Términos', color: 'from-accent to-support', step: '3' },
                    { icon: Wallet, label: 'Pago Seguro', color: 'from-support to-primary', step: '4' }
                  ].map((item, index) => (
                    <React.Fragment key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="flex-1"
                      >
                        <div className="relative">
                          <div className="flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg relative z-10`}>
                              <item.icon className="text-white" size={40} />
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-bold text-sm">
                              {item.step}
                            </div>
                            <h3 className="font-heading text-lg font-semibold text-foreground text-center">{item.label}</h3>
                          </div>
                        </div>
                      </motion.div>
                      {index < 3 && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          whileInView={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: index * 0.15 + 0.1 }}
                          className="flex-shrink-0 h-1 w-12 bg-gradient-to-r from-primary via-secondary to-accent origin-left"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Mobile Flow */}
              <div className="lg:hidden space-y-6">
                {[
                  { icon: Search, label: 'Busca o Publica', color: 'from-primary to-secondary', step: '1', description: 'Encuentra trabajos o publica el tuyo' },
                  { icon: FileText, label: 'Revisa Propuestas', color: 'from-secondary to-accent', step: '2', description: 'Analiza las mejores opciones' },
                  { icon: Handshake, label: 'Acuerda Términos', color: 'from-accent to-support', step: '3', description: 'Formaliza el acuerdo' },
                  { icon: Wallet, label: 'Pago Seguro', color: 'from-support to-primary', step: '4', description: 'Transacción protegida' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md relative`}>
                      <item.icon className="text-white" size={32} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-bold text-xs">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="font-heading text-lg font-semibold text-foreground">{item.label}</h3>
                      <p className="text-sm text-muted-text">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Para Clientes', icon: Briefcase, description: 'Publica trabajos y encuentra profesionales calificados' },
                { title: 'Para Joseadores', icon: Users, description: 'Accede a oportunidades y gana dinero' },
                { title: 'Seguridad Garantizada', icon: Shield, description: 'Pagos protegidos y resolución de conflictos' }
              ].map((item, index) => (
                <AnimatedElement key={index} delay={index * 100}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="card-hover bg-gradient-to-br from-white to-background rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <item.icon className="text-primary" size={28} />
                      </div>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-text">{item.description}</p>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-white">
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
                      className="card-hover bg-white rounded-2xl p-8 h-full border border-border/50 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                    >
                      <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-md`}>
                          <feature.icon className="text-white" size={32} />
                        </div>
                        <h3 className="font-heading text-2xl font-semibold text-foreground mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-muted-text">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatedElement>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
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
                  <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl group">
                    <Image src="https://static.wixstatic.com/media/307f6c_e70ee8c65a1d48f8a687759c30af3f76~mv2.png?originWidth=576&originHeight=384" alt="Cliente planificando un proyecto en una tableta" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={576} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent opacity-[1]"></div>
                    <h3 className="absolute top-4 right-8 font-heading text-4xl font-bold text-white">Para Clientes</h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-8 mt-8 lg:mt-0">
                  {clientSteps.map((item, index) => (
                    <AnimatedElement key={index} delay={index * 150}>
                      <motion.div
                        whileHover={{ x: 8 }}
                        className="flex items-start gap-6 p-4 rounded-xl hover:bg-background transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="font-heading text-xl font-bold text-white">{item.step}</span>
                        </div>
                        <p className="pt-2.5 text-lg font-heading font-bold text-foreground">{item.text}</p>
                      </motion.div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>

              {/* Para Joseadores */}
              <div className="flex flex-col gap-8">
                <AnimatedElement className="lg:sticky top-32">
                  <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl group">
                    <Image src="https://static.wixstatic.com/media/307f6c_2411ca2d1f6b42fa9707362c9d239248~mv2.png?originWidth=576&originHeight=384" alt="Joseador trabajando en su laptop en un café" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={576} />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/70 to-transparent"></div>
                    <h3 className="absolute top-4 right-8 font-heading text-4xl font-bold text-white">Para Joseadores</h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-8 mt-8 lg:mt-0">
                  {joseadorSteps.map((item, index) => (
                    <AnimatedElement key={index} delay={index * 150}>
                      <motion.div
                        whileHover={{ x: 8 }}
                        className="flex items-start gap-6 p-4 rounded-xl hover:bg-background transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="font-heading text-xl font-bold text-white">{item.step}</span>
                        </div>
                        <p className="font-paragraph text-lg pt-2.5 font-bold text-foreground">{item.text}</p>
                      </motion.div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Popular Categories Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-background w-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            <AnimatedElement className="mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">Encuentra el talento que necesitas</h2>
              <p className="text-lg text-muted-text mt-2">Desde tareas rápidas hasta proyectos complejos.</p>
            </AnimatedElement>
          </div>
          <div className="w-full relative">
            <div className="flex gap-8 pb-8 px-6 md:px-12 overflow-x-auto">
              {popularCategories.map((category, index) => (
                <AnimatedElement key={index} delay={index * 100} className="flex-shrink-0 w-[300px] sm:w-[350px]">
                  <motion.div whileHover={{ y: -8 }} className="group card-hover">
                    <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-lg category-card-mask">
                      <Image src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={350} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-8 right-8 font-heading text-2xl font-bold text-white"
                      >
                        {category.name}
                      </motion.h3>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden"></div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-6 md:px-12 relative z-10">
            <AnimatedElement className="text-center mb-16">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                ¿Por qué elegir JOSEAME?
              </h2>
              <p className="text-lg text-muted-text max-w-3xl mx-auto">
                Somos más que una plataforma, somos tu aliado en el crecimiento profesional.
              </p>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Rocket,
                  title: 'Crecimiento Rápido',
                  description: 'Expande tu negocio o carrera profesional con acceso a miles de oportunidades.',
                  color: 'from-primary to-secondary'
                },
                {
                  icon: Target,
                  title: 'Precisión en Búsqueda',
                  description: 'Encuentra exactamente lo que necesitas con nuestros filtros inteligentes.',
                  color: 'from-secondary to-accent'
                },
                {
                  icon: TrendingUp,
                  title: 'Ingresos Consistentes',
                  description: 'Acceso a un flujo constante de trabajos bien pagados y verificados.',
                  color: 'from-accent to-support'
                },
                {
                  icon: Shield,
                  title: 'Protección Total',
                  description: 'Pagos seguros, garantía de calidad y resolución de disputas justa.',
                  color: 'from-support to-primary'
                },
                {
                  icon: Users,
                  title: 'Comunidad Fuerte',
                  description: 'Conecta con profesionales, aprende y crece junto a otros joseadores.',
                  color: 'from-primary to-accent'
                },
                {
                  icon: Sparkles,
                  title: 'Soporte 24/7',
                  description: 'Equipo dedicado listo para ayudarte en cualquier momento.',
                  color: 'from-accent to-secondary'
                }
              ].map((benefit, index) => (
                <AnimatedElement key={index} delay={index * 100}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="card-hover bg-gradient-to-br from-white to-background rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-xl"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-md`}>
                      <benefit.icon className="text-white" size={28} />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-text text-sm">
                      {benefit.description}
                    </p>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 md:px-12">
          <div className="max-w-[120rem] mx-auto rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-12 md:p-20 text-center relative overflow-hidden">
            <FloatingOrbs />
            <div className="absolute -top-1/2 -left-1/4 w-full h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -rotate-45"></div>
            <AnimatedElement className="relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-8"
              >
                <Sparkles size={18} className="text-yellow-300" />
                <span className="text-white font-heading font-semibold">Únete a la revolución</span>
              </motion.div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para josear?</h2>
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
