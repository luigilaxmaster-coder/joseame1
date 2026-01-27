// HPI 3.0 - Dynamic, Intuitive & Colorful Design
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { ArrowRight, Briefcase, Users, Shield, Zap, Sparkles, TrendingUp, Star, Rocket, Target, Search, FileText, Handshake, Wallet, DollarSign, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSyncUser } from '@/lib/user-sync-hook';
import CursorGlow from '@/components/CursorGlow';
import Flow3DCarousel from '@/components/Flow3DCarousel';

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
  // Reduced parallax effect for better performance
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} className={cn("overflow-clip", className)}>
      <motion.div style={{ y }} className="h-[120%] w-full">
        <Image src={src} alt={alt} className="w-full h-full object-cover" width={1600} />
      </motion.div>
    </div>
  );
};

// Optimized Floating Orbs - Reduced animations
const FloatingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ 
          y: [0, -40, 0], 
          x: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary/40 to-secondary/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, 40, 0], 
          x: [0, -30, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-gradient-to-br from-accent/40 to-support/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          y: [0, 25, 0], 
          x: [0, 40, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-secondary/30 to-accent/20 rounded-full blur-3xl"
      />
    </div>
  );
};

// Animated Stats Component - No fake numbers
const AnimatedStat = ({ icon: Icon, label, delay = 0 }: { icon: any; label: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-2 p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
    >
      <Icon className="text-accent" size={32} />
      <div className="text-sm md:text-base text-white/80 text-center font-heading font-semibold">{label}</div>
    </motion.div>
  );
};

export default function HomePage() {
  // Sync user to registeredusers collection when they visit home page
  useSyncUser();

  const features = [
    {
      id: 'feature-fast-easy',
      icon: Zap,
      title: 'Rápido y Fácil',
      description: 'Publica trabajos o aplica a oportunidades en minutos con nuestra interfaz intuitiva.',
      color: 'from-primary to-secondary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 'feature-secure',
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Con sistema de pagos protegido y perfiles verificados, tu tranquilidad es nuestra prioridad.',
      color: 'from-secondary to-accent',
      bgColor: 'bg-secondary/10'
    },
    {
      id: 'feature-community',
      icon: Users,
      title: 'Comunidad Local',
      description: 'Conecta con el talento y los clientes de tu propia comunidad en República Dominicana.',
      color: 'from-accent to-support',
      bgColor: 'bg-accent/10'
    },
    {
      id: 'feature-services',
      icon: Briefcase,
      title: 'Múltiples Servicios',
      description: 'Desde reparaciones del hogar y tecnología hasta consultoría profesional y creativa.',
      color: 'from-support to-primary',
      bgColor: 'bg-support/10'
    }
  ];

  const clientSteps = [
    { id: 'client-step-1', step: '1', icon: FileText, text: 'Publica tu trabajo', subtitle: 'Describe tu proyecto con detalles claros y establece tu presupuesto.' },
    { id: 'client-step-2', step: '2', icon: Users, text: 'Recibe aplicaciones', subtitle: 'Profesionales calificados envían propuestas. Revisa perfiles y experiencia.' },
    { id: 'client-step-3', step: '3', icon: Handshake, text: 'Elige al mejor', subtitle: 'Selecciona el profesional ideal y formaliza el acuerdo en la plataforma.' },
    { id: 'client-step-4', step: '4', icon: DollarSign, text: 'Pago seguro', subtitle: 'Tu dinero se libera solo cuando el trabajo esté completado.' }
  ];

  const joseadorSteps = [
    { id: 'joseador-step-1', step: '1', icon: Star, text: 'Crea tu perfil', subtitle: 'Destaca tus habilidades, experiencia y verifica tu identidad.' },
    { id: 'joseador-step-2', step: '2', icon: Search, text: 'Explora trabajos', subtitle: 'Feed personalizado filtrado por categoría y ubicación.' },
    { id: 'joseador-step-3', step: '3', icon: Target, text: 'Envía propuestas', subtitle: 'Aplica a los trabajos que te interesen con propuestas atractivas.' },
    { id: 'joseador-step-4', step: '4', icon: Wallet, text: 'Recibe tu pago', subtitle: 'Completa el trabajo y recibe tu pago directo en tu wallet.' }
  ];
  
  const popularCategories = [
    { id: 'cat-home-repairs', name: "Reparaciones del Hogar", image: "https://static.wixstatic.com/media/307f6c_61f95d8473ac41ca814dfe229da11d7c~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-graphic-design', name: "Diseño Gráfico y Creativo", image: "https://static.wixstatic.com/media/307f6c_8ccdf3d4e86f4f5f8a61a88014e52c49~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-web-dev', name: "Desarrollo Web y App", image: "https://static.wixstatic.com/media/307f6c_f778337da6854a3dba5db8beb618ee53~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-cleaning', name: "Servicios de Limpieza", image: "https://static.wixstatic.com/media/307f6c_8c037a2899024e9aa708cadcc6975cb6~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-business', name: "Consultoría de Negocios", image: "https://static.wixstatic.com/media/307f6c_e2795e63b1c2467b88994052f4fa0535~mv2.png?originWidth=320&originHeight=448" },
    { id: 'cat-tutoring', name: "Clases y Tutorías", image: "https://static.wixstatic.com/media/307f6c_ca9a52e42a0c41b4b7a7518af1bc2036~mv2.png?originWidth=320&originHeight=448" },
  ];

  return (
    <>
      <CursorGlow />
      <style>{`
        .btn-gradient {
          background-image: linear-gradient(90deg, #0E9FA8, #3AB689, #71D261);
          background-size: 200% auto;
          transition: background-position 0.5s ease, transform 0.3s ease;
        }
        .btn-gradient:hover {
          background-position: right center;
          transform: translateY(-2px);
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
          background: linear-gradient(135deg, #0E9FA8 0%, #3AB689 30%, #71D261 60%, #55C376 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
          background-size: 200% auto;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(14, 159, 168, 0.2), 0 10px 20px rgba(113, 210, 97, 0.15);
          background: linear-gradient(135deg, rgba(14, 159, 168, 0.08) 0%, rgba(58, 182, 137, 0.08) 30%, rgba(113, 210, 97, 0.08) 100%);
        }
        .white-section-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .white-section-hover:hover {
          background: linear-gradient(135deg, rgba(14, 159, 168, 0.05) 0%, rgba(58, 182, 137, 0.05) 30%, rgba(113, 210, 97, 0.05) 100%);
        }
        .pulse-glow {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 25px rgba(113, 210, 97, 0.5), 0 0 50px rgba(14, 159, 168, 0.3); 
          }
          50% { 
            box-shadow: 0 0 45px rgba(113, 210, 97, 0.9), 0 0 80px rgba(14, 159, 168, 0.6); 
          }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-background via-white to-background text-foreground font-paragraph overflow-clip">
        
        {/* Hero Section - Ultra Dynamic */}
        <section className="relative h-screen md:min-h-screen flex items-center justify-center w-full overflow-hidden pt-12 md:pt-20">
          <FloatingOrbs />
          <div className="absolute inset-0 z-0">
            <ParallaxImage 
              src="https://static.wixstatic.com/media/307f6c_459db4e37d4c4a09830e7ff2da30e8f8~mv2.png?originWidth=1600&originHeight=896"
              alt="Un profesional dominicano sonriendo en un entorno de trabajo moderno y luminoso"
              className="h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-secondary/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-support/20"></div>
            <div className="absolute inset-0 bg-black/25"></div>
          </div>
          
          <div className="relative z-10 max-w-[120rem] mx-auto px-4 md:px-12 text-center flex flex-col items-center justify-center">
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
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-4 md:mb-8 pulse-glow"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={18} className="text-yellow-300" />
                </motion.div>
                <span className="text-white font-heading font-semibold text-sm md:text-base">Bienvenido a la revolución del trabajo</span>
              </motion.div>

              <motion.h1 
                className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-3 md:mb-6 leading-tight"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(113, 210, 97, 0.5)",
                    "0 0 40px rgba(113, 210, 97, 0.8)",
                    "0 0 20px rgba(113, 210, 97, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="inline-block">JOSEAME</span>
              </motion.h1>
              <p className="font-heading text-xl md:text-3xl text-white mb-4 md:mb-8 font-semibold">
                Trabajo cerca, rápido y fácil.
              </p>
              <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
                Conectamos clientes con profesionales. Publica un trabajo o encuentra tu próximo joseo en minutos.
              </p>
              
              {/* Stats Row - Real indicators */}
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12">
                <AnimatedStat label="Creciendo Rápido" icon={TrendingUp} delay={0.3} />
                <AnimatedStat label="Oportunidades Reales" icon={Briefcase} delay={0.4} />
                <AnimatedStat label="Calidad Garantizada" icon={Star} delay={0.5} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg btn-gradient text-white font-heading font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all w-full sm:w-auto relative overflow-hidden group"
                  >
                    <span className="relative z-10">Comenzar Ahora</span>
                    <ArrowRight className="inline-block ml-2 relative z-10" size={20} />
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 md:px-10 py-4 md:py-5 text-base md:text-lg bg-white/10 backdrop-blur-sm text-white font-heading font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all w-full sm:w-auto"
                  >
                    Conocer Más
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* App Flow Diagram Section - More Colorful */}
        <section className="py-12 md:py-32 bg-gradient-to-br from-white via-accent/10 to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-br from-primary via-secondary to-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-br from-accent via-support to-secondary rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gradient-to-br from-secondary via-accent to-support rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-4 md:px-12 relative z-10">
            <AnimatedElement className="text-center mb-12 md:mb-20">
              <h2 className="font-heading text-2xl md:text-5xl font-bold text-foreground mb-2 md:mb-4">
                Cómo Funciona JOSEAME
              </h2>
              <p className="text-sm md:text-lg text-muted-text max-w-3xl mx-auto">
                Un flujo simple y directo que conecta clientes con profesionales en minutos
              </p>
            </AnimatedElement>

            {/* Desktop Flow Diagram with Curved Connectors */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Grid Layout for Steps */}
                <div className="grid grid-cols-4 gap-8 mb-16">
                  {[
                    { 
                      icon: Search, 
                      label: 'Publica o Busca', 
                      description: 'Crea un trabajo o explora oportunidades',
                      color: 'from-primary to-secondary', 
                      step: '1',
                      bgGradient: 'from-primary/5 to-secondary/5'
                    },
                    { 
                      icon: FileText, 
                      label: 'Recibe Propuestas', 
                      description: 'Analiza perfiles y presupuestos',
                      color: 'from-secondary to-accent', 
                      step: '2',
                      bgGradient: 'from-secondary/5 to-accent/5'
                    },
                    { 
                      icon: Handshake, 
                      label: 'Acuerda Términos', 
                      description: 'Negocia y formaliza el acuerdo',
                      color: 'from-accent to-support', 
                      step: '3',
                      bgGradient: 'from-accent/5 to-support/5'
                    },
                    { 
                      icon: Wallet, 
                      label: 'Pago Seguro', 
                      description: 'Transacción protegida y garantizada',
                      color: 'from-support to-primary', 
                      step: '4',
                      bgGradient: 'from-support/5 to-primary/5'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.6 }}
                      className="relative"
                    >
                      {/* Card */}
                      <div className={`bg-gradient-to-br ${item.bgGradient} rounded-3xl p-8 border-2 border-border/50 h-full relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl`}>
                        {/* Animated Background Glow */}
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                        />
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                          {/* Step Badge */}
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: index * 0.15 + 0.1, type: 'spring', stiffness: 200 }}
                            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                          >
                            <span className="font-heading text-2xl font-bold text-white">{item.step}</span>
                          </motion.div>

                          {/* Icon with Animation */}
                          <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                            className="mb-4 floating-icon"
                          >
                            <item.icon className="text-foreground" size={48} strokeWidth={1.5} />
                          </motion.div>

                          {/* Text */}
                          <h3 className="font-heading text-xl font-bold text-foreground mb-2">{item.label}</h3>
                          <p className="text-sm text-muted-text leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Connector Arrow */}
                      {index < 3 && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          whileInView={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: index * 0.15 + 0.3, duration: 0.8 }}
                          className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                            <ArrowRight className="text-primary" size={24} />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Central Message */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full px-8 py-4 border-2 border-primary/30 shadow-lg">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-accent shadow-lg"
                    ></motion.div>
                    <span className="font-heading font-semibold text-foreground">Proceso 100% transparente y seguro</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Shield className="text-primary" size={20} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Mobile Flow Diagram - Compact */}
            <div className="lg:hidden space-y-4">
              {[
                { 
                  icon: Search, 
                  label: 'Publica o Busca', 
                  description: 'Crea un trabajo o explora',
                  color: 'from-primary to-secondary', 
                  step: '1'
                },
                { 
                  icon: FileText, 
                  label: 'Recibe Propuestas', 
                  description: 'Analiza perfiles',
                  color: 'from-secondary to-accent', 
                  step: '2'
                },
                { 
                  icon: Handshake, 
                  label: 'Acuerda Términos', 
                  description: 'Formaliza el acuerdo',
                  color: 'from-accent to-support', 
                  step: '3'
                },
                { 
                  icon: Wallet, 
                  label: 'Pago Seguro', 
                  description: 'Transacción protegida',
                  color: 'from-support to-primary', 
                  step: '4'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < 3 && (
                    <div className="absolute left-8 top-20 w-1 h-6 bg-gradient-to-b from-primary via-secondary to-accent"></div>
                  )}

                  {/* Card */}
                  <div className={`bg-gradient-to-br from-white to-background rounded-2xl p-4 border-2 border-border/50 relative overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg`}>
                    <div className="flex items-start gap-3">
                      {/* Icon Container */}
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.1, type: 'spring' }}
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg relative`}
                      >
                        <item.icon className="text-white" size={28} />
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-heading font-bold text-xs shadow-lg">
                          {item.step}
                        </div>
                      </motion.div>

                      {/* Text */}
                      <div className="flex-1 pt-0.5">
                        <h3 className="font-heading text-base font-bold text-foreground">{item.label}</h3>
                        <p className="text-xs text-muted-text">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Highlights - More Dynamic */}
            <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                { 
                  title: 'Para Clientes', 
                  icon: Briefcase, 
                  description: 'Publica trabajos y elige profesionales.',
                  color: 'from-primary to-secondary',
                  bgColor: 'bg-primary/10'
                },
                { 
                  title: 'Para Joseadores', 
                  icon: Users, 
                  description: 'Accede a oportunidades y gana dinero.',
                  color: 'from-secondary to-accent',
                  bgColor: 'bg-secondary/10'
                },
                { 
                  title: 'Seguridad', 
                  icon: Shield, 
                  description: 'Pagos protegidos y confiables.',
                  color: 'from-accent to-support',
                  bgColor: 'bg-accent/10'
                }
              ].map((item, index) => (
                <AnimatedElement key={index} delay={index * 100}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                    className={`card-hover white-section-hover ${item.bgColor} rounded-2xl p-4 md:p-8 border-2 border-border/50 shadow-md hover:shadow-2xl transition-all relative overflow-hidden group bg-white`}
                  >
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                    />
                    <div className="relative z-10">
                      <motion.div 
                        whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.1, transition: { duration: 0.5 } }}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 md:mb-6 shadow-lg`}
                      >
                        <item.icon className="text-white" size={28} />
                      </motion.div>
                      <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">{item.title}</h3>
                      <p className="text-sm md:text-base text-muted-text leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - More Vibrant */}
        <section className="py-12 md:py-32 bg-gradient-to-br from-secondary/10 via-white to-accent/10">
          <div className="max-w-[120rem] mx-auto px-4 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-16">
              <div className="lg:sticky top-32 h-fit">
                <AnimatedElement>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-2 md:mb-4">
                      La plataforma del <span className="gradient-text">joseador moderno</span>.
                    </h2>
                    <p className="text-base md:text-lg text-muted-text max-w-md">
                      Todo lo que necesitas para contratar o trabajar. Eficiente, seguro y 100% dominicano.
                    </p>
                  </motion.div>
                </AnimatedElement>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {features.map((feature) => (
                  <AnimatedElement key={feature.id} delay={features.indexOf(feature) * 100}>
                    <motion.div
                      whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                      className={`card-hover white-section-hover ${feature.bgColor} rounded-2xl p-5 md:p-8 h-full border-2 border-border/50 shadow-md hover:shadow-2xl transition-all relative overflow-hidden group bg-white`}
                    >
                      <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}
                        >
                          <feature.icon className="text-white" size={28} />
                        </motion.div>
                        <h3 className="font-heading text-lg md:text-2xl font-semibold text-foreground mb-2 md:mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-text">
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

        {/* How It Works Section - More Colorful */}
        <section className="py-12 md:py-32 bg-gradient-to-br from-white via-primary/10 to-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-1/2 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-secondary via-accent to-support rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-accent via-support to-primary rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-4 md:px-12 relative z-10">
            <AnimatedElement className="text-center mb-8 md:mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-heading font-semibold text-primary">Simple, Transparente y Directo</span>
              </div>
              <h2 className="font-heading text-2xl md:text-5xl font-bold text-foreground mb-3 md:mb-6">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Tu flujo de trabajo intuitivo</span>
              </h2>
              <p className="text-sm md:text-xl text-muted-text max-w-4xl mx-auto leading-relaxed">
                Diseñamos un proceso <span className="font-bold text-primary">claro y eficiente</span> que te da control total y confianza absoluta en cada paso. 
                <span className="block mt-2 font-semibold text-foreground">Conecta con el talento o las oportunidades que necesitas de forma rápida y segura.</span>
              </p>
            </AnimatedElement>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 md:gap-16">
              {/* Para Clientes */}
              <div className="flex flex-col gap-4 md:gap-8">
                <AnimatedElement className="lg:sticky top-32">
                  <div className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl group">
                    <Image src="https://static.wixstatic.com/media/307f6c_e70ee8c65a1d48f8a687759c30af3f76~mv2.png?originWidth=576&originHeight=384" alt="Cliente planificando un proyecto en una tableta" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={576} />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-[1]"></div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="absolute top-3 md:top-4 right-4 md:right-8 font-heading text-2xl md:text-4xl font-bold text-white drop-shadow-lg"
                    >
                      Para Clientes
                    </motion.h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-3 md:space-y-8 mt-0 md:mt-0">
                  {clientSteps.map((item) => (
                    <AnimatedElement key={item.id} delay={clientSteps.indexOf(item) * 150}>
                      <motion.div
                        whileHover={{ x: 6, scale: 1.02 }}
                        className="flex items-start gap-3 md:gap-6 p-4 md:p-6 rounded-2xl hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-lg"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                          <item.icon className="text-white" size={24} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading text-xs md:text-sm font-bold text-primary/70">Paso {item.step}</span>
                          </div>
                          <h4 className="font-heading text-base md:text-xl font-bold text-foreground mb-1">{item.text}</h4>
                          <p className="text-xs md:text-base text-muted-text leading-relaxed">{item.subtitle}</p>
                        </div>
                      </motion.div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>

              {/* Para Joseadores */}
              <div className="flex flex-col gap-4 md:gap-8">
                <AnimatedElement className="lg:sticky top-32">
                  <div className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl group">
                    <Image src="https://static.wixstatic.com/media/307f6c_2411ca2d1f6b42fa9707362c9d239248~mv2.png?originWidth=576&originHeight=384" alt="Joseador trabajando en su laptop en un café" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={576} />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/80 to-transparent"></div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      className="absolute top-3 md:top-4 right-4 md:right-8 font-heading text-2xl md:text-4xl font-bold text-white drop-shadow-lg"
                    >
                      Para Joseadores
                    </motion.h3>
                  </div>
                </AnimatedElement>
                <div className="space-y-3 md:space-y-8 mt-0 md:mt-0">
                  {joseadorSteps.map((item) => (
                    <AnimatedElement key={item.id} delay={joseadorSteps.indexOf(item) * 150}>
                      <motion.div
                        whileHover={{ x: 6, scale: 1.02 }}
                        className="flex items-start gap-3 md:gap-6 p-4 md:p-6 rounded-2xl hover:bg-accent/5 transition-all border border-transparent hover:border-accent/20 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-lg"
                      >
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                          <item.icon className="text-white" size={24} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-heading text-xs md:text-sm font-bold text-secondary/70">Paso {item.step}</span>
                          </div>
                          <h4 className="font-heading text-base md:text-xl font-bold text-foreground mb-1">{item.text}</h4>
                          <p className="text-xs md:text-base text-muted-text leading-relaxed">{item.subtitle}</p>
                        </div>
                      </motion.div>
                    </AnimatedElement>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Popular Categories Section - More Vibrant */}
        <section className="py-12 md:py-32 bg-gradient-to-br from-white via-accent/10 to-support/10 w-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-br from-primary via-secondary to-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-[35rem] h-[35rem] bg-gradient-to-br from-accent via-support to-secondary rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-[120rem] mx-auto px-4 md:px-12 relative z-10">
            {/* Text Section Above Carousel */}
            <AnimatedElement className="mb-8 md:mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4 leading-tight">
                  Encuentra el <span className="gradient-text">talento</span> que necesitas
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-muted-text leading-relaxed max-w-3xl">
                  Desde <span className="font-semibold text-foreground">tareas rápidas</span> hasta <span className="font-semibold text-foreground">proyectos complejos</span>. 
                  Conecta con profesionales en múltiples categorías.
                </p>
              </motion.div>
            </AnimatedElement>
            
            <div className="flex gap-4 md:gap-8 pb-4 md:pb-8 overflow-x-auto">
              {popularCategories.map((category) => (
                <AnimatedElement key={category.id} delay={popularCategories.indexOf(category) * 100} className="flex-shrink-0 w-[250px] sm:w-[280px] md:w-[350px]">
                  <motion.div 
                    whileHover={{ y: -6, scale: 1.02 }} 
                    className="group card-hover"
                  >
                    <div className="relative h-[320px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl category-card-mask border-2 border-border/30 hover:border-primary/40 transition-all">
                      <Image src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={350} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 font-heading text-xl md:text-2xl font-bold text-white drop-shadow-lg"
                      >
                        {category.name}
                      </motion.h3>
                    </div>
                  </motion.div>
                </AnimatedElement>
              ))}
            </div>
          </div>
        </section>

        {/* 3D Flow Carousel Section */}
        <section className="py-0 md:py-0 bg-gradient-to-br from-white via-secondary/10 to-white relative overflow-hidden">
          <Flow3DCarousel />
        </section>

        {/* CTA Section - Ultra Dynamic */}
        <section className="py-12 md:py-32 px-4 md:px-12">
          <div className="max-w-[120rem] mx-auto rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <FloatingOrbs />
            <div className="absolute -top-1/2 -left-1/4 w-full h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -rotate-45"></div>
            <AnimatedElement className="relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-4 md:mb-8 pulse-glow"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={20} className="text-yellow-300" />
                </motion.div>
                <span className="text-white font-heading font-semibold text-sm md:text-base">Únete a la revolución</span>
              </motion.div>
              <motion.h2 
                className="font-heading text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 40px rgba(255, 255, 255, 0.8)",
                    "0 0 20px rgba(255, 255, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ¿Listo para josear?
              </motion.h2>
              <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                Únete a dominicanos transformando la forma en que trabajan.
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 md:px-14 py-4 md:py-6 bg-white text-primary font-heading text-base md:text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">Crear Cuenta Gratis</span>
                  <ArrowRight className="inline-block ml-2 relative z-10" size={24} />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>
              </Link>
            </AnimatedElement>
          </div>
        </section>
      </div>
    </>
  );
}
