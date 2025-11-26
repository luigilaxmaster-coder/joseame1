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

  const handlePurchase = () => {
    if (selectedPackage) {
      navigate('/checkout', { state: { packageId: selectedPackage } });
    }
  };

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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
              Comprar Piquetes
            </h1>
            <p className="font-paragraph text-lg text-muted-text">
              Elige el paquete que mejor se adapte a tus necesidades
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPackage(pkg._id)}
                className={`bg-white rounded-2xl p-8 border-2 cursor-pointer transition-all ${
                  selectedPackage === pkg._id
                    ? 'border-secondary shadow-xl'
                    : 'border-border shadow-sm hover:shadow-lg'
                }`}
              >
                {pkg.packageImage && (
                  <div className="w-full h-32 mb-6 rounded-xl overflow-hidden bg-background">
                    <Image src={pkg.packageImage} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
                    {pkg.name}
                  </h3>
                  <p className="font-paragraph text-muted-text mb-4">
                    {pkg.description}
                  </p>
                  <div className="mb-4">
                    <span className="font-heading text-5xl font-bold text-secondary">
                      {pkg.credits}
                    </span>
                    <span className="font-paragraph text-muted-text ml-2">piquetes</span>
                  </div>
                  <div className="mb-6">
                    <span className="font-heading text-3xl font-bold text-foreground">
                      RD$ {pkg.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Check size={20} className="text-accent" />
                    <span className="font-paragraph">{pkg.credits} aplicaciones a trabajos</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Check size={20} className="text-accent" />
                    <span className="font-paragraph">Sin fecha de expiración</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Check size={20} className="text-accent" />
                    <span className="font-paragraph">Soporte prioritario</span>
                  </div>
                </div>

                {selectedPackage === pkg._id && (
                  <div className="flex items-center justify-center gap-2 text-secondary font-paragraph font-semibold">
                    <Check size={20} />
                    <span>Seleccionado</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Purchase Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: selectedPackage ? 1.05 : 1 }}
              whileTap={{ scale: selectedPackage ? 0.95 : 1 }}
              onClick={handlePurchase}
              disabled={!selectedPackage}
              className={`px-12 py-5 font-heading text-lg font-semibold rounded-xl transition-all ${
                selectedPackage
                  ? 'bg-gradient-to-r from-secondary via-accent to-support text-white shadow-lg hover:shadow-xl cursor-pointer'
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
          <div className="mt-16 bg-gradient-to-r from-secondary/10 via-accent/10 to-support/10 rounded-2xl p-8">
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
