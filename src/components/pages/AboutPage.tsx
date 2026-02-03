import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, Sparkles, ArrowRight, Zap, Lightbulb, Rocket, Users2, Award, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';

// Slide Component
const Slide = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = [
    {
      title: "Transformando el Trabajo",
      subtitle: "La plataforma que conecta talento con oportunidades",
      description: "JOSEAME es la revolución digital que necesitaba el mercado laboral dominicano",
      image: "https://static.wixstatic.com/media/307f6c_271d9f7dd4f84278bf39ebe6f7c8799e~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-blue-600 to-cyan-500"
    },
    {
      title: "Nuestra Misión",
      subtitle: "Empoderar profesionales dominicanos",
      description: "Crear oportunidades reales de crecimiento económico para cada profesional",
      image: "https://static.wixstatic.com/media/307f6c_d905827c5d524ba3943eaf5ccc451a6c~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-emerald-600 to-teal-500"
    },
    {
      title: "Nuestra Visión",
      subtitle: "Liderazgo en servicios profesionales",
      description: "Ser el ecosistema más confiable y eficiente de América Latina",
      image: "https://static.wixstatic.com/media/307f6c_26b35e57b7a241429a5e2e0d7fbad43c~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-purple-600 to-pink-500"
    },
    {
      title: "Nuestra Comunidad",
      subtitle: "Miles de historias de éxito",
      description: "Profesionales y clientes trabajando juntos para crear un futuro mejor",
      image: "https://static.wixstatic.com/media/307f6c_c858f3a1495a46cda2986411a5a1b8aa~mv2.png?originWidth=1920&originHeight=1024",
      color: "from-orange-600 to-red-500"
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #0E9FA8 0%, #3AB689 50%, #71D261 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .slide-dot {
          transition: all 0.3s ease;
        }
        .slide-dot.active {
          background-color: currentColor;
          transform: scale(1.4);
        }
        .shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-[120rem] mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph text-sm">Volver</span>
          </Link>
        </div>
      </header>

      {/* Hero Slider Section - Completely New Design */}
      <section className="relative h-screen flex items-center justify-center w-full overflow-hidden bg-black">
        {/* Slides */}
        {slides.map((slide, index) => (
          <Slide key={index} isActive={index === currentSlide}>
            <div className="absolute inset-0 z-0">
              <Image 
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50"></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-30`}></div>
            </div>
            
            <div className="relative z-10 max-w-[120rem] mx-auto px-4 md:px-12 w-full h-full flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center max-w-4xl"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-block mb-6"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md`}>
                    <Sparkles size={16} className="text-yellow-300" />
                    <span className="text-white font-paragraph text-xs md:text-sm font-semibold">{index + 1} de {slides.length}</span>
                  </div>
                </motion.div>

                <motion.h1 
                  className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {slide.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="space-y-4"
                >
                  <p className="font-heading text-2xl md:text-4xl text-white/90 font-semibold">
                    {slide.subtitle}
                  </p>
                  <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {slide.description}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </Slide>
        ))}

        {/* Navigation Buttons */}
        <motion.button
          onClick={prevSlide}
          whileHover={{ scale: 1.15, x: -4 }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full border border-white/40 transition-all"
        >
          <ChevronLeft size={32} className="text-white" />
        </motion.button>

        <motion.button
          onClick={nextSlide}
          whileHover={{ scale: 1.15, x: 4 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-4 rounded-full border border-white/40 transition-all"
        >
          <ChevronRight size={32} className="text-white" />
        </motion.button>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`slide-dot w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </section>

      {/* Story Section - New Layout */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[120rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
                La Historia de <span className="gradient-text">JOSEAME</span>
              </h2>
              <p className="font-paragraph text-lg text-gray-700 mb-6 leading-relaxed">
                Nació de una simple observación: miles de profesionales dominicanos talentosos no tenían acceso a oportunidades reales. Mientras tanto, clientes buscaban servicios confiables sin saber dónde encontrarlos.
              </p>
              <p className="font-paragraph text-lg text-gray-700 leading-relaxed">
                Decidimos cerrar esa brecha. Hoy, JOSEAME es más que una plataforma: es un movimiento que transforma vidas y genera oportunidades económicas reales en la República Dominicana.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl"></div>
              <Image 
                src="https://static.wixstatic.com/media/307f6c_587ea894be3142ddb3e575ca3024914d~mv2.png?originWidth=1024&originHeight=768"
                alt="JOSEAME Story"
                className="relative rounded-3xl w-full h-96 object-cover shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Section - New Design */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              Nuestro <span className="gradient-text">Impacto</span>
            </h2>
            <p className="font-paragraph text-xl text-gray-600 max-w-2xl mx-auto">
              Números que hablan de transformación real
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Profesionales Activos", icon: Users2 },
              { number: "50K+", label: "Trabajos Completados", icon: Award },
              { number: "15M+", label: "En Transacciones", icon: Zap },
              { number: "98%", label: "Satisfacción", icon: Globe }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 text-center hover:border-primary/50 transition-colors">
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <div className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <p className="font-paragraph text-gray-600">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Grid - New Design */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              Lo que nos <span className="gradient-text">Define</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Innovación Constante",
                description: "Evolucionamos cada día para ofrecer mejores soluciones",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Rocket,
                title: "Crecimiento Acelerado",
                description: "Herramientas que impulsan el éxito de nuestros usuarios",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Award,
                title: "Excelencia Garantizada",
                description: "Estándares de calidad en cada interacción",
                color: "from-emerald-500 to-teal-500"
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary/50 transition-all shadow-md hover:shadow-xl">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <value.icon className="text-white" size={32} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="font-paragraph text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section - New Layout */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-24"
          >
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-6">
              ¿Por qué <span className="gradient-text">JOSEAME</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Para Profesionales",
                items: [
                  "Acceso a oportunidades reales y verificadas",
                  "Pagos seguros y puntuales",
                  "Herramientas para crecer tu negocio",
                  "Comunidad de apoyo constante"
                ]
              },
              {
                title: "Para Clientes",
                items: [
                  "Profesionales verificados y confiables",
                  "Presupuestos transparentes",
                  "Protección de pagos garantizada",
                  "Soporte en cada paso"
                ]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-200"
              >
                <h3 className="font-heading text-3xl font-bold text-foreground mb-8">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <span className="font-paragraph text-lg text-gray-700">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - New Design */}
      <section className="py-20 md:py-32 px-6 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              x: [0, -20, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-[120rem] mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6">
              Comienza tu Transformación
            </h2>
            <p className="font-paragraph text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Únete a miles de profesionales y clientes que ya están cambiando sus vidas
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white text-primary font-heading font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all text-lg"
                >
                  Comenzar Ahora
                </motion.button>
              </Link>
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-white/20 text-white font-heading font-bold rounded-xl border border-white/40 backdrop-blur-md hover:bg-white/30 transition-all text-lg"
                >
                  Conocer Más
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
