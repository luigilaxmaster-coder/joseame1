import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, Check, ShoppingCart, Zap, TrendingUp, Clock, Shield, Percent, Calculator, Sparkles, Award } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function BuyPiquetesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PiquetePackages[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState('5000');

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const { items } = await BaseCrudService.getAll<PiquetePackages>('piquetepackages');
    const activePackages = items.filter(pkg => pkg.isActive);
    setPackages(activePackages);
  };

  const handlePurchase = (packageId: string) => {
    navigate('/checkout', { state: { packageId } });
  };

  // Calculate piquetes based on budget
  const calculatePiquetes = (budget: number) => {
    const baseCost = Math.max(1, Math.floor(budget / 1000));
    return baseCost;
  };

  const piquetesNeeded = calculatePiquetes(parseInt(budgetInput) || 0);

  // Pricing tiers configuration
  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfecto para comenzar',
      price: 500,
      credits: 10,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-white',
      icon: Sparkles,
      features: ['10 piquetes', 'Sin expiración', 'Soporte básico'],
      bestFor: 'Nuevos joseadores'
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Para profesionales activos',
      price: 1200,
      credits: 30,
      gradient: 'from-secondary to-secondary/80',
      bgGradient: 'from-secondary/10 to-secondary/20',
      textColor: 'text-white',
      icon: TrendingUp,
      features: ['30 piquetes', 'Sin expiración', 'Soporte prioritario'],
      bestFor: 'Profesionales activos'
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'La mejor opción',
      price: 2400,
      credits: 75,
      gradient: 'from-accent to-accent/80',
      bgGradient: 'from-accent/10 to-accent/20',
      textColor: 'text-foreground',
      icon: Award,
      featured: true,
      features: ['75 piquetes', 'Sin expiración', 'Soporte 24/7'],
      bestFor: 'Máxima productividad'
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Para máximo crecimiento',
      price: 4500,
      credits: 200,
      gradient: 'from-support to-support/80',
      bgGradient: 'from-support/10 to-support/20',
      textColor: 'text-white',
      icon: Zap,
      features: ['200 piquetes', 'Sin expiración', 'Soporte VIP'],
      bestFor: 'Crecimiento acelerado'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-support/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/joseador/wallet" className="inline-flex items-center gap-2 text-muted-text hover:text-secondary transition-colors font-paragraph font-semibold group">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={20} className="group-hover:text-secondary transition-colors" />
            </motion.div>
            <span>Volver al Wallet</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="text-accent" size={32} />
            </motion.div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent">
              Comprar Piquetes
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="text-support" size={32} />
            </motion.div>
          </div>
          <p className="font-paragraph text-xl text-muted-text max-w-2xl mx-auto">
            Elige el plan perfecto para potenciar tu negocio y aplicar a más trabajos
          </p>
        </motion.div>

        {/* Calculator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-support/20 rounded-3xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-border/50 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Calculator className="text-secondary" size={24} />
                </div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  Calculadora de Piquetes
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="font-paragraph text-sm font-semibold text-foreground mb-3 block">
                    Presupuesto del Trabajo (RD$)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full px-6 py-4 border-2 border-secondary/30 rounded-2xl font-paragraph text-lg focus:outline-none focus:border-secondary transition-all bg-white/50"
                      placeholder="5000"
                    />
                    <span className="absolute right-6 top-1/2 transform -translate-y-1/2 font-paragraph text-muted-text">
                      RD$
                    </span>
                  </div>
                  <p className="font-paragraph text-xs text-muted-text mt-2">
                    Ingresa el presupuesto del trabajo para calcular los piquetes necesarios
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-paragraph text-sm font-semibold text-foreground mb-3">
                      Piquetes Necesarios
                    </p>
                    <motion.div
                      key={piquetesNeeded}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl p-6 border border-secondary/30"
                    >
                      <div className="font-heading text-5xl font-bold text-secondary">
                        {piquetesNeeded}
                      </div>
                      <p className="font-paragraph text-sm text-muted-text mt-2">
                        piquetes para aplicar
                      </p>
                    </motion.div>
                  </div>
                  <div className="text-sm font-paragraph text-muted-text">
                    <p>📊 <strong>Fórmula:</strong> 1 piquete por cada 1000 RD$</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {pricingTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <motion.div
                key={tier.id}
                variants={itemVariants}
                whileHover={{ y: -12 }}
                onClick={() => setSelectedPackage(tier.id)}
                className={`relative rounded-3xl overflow-hidden transition-all cursor-pointer group ${ 
                  tier.featured ? 'lg:scale-105' : ''
                } ${
                  selectedPackage === tier.id
                    ? 'ring-2 ring-offset-2 shadow-2xl'
                    : 'shadow-lg hover:shadow-2xl'
                }`}
              >
                {/* Ribbon for Professional */}
                {tier.featured && (
                  <motion.div
                    initial={{ rotate: 45, x: 50 }}
                    animate={{ rotate: 45, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-0 right-0 w-40 h-40 overflow-hidden"
                  >
                    <div className="absolute top-3 right-[-45px] w-40 bg-gradient-to-r from-accent to-support text-foreground text-xs font-heading font-bold py-1 px-8 transform rotate-45 flex items-center justify-center shadow-lg">
                      ⭐ RECOMENDADO
                    </div>
                  </motion.div>
                )}

                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Card Content */}
                <div className={`relative bg-gradient-to-br ${tier.gradient} p-8 h-full flex flex-col`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4"
                    >
                      <IconComponent size={28} className={tier.textColor} />
                    </motion.div>

                    {/* Title */}
                    <h3 className={`font-heading text-2xl font-bold ${tier.textColor} mb-2`}>
                      {tier.name}
                    </h3>
                    <p className={`font-paragraph ${tier.textColor === 'text-white' ? 'text-white/80' : 'text-foreground/80'} text-sm mb-2`}>
                      {tier.subtitle}
                    </p>
                    <p className={`font-paragraph text-xs ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-foreground/70'} mb-6`}>
                      {tier.bestFor}
                    </p>

                    {/* Price Pill */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-8 text-center border border-white/30"
                    >
                      <div className={`font-heading text-3xl font-bold ${tier.textColor}`}>
                        RD$ {tier.price.toLocaleString()}
                      </div>
                      <div className={`font-paragraph text-xs ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-foreground/70'}`}>
                        por compra
                      </div>
                      <div className={`font-heading text-lg font-bold ${tier.textColor} mt-2`}>
                        {tier.credits} piquetes
                      </div>
                    </motion.div>

                    {/* Features */}
                    <div className="space-y-3 mb-8 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50">
                            <Check size={14} className={tier.textColor} />
                          </div>
                          <span className={`font-paragraph ${tier.textColor} text-sm`}>
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePurchase(tier.id)}
                      className={`w-full px-6 py-3 font-heading font-semibold rounded-2xl transition-all ${ 
                        tier.textColor === 'text-white'
                          ? 'bg-white text-foreground hover:bg-white/90'
                          : 'bg-foreground text-white hover:bg-foreground/90'
                      }`}
                    >
                      Comprar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Purchase Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-16"
        >
          <motion.button
            whileHover={{ scale: selectedPackage ? 1.05 : 1 }}
            whileTap={{ scale: selectedPackage ? 0.95 : 1 }}
            onClick={() => {
              if (selectedPackage) {
                handlePurchase(selectedPackage);
              }
            }}
            disabled={!selectedPackage}
            className={`px-12 py-5 font-heading text-lg font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 mx-auto ${
              selectedPackage
                ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={24} />
            Proceder al Pago
          </motion.button>
          <p className="font-paragraph text-sm text-muted-text mt-6">
            🔒 Pago seguro procesado por nuestra plataforma
          </p>
        </motion.div>

        {/* Information Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {/* How Piquetes Work */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                    <Zap className="text-secondary" size={24} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    ¿Cómo Funcionan?
                  </h3>
                </div>
                <div className="space-y-4 font-paragraph text-foreground">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Costo de aplicación</p>
                      <p className="text-sm text-muted-text">1 piquete por cada 1000 RD$ (mínimo 1)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Ejemplo práctico</p>
                      <p className="text-sm text-muted-text">Trabajo de RD$ 5000 = 5 piquetes</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Ajuste por nivel</p>
                      <p className="text-sm text-muted-text">Intermedio +25%, Experto +50%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center">
                    <Percent className="text-accent" size={24} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground">
                    Política de Reembolso
                  </h3>
                </div>
                <div className="space-y-4 font-paragraph text-foreground">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Rechazado</p>
                      <p className="text-sm text-muted-text">100% de reembolso</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-sm">
                      ◐
                    </div>
                    <div>
                      <p className="font-semibold">Cliente cancela</p>
                      <p className="text-sm text-muted-text">50% de reembolso</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-sm">
                      ✗
                    </div>
                    <div>
                      <p className="font-semibold">Trabajo completado</p>
                      <p className="text-sm text-muted-text">0% de reembolso</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-support/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-support/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-support/20 to-secondary/20 flex items-center justify-center mb-4"
                >
                  <Clock className="text-support" size={24} />
                </motion.div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  Sin Expiración
                </h4>
                <p className="font-paragraph text-sm text-muted-text">
                  Los piquetes no expiran, úsalos cuando quieras sin prisa
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-4"
                >
                  <TrendingUp className="text-secondary" size={24} />
                </motion.div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  Compra Flexible
                </h4>
                <p className="font-paragraph text-sm text-muted-text">
                  Adquiere más piquetes en cualquier momento según tus necesidades
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center mb-4"
                >
                  <Shield className="text-accent" size={24} />
                </motion.div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  Pago Seguro
                </h4>
                <p className="font-paragraph text-sm text-muted-text">
                  Transacciones protegidas con encriptación de nivel bancario
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-accent/10 to-support/10 rounded-3xl blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-border/50 shadow-lg">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-8">
              Preguntas Frecuentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  ¿Puedo cambiar de plan?
                </h4>
                <p className="font-paragraph text-muted-text">
                  Sí, puedes comprar cualquier plan en cualquier momento. Los piquetes se acumulan en tu cuenta.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  ¿Hay límite de piquetes?
                </h4>
                <p className="font-paragraph text-muted-text">
                  No hay límite. Puedes acumular tantos piquetes como necesites para tu negocio.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  ¿Qué pasa si no uso mis piquetes?
                </h4>
                <p className="font-paragraph text-muted-text">
                  Los piquetes no expiran. Puedes guardarlos y usarlos cuando lo necesites.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-foreground mb-2">
                  ¿Hay descuentos por volumen?
                </h4>
                <p className="font-paragraph text-muted-text">
                  Sí, los planes mayores ofrecen mejor precio por piquete. Compara nuestros planes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
