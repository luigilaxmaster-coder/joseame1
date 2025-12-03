import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, Check, ShoppingCart, Zap, TrendingUp, Clock, Shield, Percent, Calculator, Sparkles, Award, Flame, Crown, Rocket, Heart, Target, Lightbulb } from 'lucide-react';
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
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-white',
      icon: Sparkles,
      badge: 'INICIANTE',
      badgeColor: 'bg-blue-500',
      features: ['10 piquetes', 'Sin expiración', 'Soporte básico', 'Acceso a trabajos'],
      bestFor: 'Nuevos joseadores',
      pricePerPiquete: 50
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Para profesionales activos',
      price: 1200,
      credits: 30,
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-white',
      icon: TrendingUp,
      badge: 'POPULAR',
      badgeColor: 'bg-purple-500',
      features: ['30 piquetes', 'Sin expiración', 'Soporte prioritario', 'Estadísticas avanzadas'],
      bestFor: 'Profesionales activos',
      pricePerPiquete: 40
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'La mejor opción',
      price: 2400,
      credits: 75,
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      bgGradient: 'from-amber-50 to-orange-50',
      textColor: 'text-white',
      icon: Crown,
      badge: 'RECOMENDADO',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      featured: true,
      features: ['75 piquetes', 'Sin expiración', 'Soporte 24/7', 'Análisis detallado', 'Prioridad en búsquedas'],
      bestFor: 'Máxima productividad',
      pricePerPiquete: 32,
      savings: '36%'
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Para máximo crecimiento',
      price: 4500,
      credits: 200,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      bgGradient: 'from-emerald-50 to-cyan-50',
      textColor: 'text-white',
      icon: Rocket,
      badge: 'ÉLITE',
      badgeColor: 'bg-emerald-500',
      features: ['200 piquetes', 'Sin expiración', 'Soporte VIP', 'Acceso prioritario', 'Consultoría incluida'],
      bestFor: 'Crecimiento acelerado',
      pricePerPiquete: 22.5,
      savings: '55%'
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
      <div className="absolute top-0 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 w-64 md:w-96 h-64 md:h-96 bg-support/10 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-3 md:py-4">
          <Link to="/joseador/wallet" className="inline-flex items-center gap-2 text-muted-text hover:text-secondary transition-colors font-paragraph font-semibold group">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={20} className="group-hover:text-secondary transition-colors" />
            </motion.div>
            <span className="hidden sm:inline">Volver al Wallet</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        {/* Hero Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4 flex-wrap">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="text-accent" size={24} />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent">
              Comprar Piquetes
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="text-support" size={24} />
            </motion.div>
          </div>
          <p className="font-paragraph text-base md:text-xl text-muted-text max-w-2xl mx-auto px-2">
            Elige el plan perfecto para potenciar tu negocio
          </p>
        </motion.div>

        {/* Calculator Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 md:mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-support/20 rounded-2xl md:rounded-3xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <Calculator className="text-secondary" size={20} />
                </div>
                <h2 className="font-heading text-lg md:text-2xl font-bold text-foreground">
                  Calculadora
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="font-paragraph text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 block">
                    Presupuesto (RD$)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-secondary/30 rounded-xl md:rounded-2xl font-paragraph text-base md:text-lg focus:outline-none focus:border-secondary transition-all bg-white/50"
                      placeholder="5000"
                    />
                    <span className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 font-paragraph text-muted-text text-sm md:text-base">
                      RD$
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <p className="font-paragraph text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">
                      Piquetes Necesarios
                    </p>
                    <motion.div
                      key={piquetesNeeded}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl md:rounded-2xl p-4 md:p-6 border border-secondary/30"
                    >
                      <div className="font-heading text-3xl md:text-5xl font-bold text-secondary">
                        {piquetesNeeded}
                      </div>
                      <p className="font-paragraph text-xs md:text-sm text-muted-text mt-1 md:mt-2">
                        piquetes
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
              <p className="font-paragraph text-xs text-muted-text mt-3 text-center">
                📊 1 piquete por cada 1000 RD$
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid - Optimized for Mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          {pricingTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <motion.div
                key={tier.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPackage(tier.id)}
                className={`relative rounded-2xl md:rounded-3xl overflow-hidden transition-all cursor-pointer group ${
                  tier.featured ? 'sm:scale-105 lg:scale-105' : ''
                } ${
                  selectedPackage === tier.id
                    ? 'ring-2 ring-offset-2 shadow-xl md:shadow-2xl'
                    : 'shadow-lg hover:shadow-xl md:hover:shadow-2xl'
                }`}
              >
                {/* Badge */}
                <div className={`absolute top-4 md:top-6 right-4 md:right-6 z-20 ${tier.badgeColor} text-white text-xs md:text-sm font-heading font-bold px-3 md:px-4 py-1 md:py-2 rounded-full flex items-center gap-1`}>
                  {tier.badge === 'RECOMENDADO' && <Flame size={14} />}
                  {tier.badge === 'POPULAR' && <Heart size={14} />}
                  {tier.badge === 'ÉLITE' && <Crown size={14} />}
                  {tier.badge === 'INICIANTE' && <Lightbulb size={14} />}
                  {tier.badge}
                </div>

                {/* Savings Badge */}
                {tier.savings && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 md:top-6 left-4 md:left-6 z-20 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs md:text-sm font-heading font-bold px-3 md:px-4 py-1 md:py-2 rounded-full"
                  >
                    Ahorra {tier.savings}
                  </motion.div>
                )}

                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Card Content */}
                <div className={`relative bg-gradient-to-br ${tier.gradient} p-6 md:p-8 h-full flex flex-col`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full blur-3xl -mr-12 md:-mr-16 -mt-12 md:-mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-white/10 rounded-full blur-3xl -ml-12 md:-ml-16 -mb-12 md:-mb-16" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center mb-3 md:mb-4"
                    >
                      <IconComponent size={24} className={tier.textColor} />
                    </motion.div>

                    {/* Title */}
                    <h3 className={`font-heading text-xl md:text-2xl font-bold ${tier.textColor} mb-1 md:mb-2`}>
                      {tier.name}
                    </h3>
                    <p className={`font-paragraph ${tier.textColor === 'text-white' ? 'text-white/80' : 'text-foreground/80'} text-xs md:text-sm mb-1 md:mb-2`}>
                      {tier.subtitle}
                    </p>
                    <p className={`font-paragraph text-xs ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-foreground/70'} mb-4 md:mb-6`}>
                      {tier.bestFor}
                    </p>

                    {/* Price Pill */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 mb-6 md:mb-8 text-center border border-white/30"
                    >
                      <div className={`font-heading text-2xl md:text-3xl font-bold ${tier.textColor}`}>
                        RD$ {tier.price.toLocaleString()}
                      </div>
                      <div className={`font-paragraph text-xs ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-foreground/70'}`}>
                        por compra
                      </div>
                      <div className={`font-heading text-base md:text-lg font-bold ${tier.textColor} mt-1 md:mt-2`}>
                        {tier.credits} piquetes
                      </div>
                      <div className={`font-paragraph text-xs ${tier.textColor === 'text-white' ? 'text-white/60' : 'text-foreground/60'} mt-2`}>
                        RD$ {(tier.price / tier.credits).toFixed(0)} por piquete
                      </div>
                    </motion.div>

                    {/* Features */}
                    <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-grow">
                      {tier.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2 md:gap-3"
                        >
                          <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50">
                            <Check size={12} className={tier.textColor} />
                          </div>
                          <span className={`font-paragraph ${tier.textColor} text-xs md:text-sm`}>
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
                      className={`w-full px-4 md:px-6 py-2 md:py-3 font-heading font-semibold text-sm md:text-base rounded-xl md:rounded-2xl transition-all ${
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
          className="text-center mb-8 md:mb-12"
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
            className={`px-8 md:px-12 py-4 md:py-5 font-heading text-base md:text-lg font-semibold rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 md:gap-3 mx-auto ${
              selectedPackage
                ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-lg hover:shadow-xl cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Proceder al Pago</span>
            <span className="sm:hidden">Pagar</span>
          </motion.button>
          <p className="font-paragraph text-xs md:text-sm text-muted-text mt-4 md:mt-6">
            🔒 Pago seguro procesado por nuestra plataforma
          </p>
        </motion.div>

        {/* Information Sections - Compact */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          {/* How Piquetes Work */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="text-secondary" size={20} />
                  </div>
                  <h3 className="font-heading text-lg md:text-2xl font-bold text-foreground">
                    ¿Cómo Funcionan?
                  </h3>
                </div>
                <div className="space-y-3 md:space-y-4 font-paragraph text-foreground text-sm md:text-base">
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-xs md:text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Costo de aplicación</p>
                      <p className="text-xs md:text-sm text-muted-text">1 piquete por cada 1000 RD$</p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-xs md:text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Ejemplo</p>
                      <p className="text-xs md:text-sm text-muted-text">RD$ 5000 = 5 piquetes</p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-xs md:text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Ajuste por nivel</p>
                      <p className="text-xs md:text-sm text-muted-text">+25% o +50%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center flex-shrink-0">
                    <Percent className="text-accent" size={20} />
                  </div>
                  <h3 className="font-heading text-lg md:text-2xl font-bold text-foreground">
                    Reembolsos
                  </h3>
                </div>
                <div className="space-y-3 md:space-y-4 font-paragraph text-foreground text-sm md:text-base">
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Rechazado</p>
                      <p className="text-xs md:text-sm text-muted-text">100% reembolso</p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">
                      ◐
                    </div>
                    <div>
                      <p className="font-semibold">Cancela cliente</p>
                      <p className="text-xs md:text-sm text-muted-text">50% reembolso</p>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-xs">
                      ✗
                    </div>
                    <div>
                      <p className="font-semibold">Completado</p>
                      <p className="text-xs md:text-sm text-muted-text">0% reembolso</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Features - Compact */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-support/20 to-secondary/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-support/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-support/20 to-secondary/20 flex items-center justify-center mb-3 md:mb-4"
                >
                  <Clock className="text-support" size={20} />
                </motion.div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  Sin Expiración
                </h4>
                <p className="font-paragraph text-xs md:text-sm text-muted-text">
                  Úsalos cuando quieras sin prisa
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-secondary/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-3 md:mb-4"
                >
                  <TrendingUp className="text-secondary" size={20} />
                </motion.div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  Compra Flexible
                </h4>
                <p className="font-paragraph text-xs md:text-sm text-muted-text">
                  Adquiere en cualquier momento
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-support/20 rounded-2xl md:rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 border border-accent/20 shadow-lg group-hover:shadow-2xl transition-all">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-accent/20 to-support/20 flex items-center justify-center mb-3 md:mb-4"
                >
                  <Shield className="text-accent" size={20} />
                </motion.div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  Pago Seguro
                </h4>
                <p className="font-paragraph text-xs md:text-sm text-muted-text">
                  Encriptación bancaria
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative overflow-hidden rounded-2xl md:rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-accent/10 to-support/10 rounded-2xl md:rounded-3xl blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-10 border border-border/50 shadow-lg">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">
              Preguntas Frecuentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  ¿Puedo cambiar de plan?
                </h4>
                <p className="font-paragraph text-sm md:text-base text-muted-text">
                  Sí, compra cualquier plan en cualquier momento. Los piquetes se acumulan.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  ¿Hay límite de piquetes?
                </h4>
                <p className="font-paragraph text-sm md:text-base text-muted-text">
                  No hay límite. Acumula tantos como necesites.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  ¿Qué pasa si no los uso?
                </h4>
                <p className="font-paragraph text-sm md:text-base text-muted-text">
                  No expiran. Úsalos cuando lo necesites.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
                  ¿Hay descuentos?
                </h4>
                <p className="font-paragraph text-sm md:text-base text-muted-text">
                  Sí, planes mayores ofrecen mejor precio.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
