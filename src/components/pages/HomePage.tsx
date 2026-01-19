import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Shield, Zap, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-secondary to-support text-white py-24 px-6">
        <div className="max-w-[100rem] mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              Conectamos Talento con Oportunidades
            </h1>
            <p className="font-paragraph text-xl md:text-2xl mb-8 text-white/90">
              La plataforma que revoluciona el mercado de servicios profesionales
            </p>
            <Link to="/role-selection">
              <motion.button
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-8 rounded-2xl border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Red de Profesionales
              </h3>
              <p className="font-paragraph text-muted-text">
                Accede a una amplia red de profesionales verificados listos para trabajar
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Pago Seguro
              </h3>
              <p className="font-paragraph text-muted-text">
                Sistema de escrow que protege tu dinero hasta que el trabajo esté completado
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-support/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-support" />
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Rápido y Fácil
              </h3>
              <p className="font-paragraph text-muted-text">
                Publica trabajos o aplica a ofertas en minutos con nuestra plataforma intuitiva
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            Cómo Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Publica o Aplica
              </h3>
              <p className="font-paragraph text-muted-text">
                Los clientes publican trabajos, los joseadores aplican con propuestas
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Pago Protegido
              </h3>
              <p className="font-paragraph text-muted-text">
                El dinero se guarda en escrow hasta completar el trabajo
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-support text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Trabajo Completado
              </h3>
              <p className="font-paragraph text-muted-text">
                Una vez aprobado, el pago se libera automáticamente
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-[100rem] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para empezar?
            </h2>
            <p className="font-paragraph text-xl mb-8 text-white/90">
              Únete a la plataforma que está transformando el mercado de servicios
            </p>
            <Link to="/role-selection">
              <motion.button
                className="bg-white text-primary px-10 py-5 rounded-full font-semibold text-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Crear Cuenta Gratis
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
