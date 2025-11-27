import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function BuyPiquetesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PiquetePackages[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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

  // Pricing tiers configuration
  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Perfecto para comenzar',
      price: 500,
      credits: 10,
      gradient: 'from-primary to-primary/80',
      textColor: 'text-white',
      features: ['10 piquetes', 'Sin expiración', 'Soporte básico']
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Para profesionales activos',
      price: 1200,
      credits: 30,
      gradient: 'from-secondary to-secondary/80',
      textColor: 'text-white',
      features: ['30 piquetes', 'Sin expiración', 'Soporte prioritario']
    },
    {
      id: 'professional',
      name: 'Professional',
      subtitle: 'La mejor opción',
      price: 2400,
      credits: 75,
      gradient: 'from-accent to-accent/80',
      textColor: 'text-foreground',
      featured: true,
      features: ['75 piquetes', 'Sin expiración', 'Soporte 24/7']
    },
    {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Para máximo crecimiento',
      price: 4500,
      credits: 200,
      gradient: 'from-support to-support/80',
      textColor: 'text-white',
      features: ['200 piquetes', 'Sin expiración', 'Soporte VIP']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/joseador/wallet" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al Wallet</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Comprar Piquetes
            </h1>
            <p className="font-paragraph text-lg text-muted-text max-w-2xl mx-auto">
              Elige el plan perfecto para potenciar tu negocio y aplicar a más trabajos
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPackage(tier.id)}
                className={`relative rounded-[24px] overflow-hidden transition-all cursor-pointer ${
                  tier.featured ? 'lg:scale-105' : ''
                } ${
                  selectedPackage === tier.id
                    ? `ring-2 shadow-xl ${
                        tier.id === 'starter' ? 'ring-primary' :
                        tier.id === 'business' ? 'ring-secondary' :
                        tier.id === 'professional' ? 'ring-accent' :
                        'ring-support'
                      }`
                    : 'shadow-sm hover:shadow-lg'
                }`}
              >
                {/* Ribbon for Professional */}
                {tier.featured && (
                  <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
                    <div className="absolute top-2 right-[-35px] w-32 bg-accent text-foreground text-xs font-heading font-bold py-1 px-8 transform rotate-45 flex items-center justify-center">
                      RECOMENDADO
                    </div>
                  </div>
                )}

                <div className={`bg-gradient-to-br ${tier.gradient} p-8 h-full flex flex-col`}>
                  <h3 className={`font-heading text-2xl font-bold ${tier.textColor} mb-2`}>
                    {tier.name}
                  </h3>
                  <p className={`font-paragraph ${tier.textColor === 'text-white' ? 'text-white/80' : 'text-foreground/80'} text-sm mb-6`}>
                    {tier.subtitle}
                  </p>
                  
                  {/* Price Pill */}
                  <div className="bg-white rounded-full px-6 py-3 mb-8 text-center">
                    <div className="font-heading text-2xl font-bold text-foreground">
                      RD$ {tier.price.toLocaleString()}
                    </div>
                    <div className="font-paragraph text-xs text-muted-text">por compra</div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                          <Check size={16} className="text-white" />
                        </div>
                        <span className={`font-paragraph ${tier.textColor} text-sm`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePurchase(tier.id)}
                    className="w-full px-6 py-3 bg-foreground text-white font-heading font-semibold rounded-xl transition-all hover:bg-foreground/90"
                  >
                    Comprar piquetes
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Purchase Button */}
          <div className="text-center mb-16">
            <motion.button
              whileHover={{ scale: selectedPackage ? 1.05 : 1 }}
              whileTap={{ scale: selectedPackage ? 0.95 : 1 }}
              onClick={() => {
                if (selectedPackage) {
                  handlePurchase(selectedPackage);
                }
              }}
              disabled={!selectedPackage}
              className={`px-12 py-5 font-heading text-lg font-semibold rounded-xl transition-all ${
                selectedPackage
                  ? 'bg-foreground text-white shadow-lg hover:shadow-xl cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="inline-block mr-2" size={24} />
              Proceder al Pago
            </motion.button>
            <p className="font-paragraph text-sm text-muted-text mt-6">
              Pago seguro procesado por nuestra plataforma
            </p>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-r from-secondary/10 via-accent/10 to-support/10 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
              ¿Cómo funcionan los piquetes?
            </h2>
            <div className="space-y-3 font-paragraph text-foreground">
              <p>• Cada piquete te permite aplicar a un trabajo</p>
              <p>• Los piquetes no expiran, úsalos cuando quieras</p>
              <p>• Puedes comprar más piquetes en cualquier momento</p>
              <p>• Recibes 5 piquetes gratis al registrarte</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
