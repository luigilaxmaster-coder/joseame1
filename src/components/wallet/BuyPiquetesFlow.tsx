import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BaseCrudService } from '@/integrations';
import { PiquetePackages } from '@/entities';
import { useMember } from '@/integrations';
import { PiqueteOrderService, WalletService, PIQUETE_VALUE_RD, CURRENCY } from '@/lib/wallet-service';
import { ArrowLeft, ShoppingCart, Check, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = 'packages' | 'checkout' | 'payment' | 'confirmation';

export default function BuyPiquetesFlow() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [step, setStep] = useState<Step>('packages');
  const [packages, setPackages] = useState<PiquetePackages[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PiquetePackages | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    loadPackages();
    loadWallet();
  }, [member?.profile?.nickname]);

  const loadPackages = async () => {
    try {
      const { items } = await BaseCrudService.getAll<PiquetePackages>('piquetepackages');
      const activePackages = items.filter(pkg => pkg.isActive);
      setPackages(activePackages);
    } catch (err) {
      setError('Error loading packages');
      console.error(err);
    }
  };

  const loadWallet = async () => {
    if (!member?.profile?.nickname) return;
    try {
      const walletData = await WalletService.getOrCreateWallet(member.profile.nickname);
      setWallet(walletData);
    } catch (err) {
      console.error('Error loading wallet:', err);
    }
  };

  const handleSelectPackage = (pkg: PiquetePackages) => {
    setSelectedPackage(pkg);
    setStep('checkout');
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackage || !member?.profile?.nickname) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create order
      const newOrder = await PiqueteOrderService.createOrder(
        member.profile.nickname,
        selectedPackage._id!,
        selectedPackage.price!
      );

      setOrder(newOrder);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Error creating order');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockPayment = async () => {
    if (!order || !member?.profile?.nickname || !selectedPackage) return;

    try {
      setIsLoading(true);
      setError(null);

      // Complete payment
      await PiqueteOrderService.completePayment(order._id);

      // Add piquetes to wallet
      const piqueteCount = selectedPackage.credits || 0;
      await WalletService.addPiquetes(
        member.profile.nickname,
        piqueteCount,
        selectedPackage.price || 0,
        `Purchase of ${selectedPackage.name} package`
      );

      // Reload wallet
      await loadWallet();

      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Error processing payment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPackages = () => {
    setSelectedPackage(null);
    setOrder(null);
    setError(null);
    setStep('packages');
  };

  const handleFinish = () => {
    navigate('/joseador/wallet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-4">
          <button
            onClick={() => navigate('/joseador/wallet')}
            className="inline-flex items-center gap-2 text-muted-text hover:text-secondary transition-colors font-paragraph font-semibold group"
          >
            <motion.div whileHover={{ x: -4 }}>
              <ArrowLeft size={20} />
            </motion.div>
            <span className="hidden sm:inline">Volver al Wallet</span>
            <span className="sm:hidden">Volver</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100rem] mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Package */}
          {step === 'packages' && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <h1 className="font-heading text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary via-accent to-support bg-clip-text text-transparent mb-4">
                  Comprar Piquetes
                </h1>
                <p className="font-paragraph text-muted-text text-lg">
                  Elige el plan perfecto para potenciar tu negocio
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {packages.map((pkg) => (
                  <motion.div
                    key={pkg._id}
                    whileHover={{ y: -8 }}
                    onClick={() => handleSelectPackage(pkg)}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative bg-gradient-to-br from-secondary to-accent p-6 text-white h-full flex flex-col">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -ml-12 -mb-12" />

                      <div className="relative z-10">
                        <h3 className="font-heading text-2xl font-bold mb-2">{pkg.name}</h3>
                        <p className="font-paragraph text-white/80 text-sm mb-4">{pkg.description}</p>

                        <div className="bg-white/20 rounded-2xl px-4 py-3 mb-6 text-center">
                          <div className="font-heading text-3xl font-bold">RD$ {pkg.price?.toLocaleString()}</div>
                          <div className="font-heading text-lg font-bold mt-1">{pkg.credits} piquetes</div>
                        </div>

                        <Button
                          className="w-full bg-white text-secondary hover:bg-white/90 font-heading font-semibold"
                          onClick={() => handleSelectPackage(pkg)}
                        >
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Checkout Review */}
          {step === 'checkout' && selectedPackage && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Revisar Compra</h2>
                <p className="font-paragraph text-muted-text">Confirma los detalles antes de proceder</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-6"
              >
                <div className="space-y-6">
                  {/* Package Details */}
                  <div className="pb-6 border-b border-border/50">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Paquete Seleccionado</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading font-semibold text-foreground">{selectedPackage.name}</p>
                        <p className="font-paragraph text-muted-text text-sm">{selectedPackage.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl font-bold text-secondary">
                          {selectedPackage.credits} piquetes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="pb-6 border-b border-border/50">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Desglose de Precio</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Precio unitario</span>
                        <span className="font-heading font-semibold">
                          RD$ {(selectedPackage.price! / selectedPackage.credits!).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Cantidad</span>
                        <span className="font-heading font-semibold">{selectedPackage.credits} piquetes</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-border/50">
                        <span className="font-heading font-bold text-foreground">Total</span>
                        <span className="font-heading text-2xl font-bold text-secondary">
                          RD$ {selectedPackage.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                    <p className="font-paragraph text-sm text-foreground">
                      ✓ Los piquetes se agregarán inmediatamente a tu wallet
                    </p>
                    <p className="font-paragraph text-sm text-foreground mt-2">
                      ✓ Sin expiración - úsalos cuando lo necesites
                    </p>
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 mb-6 flex items-start gap-3"
                >
                  <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
                  <p className="font-paragraph text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToPackages}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-secondary to-accent text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} className="mr-2" />
                      Proceder al Pago
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Mock Payment */}
          {step === 'payment' && order && selectedPackage && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Procesar Pago</h2>
                <p className="font-paragraph text-muted-text">Modo desarrollo - Pago simulado</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-6"
              >
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div className="pb-6 border-b border-border/50">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Método de Pago</h3>
                    <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-2xl p-6 border-2 border-secondary/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <ShoppingCart className="text-secondary" size={24} />
                        </div>
                        <div>
                          <p className="font-heading font-semibold text-foreground">Pago Simulado (Dev Mode)</p>
                          <p className="font-paragraph text-sm text-muted-text">
                            Este es un pago de prueba. En producción usaremos Stripe.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="pb-6 border-b border-border/50">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Resumen del Pedido</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">{selectedPackage.name}</span>
                        <span className="font-heading font-semibold">RD$ {selectedPackage.price?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-border/50">
                        <span className="font-heading font-bold text-foreground">Total a Pagar</span>
                        <span className="font-heading text-2xl font-bold text-secondary">
                          RD$ {selectedPackage.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <p className="font-paragraph text-sm text-blue-900">
                      ℹ️ En modo desarrollo, el pago se simula instantáneamente. Los piquetes se agregarán a tu wallet.
                    </p>
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 mb-6 flex items-start gap-3"
                >
                  <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
                  <p className="font-paragraph text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleBackToPackages}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleMockPayment}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-secondary to-accent text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" />
                      Confirmar Pago (Mock)
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && selectedPackage && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="flex justify-center mb-8"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-support flex items-center justify-center">
                  <Check className="text-white" size={40} />
                </div>
              </motion.div>

              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">¡Compra Exitosa!</h2>
                <p className="font-paragraph text-muted-text text-lg">
                  Tus piquetes han sido agregados a tu wallet
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-8"
              >
                <div className="space-y-6">
                  <div className="pb-6 border-b border-border/50">
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Detalles de la Compra</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Paquete</span>
                        <span className="font-heading font-semibold">{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Piquetes Agregados</span>
                        <span className="font-heading font-semibold text-accent">{selectedPackage.credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Monto Pagado</span>
                        <span className="font-heading font-semibold">RD$ {selectedPackage.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                    <p className="font-paragraph text-sm text-foreground font-semibold mb-2">
                      ✓ Pago procesado correctamente
                    </p>
                    <p className="font-paragraph text-sm text-foreground">
                      Puedes usar tus piquetes inmediatamente para aplicar a trabajos.
                    </p>
                  </div>
                </div>
              </motion.div>

              <Button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-secondary to-accent text-white py-3 text-lg"
              >
                Ir a Mi Wallet
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
