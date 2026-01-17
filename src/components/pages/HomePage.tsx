import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Shield, Zap } from 'lucide-react';
import CursorGlow from '@/components/CursorGlow';

export default function HomePage() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(113, 210, 97, 0.3)';
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(14, 159, 168, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const zones = [
    {
      id: 'clients',
      title: 'Para Clientes',
      description: 'Publica trabajos y encuentra profesionales verificados',
      position: { top: '20%', left: '15%' },
      link: '/role-selection',
    },
    {
      id: 'joseadores',
      title: 'Para Joseadores',
      description: 'Encuentra trabajos cerca de ti y crece profesionalmente',
      position: { top: '20%', right: '15%' },
      link: '/role-selection',
    },
    {
      id: 'security',
      title: 'Pago Seguro',
      description: 'Sistema de escrow que protege a ambas partes',
      position: { bottom: '25%', left: '15%' },
      link: '/about',
    },
    {
      id: 'trust',
      title: 'Confianza Total',
      description: 'Verificación de identidad y sistema de reputación',
      position: { bottom: '25%', right: '15%' },
      link: '/about',
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0B1220] via-[#0E1829] to-[#0B1220] overflow-hidden">
      <CursorGlow />

      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      {/* Hero Section - Fullscreen */}
      <motion.section
        className="relative h-screen flex items-center justify-center"
        style={{ opacity: heroOpacity, scale: heroScale }}
        onMouseMove={handleMouseMove}
      >
        {/* Gradient Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(14, 159, 168, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(113, 210, 97, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, rgba(58, 182, 137, 0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(14, 159, 168, 0.15) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.h1
            className="font-heading text-6xl md:text-8xl font-bold text-white mb-6"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Conectamos Talento
            <br />
            <span className="bg-gradient-to-r from-accent via-support to-primary bg-clip-text text-transparent">
              con Oportunidades
            </span>
          </motion.h1>

          <motion.p
            className="font-paragraph text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            La plataforma que revoluciona el mercado de servicios profesionales
            con tecnología, seguridad y confianza
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link to="/role-selection">
              <motion.button
                className="group relative px-8 py-4 text-lg font-medium text-white border-2 border-accent/50 rounded-full overflow-hidden"
                whileHover={{ scale: 1.05, borderColor: 'rgba(113, 210, 97, 1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-accent/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-1.5 bg-accent rounded-full"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>

        {/* Interactive Zones */}
        {zones.map((zone) => (
          <motion.div
            key={zone.id}
            className="absolute cursor-pointer"
            style={zone.position}
            onMouseEnter={() => setHoveredZone(zone.id)}
            onMouseLeave={() => setHoveredZone(null)}
          >
            <Link to={zone.link}>
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredZone === zone.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-accent/10 to-primary/10 backdrop-blur-xl border border-accent/30 rounded-2xl p-6 min-w-[280px]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <h3 className="font-heading text-xl font-semibold text-white mb-2">
                    {zone.title}
                  </h3>
                  <p className="font-paragraph text-sm text-gray-300">
                    {zone.description}
                  </p>
                </motion.div>
              </motion.div>
            </Link>

            {/* Hover Indicator */}
            <motion.div
              className="absolute inset-0 -z-10"
              animate={{
                scale: hoveredZone === zone.id ? [1, 1.1, 1] : 1,
                opacity: hoveredZone === zone.id ? [0.3, 0.6, 0.3] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full bg-accent/20 rounded-full blur-3xl" />
            </motion.div>
          </motion.div>
        ))}
      </motion.section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="font-heading text-5xl font-bold text-white text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Cómo Funciona
          </motion.h2>

          {/* Interactive Diagram */}
          <div className="relative flex items-center justify-center gap-12 md:gap-24 flex-wrap">
            {/* Node 1: Cliente */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div
                className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl border-2 border-primary/50 flex flex-col items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1, borderColor: 'rgba(14, 159, 168, 1)' }}
                transition={{ duration: 0.3 }}
              >
                <Users className="w-12 h-12 text-primary mb-3" />
                <span className="font-heading text-xl font-semibold text-white">
                  Cliente
                </span>
              </motion.div>

              {/* Tooltip */}
              <motion.div
                className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-xl border border-primary/30 rounded-xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ y: -10 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-paragraph text-sm text-gray-300 text-center">
                  Publica tu trabajo, recibe propuestas y elige al mejor profesional
                </p>
              </motion.div>

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Connecting Line 1 */}
            <motion.div
              className="hidden md:block relative w-32 h-1"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-accent"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full"
                animate={{ x: [0, 128, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>

            {/* Node 2: Plataforma/Escrow */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                className="relative w-48 h-48 rounded-full bg-gradient-to-br from-accent/20 to-support/20 backdrop-blur-xl border-2 border-accent/50 flex flex-col items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1, borderColor: 'rgba(113, 210, 97, 1)' }}
                transition={{ duration: 0.3 }}
              >
                <Shield className="w-12 h-12 text-accent mb-3" />
                <span className="font-heading text-xl font-semibold text-white">
                  Escrow
                </span>
              </motion.div>

              <motion.div
                className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-br from-accent/10 to-support/10 backdrop-blur-xl border border-accent/30 rounded-xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ y: -10 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-paragraph text-sm text-gray-300 text-center">
                  Protegemos el pago hasta que el trabajo esté completado y aprobado
                </p>
              </motion.div>

              <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-accent/30 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
            </motion.div>

            {/* Connecting Line 2 */}
            <motion.div
              className="hidden md:block relative w-32 h-1"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent to-support"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-support rounded-full"
                animate={{ x: [0, 128, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
              />
            </motion.div>

            {/* Node 3: Joseador */}
            <motion.div
              className="group relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                className="relative w-48 h-48 rounded-full bg-gradient-to-br from-support/20 to-secondary/20 backdrop-blur-xl border-2 border-support/50 flex flex-col items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1, borderColor: 'rgba(85, 195, 118, 1)' }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-12 h-12 text-support mb-3" />
                <span className="font-heading text-xl font-semibold text-white">
                  Joseador
                </span>
              </motion.div>

              <motion.div
                className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-br from-support/10 to-secondary/10 backdrop-blur-xl border border-support/30 rounded-xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ y: -10 }}
                whileHover={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-paragraph text-sm text-gray-300 text-center">
                  Completa el trabajo, recibe tu pago de forma segura y construye tu reputación
                </p>
              </motion.div>

              <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-support/30 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              />
            </motion.div>
          </div>

          {/* Process Steps */}
          <motion.div
            className="mt-24 grid md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              {
                step: '01',
                title: 'Publica o Aplica',
                description: 'Los clientes publican trabajos, los joseadores aplican con propuestas',
              },
              {
                step: '02',
                title: 'Pago Protegido',
                description: 'El dinero se guarda en escrow hasta completar el trabajo',
              },
              {
                step: '03',
                title: 'Trabajo Completado',
                description: 'Una vez aprobado, el pago se libera automáticamente',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative p-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5, borderColor: 'rgba(113, 210, 97, 0.3)' }}
              >
                <div className="text-6xl font-bold text-accent/20 mb-4">{item.step}</div>
                <h3 className="font-heading text-2xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="font-paragraph text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-heading text-5xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="font-paragraph text-xl text-gray-300 mb-12">
            Únete a la plataforma que está transformando el mercado de servicios
          </p>
          <Link to="/role-selection">
            <motion.button
              className="group relative px-10 py-5 text-xl font-semibold text-white bg-gradient-to-r from-accent to-primary rounded-full overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Crear Cuenta Gratis
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-support"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
