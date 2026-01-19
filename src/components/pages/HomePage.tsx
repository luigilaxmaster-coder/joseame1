import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-secondary to-support text-white py-24 px-6">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6">
              Conectamos Talento con Oportunidades
            </h1>
            <p className="font-paragraph text-xl md:text-2xl mb-8 text-white/90">
              La plataforma que revoluciona el mercado de servicios profesionales
            </p>
            <Link to="/role-selection">
              <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
                Comenzar Ahora
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border">
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Red de Profesionales
              </h3>
              <p className="font-paragraph text-muted-text">
                Accede a una amplia red de profesionales verificados listos para trabajar
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border">
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Pago Seguro
              </h3>
              <p className="font-paragraph text-muted-text">
                Sistema de escrow que protege tu dinero hasta que el trabajo esté completado
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border">
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Rápido y Fácil
              </h3>
              <p className="font-paragraph text-muted-text">
                Publica trabajos o aplica a ofertas en minutos con nuestra plataforma intuitiva
              </p>
            </div>
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
            <div className="text-center">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Publica o Aplica
              </h3>
              <p className="font-paragraph text-muted-text">
                Los clientes publican trabajos, los joseadores aplican con propuestas
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Pago Protegido
              </h3>
              <p className="font-paragraph text-muted-text">
                El dinero se guarda en escrow hasta completar el trabajo
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-support text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="font-heading text-2xl font-semibold mb-4 text-foreground">
                Trabajo Completado
              </h3>
              <p className="font-paragraph text-muted-text">
                Una vez aprobado, el pago se libera automáticamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-[100rem] mx-auto text-center">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para empezar?
            </h2>
            <p className="font-paragraph text-xl mb-8 text-white/90">
              Únete a la plataforma que está transformando el mercado de servicios
            </p>
            <Link to="/role-selection">
              <button className="bg-white text-primary px-10 py-5 rounded-full font-semibold text-xl hover:bg-gray-100 transition-colors">
                Crear Cuenta Gratis
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
