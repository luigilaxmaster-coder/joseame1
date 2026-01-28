import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Shield, Heart, Sparkles, ArrowRight, TrendingUp, Briefcase, Star, Zap } from 'lucide-react';
import { useRef } from 'react';
import { Image } from '@/components/ui/image';

// Floating Orbs Component
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

// Parallax Image Component
const ParallaxImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={ref} className={`overflow-clip ${className}`}>
      <motion.div style={{ y }} className="h-[120%] w-full">
        <Image src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <style>{`
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
        .floating-icon {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* Hero Section - Ultra Dynamic */}
      <section className="relative min-h-screen flex items-center justify-center w-full overflow-hidden pt-12 md:pt-20">
        <FloatingOrbs />
        <div className="absolute inset-0 z-0">
          <ParallaxImage 
            src="https://static.wixstatic.com/media/307f6c_459db4e37d4c4a09830e7ff2da30e8f8~mv2.png?originWidth=1600&originHeight=896"
            alt="Profesionales dominicanos trabajando juntos"
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
              <span className="text-white font-heading font-semibold text-sm md:text-base">Conoce nuestra historia</span>
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
              <span className="inline-block">Sobre JOSEAME</span>
            </motion.h1>
            <p className="font-heading text-xl md:text-3xl text-white mb-4 md:mb-8 font-semibold">
              La infraestructura digital del joseo dominicano
            </p>
            <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
              Transformando la forma en que los dominicanos trabajan y conectan con oportunidades
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section - Enhanced */}
      <section className="py-12 md:py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-br from-primary via-secondary to-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-br from-accent via-support to-secondary rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-[120rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
              Nuestra <span className="gradient-text">Misión</span>
            </h2>
            <p className="font-paragraph text-lg md:text-2xl text-muted-text max-w-3xl mx-auto leading-relaxed">
              Conectar a profesionales dominicanos con clientes que necesitan sus servicios, 
              creando oportunidades de trabajo digno y facilitando el acceso a servicios de calidad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: Target,
                title: 'Nuestra Visión',
                description: 'Ser la plataforma líder de servicios profesionales en República Dominicana',
                color: 'from-primary to-secondary'
              },
              {
                icon: Users,
                title: 'Comunidad',
                description: 'Miles de profesionales y clientes confiando en nuestra plataforma',
                color: 'from-secondary to-accent'
              },
              {
                icon: Shield,
                title: 'Confianza',
                description: 'Sistema de verificación y pagos seguros para todos',
                color: 'from-accent to-support'
              },
              {
                icon: Heart,
                title: 'Compromiso',
                description: 'Apoyando el desarrollo económico de nuestra comunidad',
                color: 'from-support to-primary'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-hover bg-background rounded-2xl p-8 border border-border shadow-md hover:shadow-2xl"
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.6 } }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <item.icon className="text-white" size={32} />
                </motion.div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="font-paragraph text-muted-text">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - More Vibrant */}
      <section className="py-12 md:py-32 px-6 bg-gradient-to-br from-secondary/10 via-white to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/2 left-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-secondary via-accent to-support rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-accent via-support to-primary rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-[120rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
              Nuestros <span className="gradient-text">Valores</span>
            </h2>
            <p className="font-paragraph text-lg md:text-xl text-muted-text max-w-3xl mx-auto">
              Los principios que guían cada decisión que tomamos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Zap,
                title: 'Transparencia',
                description: 'Operamos con honestidad y claridad en todas nuestras interacciones',
                color: 'from-primary to-secondary'
              },
              {
                icon: Star,
                title: 'Calidad',
                description: 'Nos comprometemos a ofrecer la mejor experiencia para clientes y profesionales',
                color: 'from-secondary to-accent'
              },
              {
                icon: Sparkles,
                title: 'Innovación',
                description: 'Mejoramos constantemente nuestra plataforma con tecnología de punta',
                color: 'from-accent to-support'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-hover bg-white rounded-2xl p-8 border border-border shadow-md hover:shadow-2xl relative overflow-hidden group"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: [0, -15, 15, -15, 0], scale: 1.1, transition: { duration: 0.5 } }}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <value.icon className="text-white" size={32} />
                  </motion.div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="font-paragraph text-muted-text leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - New */}
      <section className="py-12 md:py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-br from-primary via-secondary to-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-[120rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6">
              ¿Por qué <span className="gradient-text">elegir JOSEAME</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Crecimiento Real',
                description: 'Oportunidades auténticas para profesionales y clientes en crecimiento',
                color: 'from-primary to-secondary'
              },
              {
                icon: Briefcase,
                title: 'Múltiples Servicios',
                description: 'Desde reparaciones hasta consultoría profesional y creativa',
                color: 'from-secondary to-accent'
              },
              {
                icon: Shield,
                title: 'Seguridad Garantizada',
                description: 'Pagos protegidos y perfiles verificados para tu tranquilidad',
                color: 'from-accent to-support'
              },
              {
                icon: Users,
                title: 'Comunidad Local',
                description: 'Conecta con talento y clientes de tu propia comunidad',
                color: 'from-support to-primary'
              },
              {
                icon: Zap,
                title: 'Rápido y Fácil',
                description: 'Interfaz intuitiva que te permite actuar en minutos',
                color: 'from-primary to-accent'
              },
              {
                icon: Heart,
                title: 'Apoyo Constante',
                description: 'Equipo dedicado a tu éxito en cada paso del camino',
                color: 'from-accent to-secondary'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="card-hover bg-background rounded-2xl p-8 border border-border shadow-md hover:shadow-2xl relative overflow-hidden group"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative z-10">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg floating-icon`}
                  >
                    <item.icon className="text-white" size={28} />
                  </motion.div>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="font-paragraph text-sm md:text-base text-muted-text leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Ultra Dynamic */}
      <section className="py-12 md:py-32 px-4 md:px-12">
        <div className="max-w-[120rem] mx-auto rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <FloatingOrbs />
          <div className="relative z-10">
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
              ¿Listo para unirte?
            </motion.h2>
            <p className="text-base md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Forma parte de la comunidad JOSEAME y transforma tu forma de trabajar
            </p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 md:px-14 py-4 md:py-6 bg-white text-primary font-heading text-base md:text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">Comenzar Ahora</span>
                <ArrowRight className="inline-block ml-2 relative z-10" size={24} />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
