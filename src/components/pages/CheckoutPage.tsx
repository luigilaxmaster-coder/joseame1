import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import { addPiquetes } from '@/lib/piquete-service';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = useMember();
  const packageId = location.state?.packageId;
  const [selectedPackage, setSelectedPackage] = useState<PiquetePackages | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: ''
  });

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
    
    if (!selectedPackage || !member?.loginEmail) {
      setPaymentError('Información incompleta. Por favor intenta de nuevo.');
      return;
    }

    // Validate card data
    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvv || !cardData.cardholderName) {
      setPaymentError('Por favor completa todos los campos de la tarjeta.');
      return;
    }

    // Basic card validation
    if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      setPaymentError('Número de tarjeta inválido.');
      return;
    }

    if (cardData.cvv.length < 3) {
      setPaymentError('CVV inválido.');
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      // Simulate payment processing (in production, this would call a payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add piquetes to user's balance
      const addResult = await addPiquetes(
        member.loginEmail,
        selectedPackage.credits || 0,
        member.profile?.nickname || member.loginEmail
      );

      if (!addResult.success) {
        setPaymentError('Error al procesar la compra. Por favor intenta de nuevo.');
        setProcessing(false);
        return;
      }

      // Payment successful
      setPaymentSuccess(true);

      // Redirect to wallet after 2 seconds
      setTimeout(() => {
        navigate('/joseador/wallet', { state: { purchaseSuccess: true } });
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Error al procesar el pago. Por favor intenta de nuevo.');
      setProcessing(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-paragraph text-muted-text">Cargando...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-accent" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            ¡Compra Exitosa!
          </h1>
          <p className="font-paragraph text-lg text-muted-text mb-6">
            Se han agregado {selectedPackage.credits} piquetes a tu cuenta
          </p>
          <p className="font-paragraph text-sm text-muted-text">
            Redirigiendo a tu wallet...
          </p>
        </motion.div>
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
                      value={cardData.cardNumber}
                      onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
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
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
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
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
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
                      value={cardData.cardholderName}
                      onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl font-paragraph focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-sm text-red-700">{paymentError}</p>
                  </motion.div>
                )}

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
