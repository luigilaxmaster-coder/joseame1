import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import CursorGlow from '@/components/CursorGlow';
import { Briefcase, Shield, Zap, Users, TrendingUp, Award, CheckCircle, ArrowRight, Star, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background relative overflow-hidden">
      <CursorGlow />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/30 to-support/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-secondary to-support text-white py-32 px-6 overflow-hidden">
        {/* Animated shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-accent/20 rounded-full backdrop-blur-sm"
        />
        
        <div className="max-w-[100rem] mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <Star className="w-5 h-5 text-yellow-300" fill="currentColor" />
                <span className="text-sm font-semibold">Plataforma #1 en Servicios</span>
              </motion.div>
              
              <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Conectamos <span className="text-accent">Talento</span> con <span className="text-light-green">Oportunidades</span>
              </h1>
              <p className="font-paragraph text-xl md:text-2xl mb-8 text-white/90">
                La plataforma que revoluciona el mercado de servicios profesionales con tecnología de punta
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/role-selection">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2"
                  >
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all border-2 border-white/30"
                  >
                    Conocer Más
                  </motion.button>
                </Link>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-6 mt-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">10K+</div>
                  <div className="text-sm text-white/80">Profesionales</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-light-green">50K+</div>
                  <div className="text-sm text-white/80">Trabajos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">4.9★</div>
                  <div className="text-sm text-white/80">Calificación</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <Image
                    src="https://static.wixstatic.com/media/307f6c_d8d597cca41c496ba6802412abf9b4bd~mv2.png?originWidth=576&originHeight=576"
                    alt="Profesionales trabajando"
                    width={600}
                    className="rounded-3xl shadow-2xl"
                  />
                </motion.div>
                
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Trabajo Completado</div>
                      <div className="text-sm text-muted-text">+$2,500</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [2, -2, 2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Nuevo Proyecto</div>
                      <div className="text-sm text-muted-text">5 aplicaciones</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-[100rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-4 text-foreground">
              ¿Por qué <span className="text-primary">elegirnos</span>?
            </h2>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Descubre las ventajas que nos hacen la mejor opción del mercado
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Red de Profesionales',
                description: 'Accede a una amplia red de profesionales verificados listos para trabajar',
                color: 'from-primary to-secondary',
                delay: 0.1
              },
              {
                icon: Shield,
                title: 'Pago Seguro',
                description: 'Sistema de escrow que protege tu dinero hasta que el trabajo esté completado',
                color: 'from-accent to-support',
                delay: 0.2
              },
              {
                icon: Zap,
                title: 'Rápido y Fácil',
                description: 'Publica trabajos o aplica a ofertas en minutos con nuestra plataforma intuitiva',
                color: 'from-support to-support2',
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white p-8 rounded-3xl border border-border shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="font-paragraph text-muted-text leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative element */}
                <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full opacity-10 blur-2xl`} />
              </motion.div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { icon: Award, text: 'Profesionales Verificados', color: 'text-accent' },
              { icon: Clock, text: 'Respuesta en 24h', color: 'text-primary' },
              { icon: TrendingUp, text: 'Crecimiento Garantizado', color: 'text-support' },
              { icon: Briefcase, text: 'Miles de Proyectos', color: 'text-secondary' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-border text-center"
              >
                <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-3`} />
                <p className="font-semibold text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-white via-background to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[100rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Cómo <span className="text-secondary">Funciona</span>
            </h2>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Tres simples pasos para conectar talento con oportunidades
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-support opacity-20" />

            {[
              {
                number: 1,
                title: 'Publica o Aplica',
                description: 'Los clientes publican trabajos, los joseadores aplican con propuestas',
                color: 'from-primary to-secondary',
                icon: Briefcase,
                image: 'https://static.wixstatic.com/media/307f6c_37521c5185254913b248882fffce1e7a~mv2.png?originWidth=256&originHeight=256'
              },
              {
                number: 2,
                title: 'Pago Protegido',
                description: 'El dinero se guarda en escrow hasta completar el trabajo',
                color: 'from-accent to-support',
                icon: Shield,
                image: 'https://static.wixstatic.com/media/307f6c_0ce332453a7c4e19b8ec8af4bd9056ec~mv2.png?originWidth=256&originHeight=256'
              },
              {
                number: 3,
                title: 'Trabajo Completado',
                description: 'Una vez aprobado, el pago se libera automáticamente',
                color: 'from-support to-support2',
                icon: CheckCircle,
                image: 'https://static.wixstatic.com/media/307f6c_1909c2a05a0044f79f4864458f81ea5b~mv2.png?originWidth=256&originHeight=256'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="text-center relative z-10"
                >
                  {/* Image */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="mb-6 relative"
                  >
                    <div className="relative inline-block">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={300}
                        className="rounded-3xl shadow-xl mx-auto"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 rounded-3xl`} />
                    </div>
                  </motion.div>

                  {/* Number Badge */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl relative`}
                  >
                    <span className="relative z-10">{step.number}</span>
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-50`} />
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-4"
                  >
                    <step.icon className={`w-12 h-12 mx-auto bg-gradient-to-br ${step.color} bg-clip-text text-transparent`} strokeWidth={2} />
                  </motion.div>

                  <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                    {step.title}
                  </h3>
                  <p className="font-paragraph text-muted-text leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>

                {/* Decorative arrow */}
                {index < 2 && (
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="hidden md:block absolute top-1/3 -right-6 z-20"
                  >
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Process Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 bg-white rounded-3xl p-8 shadow-xl border border-border"
          >
            <h3 className="font-heading text-2xl font-bold text-center mb-8 text-foreground">
              Flujo del Proceso
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {['Cliente Publica', 'Joseador Aplica', 'Pago en Escrow', 'Trabajo Realizado', 'Confirmación', 'Pago Liberado'].map((step, index) => (
                <div key={index} className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="bg-gradient-to-br from-primary to-secondary text-white px-6 py-3 rounded-full font-semibold shadow-lg"
                  >
                    {step}
                  </motion.div>
                  {index < 5 && (
                    <ArrowRight className="w-6 h-6 text-muted-text mx-2" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary via-secondary to-support text-white relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            rotate: [360, 180, 0],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />

        <div className="max-w-[100rem] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, delay: i * 0.2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-8 h-8 text-yellow-300" fill="currentColor" />
                </motion.div>
              ))}
            </div>

            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              ¿Listo para <span className="text-accent">empezar</span>?
            </h2>
            <p className="font-paragraph text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
              Únete a la plataforma que está transformando el mercado de servicios y descubre un mundo de oportunidades
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/role-selection">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary px-10 py-5 rounded-full font-semibold text-xl hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-2"
                >
                  Crear Cuenta Gratis
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-8 text-white/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Configuración en 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Soporte 24/7</span>
              </div>
            </motion.div>

            {/* Animated illustration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 relative"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image
                    src="https://static.wixstatic.com/media/307f6c_6d4e31cc7fea474da4a16928c79bd894~mv2.png?originWidth=768&originHeight=576"
                    alt="Únete ahora"
                    width={800}
                    className="rounded-3xl shadow-2xl"
                  />
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -left-8 bg-white text-foreground rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <div className="text-left">
                      <div className="font-bold">10,000+</div>
                      <div className="text-sm text-muted-text">Usuarios Activos</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0], rotate: [3, -3, 3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-8 -right-8 bg-white text-foreground rounded-2xl p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-accent" />
                    <div className="text-left">
                      <div className="font-bold">4.9/5</div>
                      <div className="text-sm text-muted-text">Calificación</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
