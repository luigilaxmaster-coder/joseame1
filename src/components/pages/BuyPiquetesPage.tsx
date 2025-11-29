import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, Check, ShoppingCart, Zap, TrendingUp, Clock, Shield, Percent, Calculator, Sparkles, Award, Flame, Crown, Rocket } from 'lucide-react';

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

  const calculatePiquetes = (budget: number) => {
    const baseCost = Math.max(1, Math.floor(budget / 1000));
    return baseCost;
  };

  const piquetesNeeded = calculatePiquetes(parseInt(budgetInput) || 0);

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfecto para comenzar',
      price: 500,
      credits: 10,
      gradient: 'from-blue-500 via-blue-400 to-cyan-400',
      bgGradient: 'from-blue-50 via-blue-100 to-cyan-50',
      accentColor: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-700',
      textColor: 'text-white',
      icon: Sparkles,
      features: ['10 piquetes', 'Sin expiración', 'Soporte básico'],
      bestFor: 'Nuevos joseadores',
      savings: null
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Para profesionales activos',
      price: 1200,
      credits: 30,
      gradient: 'from-purple-500 via-purple-400 to-pink-400',
      bgGradient: 'from-purple-50 via-purple-100 to-pink-50',
      accentColor: 'bg-purple-500',
      badgeColor: 'bg-purple-100 text-purple-700',
      textColor: 'text-white',
      icon: TrendingUp,
      features: ['30 piquetes', 'Sin expiración', 'Soporte prioritario'],
      bestFor: 'Profesionales activos',
      savings: '15%'
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'La mejor opción',
      price: 2400,
      credits: 75,
      gradient: 'from-amber-500 via-orange-400 to-red-400',
      bgGradient: 'from-amber-50 via-orange-100 to-red-50',
      accentColor: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-700',
      textColor: 'text-white',
      icon: Crown,
      featured: true,
      features: ['75 piquetes', 'Sin expiración', 'Soporte 24/7'],
      bestFor: 'Máxima productividad',
      savings: '25%'
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Para máximo crecimiento',
      price: 4500,
      credits: 200,
      gradient: 'from-emerald-500 via-green-400 to-teal-400',
      bgGradient: 'from-emerald-50 via-green-100 to-teal-50',
      accentColor: 'bg-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      textColor: 'text-white',
      icon: Rocket,
      features: ['200 piquetes', 'Sin expiración', 'Soporte VIP'],
      bestFor: 'Crecimiento acelerado',
      savings: '30%'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-lg">
        <div className="max-w-[120rem] mx-auto px-4 md:px-6 py-3 md:py-4">
          <Link to="/joseador/wallet" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-paragraph font-semibold group text-sm md:text-base">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={18} className="group-hover:text-white transition-colors" />
            </motion.div>
            <span>Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-[120rem] mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="text-yellow-400 drop-shadow-lg" size={32} />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              Comprar Piquetes
            </h1>
            <motion.div
              animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="text-cyan-400 drop-shadow-lg" size={32} />
            </motion.div>
          </div>
          <p className="font-paragraph text-base md:text-xl text-white/80 max-w-2xl mx-auto">
            Potencia tu negocio con piquetes y accede a más oportunidades de trabajo
          </p>
        </motion.div>

        {/* Calculator Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 md:mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
            <div className="relative backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-lg"
                >
                  <Calculator className="text-white" size={24} />
                </motion.div>
                <div>
                  <h2 className="font-heading text-xl md:text-3xl font-bold text-white">
                    Calculadora de Piquetes
                  </h2>
                  <p className="text-white/70 text-sm md:text-base">Descubre cuántos piquetes necesitas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label className="font-paragraph text-sm md:text-base font-bold text-white mb-3 block">
                    Presupuesto del Trabajo (RD$)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full px-4 md:px-6 py-3 md:py-4 border-2 border-white/30 rounded-2xl font-paragraph text-base md:text-lg focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all bg-white/10 text-white placeholder-white/50"
                      placeholder="5000"
                    />
                    <span className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 font-paragraph text-white/70 text-base md:text-lg font-semibold">
                      RD$
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="font-paragraph text-sm md:text-base font-bold text-white/80 mb-3">
                    Piquetes Necesarios
                  </p>
                  <motion.div
                    key={piquetesNeeded}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                    className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 md:p-8 border-2 border-white/30 shadow-xl"
                  >
                    <div className="font-heading text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                      {piquetesNeeded}
                    </div>
                    <p className="font-paragraph text-white/90 text-sm md:text-base mt-2 font-semibold">
                      piquetes necesarios
                    </p>
                  </motion.div>
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-16"
        >
          {pricingTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <motion.div
                key={tier.id}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                onClick={() => setSelectedPackage(tier.id)}
                className={`relative rounded-3xl overflow-hidden transition-all cursor-pointer group ${
                  tier.featured ? 'sm:col-span-2 lg:col-span-1 lg:scale-110 lg:z-20' : ''
                } ${
                  selectedPackage === tier.id
                    ? 'ring-4 ring-white/50 shadow-2xl'
                    : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                {/* Animated background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />

                {/* Featured Badge */}
                {tier.featured && (
                  <motion.div
                    initial={{ rotate: -45, x: 60 }}
                    animate={{ rotate: -45, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute -top-8 -right-8 w-32 h-32 overflow-hidden"
                  >
                    <div className="absolute top-2 right-[-30px] w-32 bg-gradient-to-r from-yellow-300 to-orange-400 text-slate-900 text-xs font-heading font-bold py-2 px-8 transform rotate-45 flex items-center justify-center shadow-xl">
                      ⭐ RECOMENDADO
                    </div>
                  </motion.div>
                )}

                {/* Savings Badge */}
                {tier.savings && !tier.featured && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`absolute top-4 right-4 ${tier.badgeColor} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                  >
                    Ahorra {tier.savings}
                  </motion.div>
                )}

                {/* Card Content */}
                <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
                  {/* Icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 md:mb-6 border border-white/30 shadow-lg"
                  >
                    <IconComponent size={28} className={tier.textColor} />
                  </motion.div>

                  {/* Title & Subtitle */}
                  <h3 className={`font-heading text-2xl md:text-3xl font-bold ${tier.textColor} mb-2`}>
                    {tier.name}
                  </h3>
                  <p className={`font-paragraph ${tier.textColor === 'text-white' ? 'text-white/80' : 'text-white/80'} text-sm md:text-base mb-1`}>
                    {tier.subtitle}
                  </p>
                  <p className={`font-paragraph text-xs md:text-sm ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-white/70'} mb-4 md:mb-6`}>
                    {tier.bestFor}
                  </p>

                  {/* Price Section */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-4 md:py-5 mb-4 md:mb-8 text-center border border-white/30 shadow-lg"
                  >
                    <div className={`font-heading text-2xl md:text-4xl font-bold ${tier.textColor} drop-shadow-lg`}>
                      RD$ {tier.price.toLocaleString()}
                    </div>
                    <div className={`font-paragraph text-xs md:text-sm ${tier.textColor === 'text-white' ? 'text-white/70' : 'text-white/70'} mt-1`}>
                      por compra
                    </div>
                    <div className={`font-heading text-lg md:text-2xl font-bold ${tier.textColor} mt-2 drop-shadow-lg`}>
                      {tier.credits} piquetes
                    </div>
                  </motion.div>

                  {/* Features */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-8 flex-grow">
                    {tier.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 + 0.2 }}
                        className="flex items-center gap-2 md:gap-3"
                      >
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 border border-white/50 shadow-md">
                          <Check size={14} className={tier.textColor} />
                        </div>
                        <span className={`font-paragraph ${tier.textColor} text-sm md:text-base font-medium`}>
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(tier.id)}
                    className={`w-full px-4 md:px-6 py-3 md:py-4 font-heading font-bold text-sm md:text-base rounded-xl md:rounded-2xl transition-all shadow-lg ${
                      tier.textColor === 'text-white'
                        ? 'bg-white text-slate-900 hover:bg-white/90 hover:shadow-xl'
                        : 'bg-white text-slate-900 hover:bg-white/90 hover:shadow-xl'
                    }`}
                  >
                    Comprar Ahora
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Purchase Button - Sticky */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 md:mb-16 sticky bottom-4 md:relative z-30 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent md:to-transparent pt-4 md:pt-0 -mx-4 md:mx-0 px-4 md:px-0 pb-4 md:pb-0"
        >
          <motion.button
            whileHover={{ scale: selectedPackage ? 1.06 : 1 }}
            whileTap={{ scale: selectedPackage ? 0.95 : 1 }}
            onClick={() => {
              if (selectedPackage) {
                handlePurchase(selectedPackage);
              }
            }}
            disabled={!selectedPackage}
            className={`w-full px-6 md:px-12 py-4 md:py-6 font-heading text-base md:text-lg font-bold rounded-2xl md:rounded-3xl transition-all flex items-center justify-center gap-3 md:gap-4 shadow-2xl ${
              selectedPackage
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:shadow-2xl cursor-pointer border-2 border-white/30'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <ShoppingCart size={22} />
            <span>Proceder al Pago</span>
          </motion.button>
        </motion.div>

        {/* Information Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-16"
        >
          {/* How Piquetes Work */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              <div className="relative backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <Zap className="text-white" size={24} />
                  </motion.div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                    ¿Cómo Funcionan?
                  </h3>
                </div>
                <div className="space-y-4 md:space-y-5">
                  {[
                    { num: '1', title: 'Costo de aplicación', desc: '1 piquete por cada 1000 RD$ (mínimo 1)' },
                    { num: '2', title: 'Ejemplo práctico', desc: 'Trabajo de RD$ 5000 = 5 piquetes' },
                    { num: '3', title: 'Ajuste por nivel', desc: 'Intermedio +25%, Experto +50%' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3 md:gap-4"
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm md:text-base shadow-lg">
                        {item.num}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm md:text-base">{item.title}</p>
                        <p className="text-white/70 text-xs md:text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div variants={itemVariants} className="group">
            <div className="relative overflow-hidden rounded-3xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
              <div className="relative backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl group-hover:shadow-2xl transition-all h-full">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <Percent className="text-white" size={24} />
                  </motion.div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-white">
                    Política de Reembolso
                  </h3>
                </div>
                <div className="space-y-4 md:space-y-5">
                  {[
                    { icon: '✓', title: 'Rechazado', desc: '100% de reembolso', color: 'from-green-400 to-emerald-400' },
                    { icon: '◐', title: 'Cliente cancela', desc: '50% de reembolso', color: 'from-yellow-400 to-orange-400' },
                    { icon: '✗', title: 'Trabajo completado', desc: '0% de reembolso', color: 'from-red-400 to-pink-400' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3 md:gap-4"
                    >
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm md:text-base shadow-lg`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm md:text-base">{item.title}</p>
                        <p className="text-white/70 text-xs md:text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16"
        >
          {[
            {
              icon: Clock,
              title: 'Sin Expiración',
              desc: 'Los piquetes no expiran, úsalos cuando quieras',
              gradient: 'from-blue-600 to-cyan-600',
              accentGradient: 'from-blue-400 to-cyan-400'
            },
            {
              icon: TrendingUp,
              title: 'Compra Flexible',
              desc: 'Adquiere más piquetes en cualquier momento',
              gradient: 'from-purple-600 to-pink-600',
              accentGradient: 'from-purple-400 to-pink-400'
            },
            {
              icon: Shield,
              title: 'Pago Seguro',
              desc: 'Transacciones protegidas con encriptación',
              gradient: 'from-emerald-600 to-teal-600',
              accentGradient: 'from-emerald-400 to-teal-400'
            }
          ].map((feature, idx) => {
            const FeatureIcon = feature.icon;
            return (
              <motion.div key={idx} variants={itemVariants} className="group">
                <div className="relative overflow-hidden rounded-3xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-80`} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                  <div className="relative backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl group-hover:shadow-2xl transition-all">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${feature.accentGradient} flex items-center justify-center mb-4 md:mb-6 shadow-lg`}
                    >
                      <FeatureIcon className="text-white" size={24} />
                    </motion.div>
                    <h4 className="font-heading text-lg md:text-xl font-bold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="font-paragraph text-sm md:text-base text-white/80">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
          <div className="relative backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/20 shadow-2xl">
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-8 md:mb-10">
              Preguntas Frecuentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[
                { q: '¿Puedo cambiar de plan?', a: 'Sí, puedes comprar cualquier plan en cualquier momento. Los piquetes se acumulan en tu cuenta.' },
                { q: '¿Hay límite de piquetes?', a: 'No hay límite. Puedes acumular tantos piquetes como necesites para tu negocio.' },
                { q: '¿Qué pasa si no uso mis piquetes?', a: 'Los piquetes no expiran. Puedes guardarlos y usarlos cuando lo necesites.' },
                { q: '¿Hay descuentos por volumen?', a: 'Sí, los planes mayores ofrecen mejor precio por piquete. Compara nuestros planes.' }
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 hover:border-white/40 transition-all"
                >
                  <h4 className="font-heading text-base md:text-lg font-bold text-white mb-2">
                    {faq.q}
                  </h4>
                  <p className="font-paragraph text-sm md:text-base text-white/80">
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
