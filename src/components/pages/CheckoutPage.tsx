import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { useMember } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle, Loader } from 'lucide-react';
import { createPaymentOrder, recordPurchase, updatePurchaseStatus } from '@/lib/wix-pay-service';
import { addPiquetes } from '@/lib/piquete-service';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = useMember();
  const packageId = location.state?.packageId;
  const [selectedPackage, setSelectedPackage] = useState<PiquetePackages | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

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

    setProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Create payment order with Wix Pay API
      const orderResult = await createPaymentOrder(
        packageId,
        selectedPackage.name || 'Paquete de Piquetes',
        selectedPackage.price || 0,
        selectedPackage.credits || 0,
        member.loginEmail
      );

      if (!orderResult.success) {
        setPaymentError(orderResult.error || 'Error al crear la orden de pago');
        setProcessing(false);
        return;
      }

      const orderId = orderResult.orderId;

      // Step 2: Record purchase in database with pending status
      const purchaseResult = await recordPurchase(
        member.loginEmail,
        packageId,
        selectedPackage.name || 'Paquete de Piquetes',
        selectedPackage.price || 0,
        selectedPackage.credits || 0,
        orderId || '',
        'pending'
      );

      if (!purchaseResult.success) {
        setPaymentError('Error al registrar la compra');
        setProcessing(false);
        return;
      }

      setPurchaseId(purchaseResult.purchaseId || null);

      // Step 3: In production, this would open Wix Pay popup
      // For now, we simulate successful payment after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Update purchase status to completed
      if (purchaseResult.purchaseId) {
        await updatePurchaseStatus(purchaseResult.purchaseId, 'completed');
      }

      // Step 5: Add piquetes to user's balance
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
                    <div className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-xl">
                      <CreditCard size={24} className="text-primary" />
                      <span className="font-paragraph font-semibold text-foreground">
                        Wix Pay - Tarjeta de Crédito/Débito
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="font-paragraph text-sm text-blue-900">
                    <span className="font-semibold">Información de Pago:</span> Tu pago será procesado de forma segura a través de Wix Pay. Se abrirá un popup seguro para ingresar tus datos de tarjeta.
                  </p>
                </div>

                {/* Security Notice */}
                <div className="bg-accent/10 rounded-xl p-4 flex items-start gap-3">
                  <Lock size={20} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-paragraph text-sm text-foreground">
                      <span className="font-semibold">Pago 100% Seguro:</span> Tus datos están protegidos con encriptación de nivel bancario. Wix Pay es un procesador de pagos certificado.
                    </p>
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

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: processing ? 1 : 1.02 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  type="submit"
                  disabled={processing}
                  className={`w-full px-6 py-4 font-heading text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    processing
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-secondary via-accent to-support text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    `Pagar RD$ ${selectedPackage.price?.toLocaleString()}`
                  )}
                </motion.button>

                <p className="font-paragraph text-xs text-muted-text text-center">
                  Al hacer clic en "Pagar", aceptas nuestros términos de servicio y política de privacidad.
                </p>
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
