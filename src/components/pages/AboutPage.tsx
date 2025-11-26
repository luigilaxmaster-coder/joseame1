import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Shield, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al inicio</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="max-w-[100rem] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">
              Sobre JOSEAME
            </h1>
            <p className="font-paragraph text-xl text-white/90 max-w-3xl mx-auto">
              La infraestructura digital del joseo dominicano
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nuestra Misión
            </h2>
            <p className="font-paragraph text-xl text-muted-text max-w-3xl mx-auto">
              Conectar a profesionales dominicanos con clientes que necesitan sus servicios, 
              creando oportunidades de trabajo digno y facilitando el acceso a servicios de calidad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                className="bg-background rounded-2xl p-8 border border-border"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                  <item.icon className="text-white" size={32} />
                </div>
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

      {/* Values Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Nuestros Valores
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparencia',
                description: 'Operamos con honestidad y claridad en todas nuestras interacciones'
              },
              {
                title: 'Calidad',
                description: 'Nos comprometemos a ofrecer la mejor experiencia para clientes y profesionales'
              },
              {
                title: 'Innovación',
                description: 'Mejoramos constantemente nuestra plataforma con tecnología de punta'
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-border shadow-sm"
              >
                <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                  {value.title}
                </h3>
                <p className="font-paragraph text-muted-text">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="max-w-[100rem] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para unirte?
            </h2>
            <p className="font-paragraph text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Forma parte de la comunidad JOSEAME hoy
            </p>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-primary font-heading text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                Comenzar Ahora
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
