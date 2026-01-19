import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import CursorGlow from '@/components/CursorGlow';
import { 
  Briefcase, Shield, Zap, Users, TrendingUp, Award, CheckCircle, ArrowRight, Star, Clock, 
  Sparkles, Rocket, Heart, Target, DollarSign, MessageCircle, Globe, Lock, Smartphone, 
  Headphones, BarChart3, FileCheck, UserCheck, Wallet, Search, Settings 
} from 'lucide-react';

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
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/50 to-support/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-primary/50 to-secondary/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-support2/40 to-accent/40 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-secondary to-support text-white py-32 px-6 overflow-hidden">
        {/* Logo at the top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-20"
        >
          <Image
            src="https://static.wixstatic.com/media/307f6c_90c18dbeed4b48df8fe49e1c1cff9637~mv2.png"
            alt="Joseame Logo"
            width={220}
            className="drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
        {/* Animated shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/20 rounded-3xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-20 w-40 h-40 bg-accent/30 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-light-green/25 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-yellow-300/20 rounded-full backdrop-blur-sm"
        />
        
        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </motion.div>
        ))}
        
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
                Conectamos <span className="text-accent drop-shadow-lg">Talento</span> con <span className="text-light-green drop-shadow-lg">Oportunidades</span>
              </h1>
              <p className="font-paragraph text-xl md:text-2xl mb-8 text-white/95 drop-shadow-md">
                La plataforma que revoluciona el mercado de servicios profesionales con tecnología de punta
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/role-selection">
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 1, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-white to-gray-100 text-primary px-8 py-4 rounded-full font-semibold text-lg hover:from-gray-100 hover:to-white transition-all shadow-2xl flex items-center gap-2 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <Rocket className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Comenzar Ahora</span>
                    <ArrowRight className="w-5 h-5 relative z-10" />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: -1, boxShadow: "0 20px 40px rgba(255,255,255,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/25 backdrop-blur-md text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/35 transition-all border-2 border-white/40 shadow-xl relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <Heart className="w-5 h-5 inline mr-2 relative z-10" />
                    <span className="relative z-10">Conocer Más</span>
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
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="text-3xl font-bold text-accent drop-shadow-lg">10K+</div>
                  <div className="text-sm text-white/90">Profesionales</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="text-3xl font-bold text-light-green drop-shadow-lg">50K+</div>
                  <div className="text-sm text-white/90">Trabajos</div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                >
                  <div className="text-3xl font-bold text-yellow-300 drop-shadow-lg">4.9★</div>
                  <div className="text-sm text-white/90">Calificación</div>
                </motion.div>
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
                    src="https://static.wixstatic.com/media/307f6c_4984a4e53de44f7eb45af54009e985b9~mv2.png?originWidth=576&originHeight=384"
                    alt="Profesionales trabajando"
                    width={600}
                    className="rounded-3xl shadow-2xl"
                  />
                </motion.div>
                
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -left-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-2xl border-2 border-accent/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-support rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Trabajo Completado</div>
                      <div className="text-sm text-accent font-semibold">+$2,500</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [2, -2, 2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 shadow-2xl border-2 border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Nuevo Proyecto</div>
                      <div className="text-sm text-primary font-semibold">5 aplicaciones</div>
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
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Target className="w-16 h-16 text-primary mx-auto" />
            </motion.div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-4 text-foreground">
              ¿Por qué <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-support">elegirnos</span>?
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
                delay: 0.1,
              },
              {
                icon: Shield,
                title: 'Pago Seguro',
                description: 'Sistema de escrow que protege tu dinero hasta que el trabajo esté completado',
                color: 'from-accent to-support',
                delay: 0.2,
              },
              {
                icon: Zap,
                title: 'Rápido y Fácil',
                description: 'Publica trabajos o aplica a ofertas en minutos con nuestra plataforma intuitiva',
                color: 'from-support to-support2',
                delay: 0.3,
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gradient-to-br from-white via-white to-gray-50 p-8 rounded-3xl border-2 border-border shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl relative`}
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
                <div className={`absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full opacity-20 blur-2xl`} />
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
              { icon: Award, text: 'Profesionales Verificados', color: 'text-accent', bg: 'from-accent/20 to-support/20' },
              { icon: Clock, text: 'Respuesta en 24h', color: 'text-primary', bg: 'from-primary/20 to-secondary/20' },
              { icon: TrendingUp, text: 'Crecimiento Garantizado', color: 'text-support', bg: 'from-support/20 to-support2/20' },
              { icon: Briefcase, text: 'Miles de Proyectos', color: 'text-secondary', bg: 'from-secondary/20 to-primary/20' }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, rotate: 2 }}
                className={`bg-gradient-to-br ${item.bg} p-6 rounded-2xl border-2 border-border text-center shadow-lg hover:shadow-xl transition-all relative overflow-hidden`}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <item.icon className={`w-10 h-10 ${item.color} mx-auto mb-3`} />
                </motion.div>
                <p className="font-semibold text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* New Enhanced Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20"
          >
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Características <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-support to-primary">Premium</span>
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: 'Alcance Global', desc: 'Conecta con profesionales en todo el mundo', color: 'from-blue-500 to-cyan-500' },
                { icon: Lock, title: 'Seguridad Total', desc: 'Encriptación de extremo a extremo', color: 'from-purple-500 to-pink-500' },
                { icon: Smartphone, title: 'App Móvil', desc: 'Gestiona todo desde tu teléfono', color: 'from-green-500 to-emerald-500' },
                { icon: Headphones, title: 'Soporte 24/7', desc: 'Asistencia en tiempo real', color: 'from-orange-500 to-red-500' },
                { icon: BarChart3, title: 'Análisis Avanzado', desc: 'Métricas y reportes detallados', color: 'from-indigo-500 to-blue-500' },
                { icon: FileCheck, title: 'Contratos Digitales', desc: 'Firma electrónica integrada', color: 'from-teal-500 to-cyan-500' },
                { icon: UserCheck, title: 'Verificación ID', desc: 'Identidad confirmada', color: 'from-pink-500 to-rose-500' },
                { icon: Wallet, title: 'Múltiples Pagos', desc: 'Acepta diversos métodos', color: 'from-amber-500 to-yellow-500' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl border-2 border-border shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  
                  <h4 className="font-heading text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-text">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Stats Section - REMOVED */}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-white via-background to-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-support/25 rounded-full blur-3xl" />
        </div>

        {/* Floating icons */}
        {[DollarSign, MessageCircle, Rocket, Heart].map((Icon, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + (i % 2) * 70}%`,
            }}
          >
            <Icon className="w-12 h-12 text-primary/30" />
          </motion.div>
        ))}

        <div className="max-w-[100rem] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <Zap className="w-16 h-16 text-secondary mx-auto" />
            </motion.div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-4 text-foreground">
              Cómo <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-support to-accent">Funciona</span>
            </h2>
            <p className="text-xl text-muted-text max-w-2xl mx-auto">
              Tres simples pasos para conectar talento con oportunidades
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-support opacity-30 rounded-full" />

            {[
              {
                number: 1,
                title: 'Publica o Aplica',
                description: 'Los clientes publican trabajos, los joseadores aplican con propuestas',
                color: 'from-primary to-secondary',
                icon: Briefcase,
                image: 'https://static.wixstatic.com/media/307f6c_cba910a5aa8447dba31325d566c342bf~mv2.png'
              },
              {
                number: 2,
                title: 'Pago Protegido',
                description: 'El dinero se guarda en escrow hasta completar el trabajo',
                color: 'from-accent to-support',
                icon: Shield,
                image: 'https://static.wixstatic.com/media/307f6c_a83f826a176149d1844ec7b74e4f3df2~mv2.png'
              },
              {
                number: 3,
                title: 'Trabajo Completado',
                description: 'Una vez aprobado, el pago se libera automáticamente',
                color: 'from-support to-support2',
                icon: CheckCircle,
                image: 'https://static.wixstatic.com/media/307f6c_778e3d21b78e41e09302d86dc1f9d8c5~mv2.png'
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
                        className="rounded-3xl shadow-2xl mx-auto border-4 border-white"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-30 rounded-3xl`} />
                    </div>
                  </motion.div>

                  {/* Number Badge */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-2xl relative border-4 border-white`}
                  >
                    <span className="relative z-10">{step.number}</span>
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-60`} />
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

          {/* Process Diagram - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 rounded-3xl p-10 shadow-2xl border-2 border-primary/20 relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-support/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h3 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-foreground">
                  Flujo del <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-support">Proceso</span>
                </h3>
                <p className="text-muted-text text-lg">De principio a fin, un proceso simple y seguro</p>
              </motion.div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { text: 'Cliente Publica', icon: Search, desc: 'Describe tu proyecto', color: 'from-blue-500 to-cyan-500' },
                  { text: 'Joseador Aplica', icon: UserCheck, desc: 'Profesionales ofertan', color: 'from-purple-500 to-pink-500' },
                  { text: 'Pago en Escrow', icon: Lock, desc: 'Dinero protegido', color: 'from-green-500 to-emerald-500' },
                  { text: 'Trabajo Realizado', icon: Settings, desc: 'Servicio ejecutado', color: 'from-orange-500 to-red-500' },
                  { text: 'Confirmación', icon: CheckCircle, desc: 'Cliente aprueba', color: 'from-indigo-500 to-blue-500' },
                  { text: 'Pago Liberado', icon: DollarSign, desc: 'Fondos transferidos', color: 'from-teal-500 to-cyan-500' }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.03 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-border group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                      >
                        <step.icon className="w-7 h-7 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-8 h-8 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                            {index + 1}
                          </span>
                          <h4 className="font-heading text-lg font-semibold text-foreground">
                            {step.text}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-text">{step.desc}</p>
                      </div>
                    </div>
                    
                    {/* Arrow connector for desktop */}
                    {index < 5 && (
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20"
                      >
                        <ArrowRight className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Timeline visualization */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8 }}
                className="hidden md:flex items-center justify-center gap-2 mt-8"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                      className="w-4 h-4 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg"
                    />
                    {i < 5 && (
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary" />
                    )}
                  </div>
                ))}
              </motion.div>
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
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -180, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-light-green/25 rounded-full blur-3xl"
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
              ¿Listo para <span className="text-accent drop-shadow-2xl">empezar</span>?
            </h2>
            <p className="font-paragraph text-xl md:text-2xl mb-10 text-white/95 max-w-3xl mx-auto drop-shadow-lg">
              Únete a la plataforma que está transformando el mercado de servicios y descubre un mundo de oportunidades
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/role-selection">
                <motion.button
                  whileHover={{ scale: 1.08, boxShadow: "0 25px 50px rgba(0,0,0,0.4)", rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-white via-gray-50 to-white text-primary px-10 py-5 rounded-full font-semibold text-xl hover:from-gray-50 hover:to-white transition-all shadow-2xl flex items-center gap-2 border-2 border-white/50"
                >
                  <Rocket className="w-6 h-6" />
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
              className="flex flex-wrap justify-center items-center gap-8 text-white/90"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Sin tarjeta de crédito</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <Clock className="w-5 h-5 text-accent" />
                <span>Configuración en 2 minutos</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <Headphones className="w-5 h-5 text-accent" />
                <span>Soporte 24/7</span>
              </motion.div>
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
                    src="https://static.wixstatic.com/media/307f6c_aaa051211e2e41c1beb96fc5cb0b7cc3~mv2.png?originWidth=768&originHeight=576"
                    alt="Únete ahora"
                    width={800}
                    className="rounded-3xl shadow-2xl"
                  />
                </motion.div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-8 -left-8 bg-gradient-to-br from-white to-gray-50 text-foreground rounded-2xl p-4 shadow-2xl border-2 border-primary/30"
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
                  className="absolute -bottom-8 -right-8 bg-gradient-to-br from-white to-gray-50 text-foreground rounded-2xl p-4 shadow-2xl border-2 border-accent/30"
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
