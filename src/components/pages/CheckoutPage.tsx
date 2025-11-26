import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const packageId = location.state?.packageId;
  const [selectedPackage, setSelectedPackage] = useState<PiquetePackages | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  const loadPackage = async () => {
    if (!packageId) return;
    const pkg = await BaseCrudService.getById<PiquetePackages>('piquetepackages', packageId);
    setSelectedPackage(pkg);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      navigate('/joseador/wallet', { state: { purchaseSuccess: true } });
    }, 2000);
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-paragraph text-muted-text">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/joseador/buy-piquetes" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver</span>
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
          <h1 className="font-heading text-4xl font-bold text-foreground mb-8">
            Finalizar Compra
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="bg-white rounded-2xl p-8 border border-border shadow-lg space-y-6">
                {/* Payment Method */}
                <div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                    Método de Pago
                  </h3>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5"
                      />
                      <CreditCard size={24} className="text-primary" />
                      <span className="font-paragraph font-semibold text-foreground">
                        Tarjeta de Crédito/Débito
                      </span>
                    </label>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-4">
                  <div>
                    <label className="font-paragraph font-semibold text-foreground mb-2 block">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-paragraph font-semibold text-foreground mb-2 block">
                        Fecha de Expiración
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="font-paragraph font-semibold text-foreground mb-2 block">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-paragraph font-semibold text-foreground mb-2 block">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Juan Pérez"
                      className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-3">
                  <Lock size={20} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-paragraph text-sm text-foreground">
                      <span className="font-semibold">Pago 100% Seguro:</span> Tus datos están protegidos con encriptación de nivel bancario.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: processing ? 1 : 1.02 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  type="submit"
                  disabled={processing}
                  className={`w-full px-6 py-4 font-heading text-lg font-semibold rounded-xl transition-all ${
                    processing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-secondary via-accent to-support text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {processing ? 'Procesando...' : `Pagar RD$ ${selectedPackage.price?.toLocaleString()}`}
                </motion.button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-border shadow-lg sticky top-24">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-6">
                  Resumen del Pedido
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="font-paragraph text-muted-text">Paquete</span>
                    <span className="font-paragraph font-semibold text-foreground">
                      {selectedPackage.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="font-paragraph text-muted-text">Piquetes</span>
                    <span className="font-paragraph font-semibold text-foreground">
                      {selectedPackage.credits}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="font-paragraph text-muted-text">Subtotal</span>
                    <span className="font-paragraph font-semibold text-foreground">
                      RD$ {selectedPackage.price?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-lg font-bold text-foreground">Total</span>
                    <span className="font-heading text-2xl font-bold text-secondary">
                      RD$ {selectedPackage.price?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-accent">
                    <Check size={20} />
                    <span className="font-paragraph text-sm">Pago seguro y encriptado</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <Check size={20} />
                    <span className="font-paragraph text-sm">Piquetes sin expiración</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent">
                    <Check size={20} />
                    <span className="font-paragraph text-sm">Soporte 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
