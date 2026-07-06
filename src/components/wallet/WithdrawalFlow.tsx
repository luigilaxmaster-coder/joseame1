import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { WithdrawalService, BankAccountService, WalletService } from '@/lib/wallet-service';
import { ArrowLeft, Plus, Check, AlertCircle, Loader, DollarSign, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = 'amount' | 'bank-account' | 'review' | 'confirmation';

export default function WithdrawalFlow() {
  const navigate = useNavigate();
  const { member } = useMember();
  const [step, setStep] = useState<Step>('amount');
  const [wallet, setWallet] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawal, setWithdrawal] = useState<any>(null);
  const [showNewBankForm, setShowNewBankForm] = useState(false);
  const [newBankData, setNewBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    identificationNumber: '',
    accountType: 'Checking',
  });

  useEffect(() => {
    loadData();
  }, [member?.profile?.nickname]);

  const loadData = async () => {
    if (!member?.profile?.nickname) return;

    try {
      setIsLoading(true);
      const walletData = await WalletService.getWallet(member.profile.nickname);
      setWallet(walletData);

      const accounts = await BankAccountService.getUserBankAccounts(member.profile.nickname);
      setBankAccounts(accounts);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!member?.profile?.nickname) return;

    try {
      setIsLoading(true);
      setError(null);

      const newAccount = await BankAccountService.addBankAccount(
        member.profile.nickname,
        newBankData.bankName,
        newBankData.accountNumber,
        newBankData.accountHolderName,
        newBankData.identificationNumber,
        newBankData.accountType
      );

      setBankAccounts([...bankAccounts, newAccount]);
      setSelectedBankAccount(newAccount._id);
      setShowNewBankForm(false);
      setNewBankData({
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        identificationNumber: '',
        accountType: 'Checking',
      });
    } catch (err: any) {
      setError(err.message || 'Error adding bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToReview = () => {
    const amount = parseFloat(withdrawalAmount);

    if (!amount || amount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (!wallet || amount > wallet.totalBalance) {
      setError('Saldo insuficiente');
      return;
    }

    if (!selectedBankAccount) {
      setError('Selecciona una cuenta bancaria');
      return;
    }

    setStep('review');
  };

  const handleConfirmWithdrawal = async () => {
    if (!member?.profile?.nickname || !selectedBankAccount) return;

    try {
      setIsLoading(true);
      setError(null);

      const amount = parseFloat(withdrawalAmount);
      const newWithdrawal = await WithdrawalService.createWithdrawalRequest(
        member.profile.nickname,
        amount,
        selectedBankAccount
      );

      setWithdrawal(newWithdrawal);
      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Error creating withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/joseador/wallet');
  };

  if (isLoading && !wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-secondary" size={32} />
      </div>
    );
  }

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
          {/* Step 1: Amount */}
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Retirar Fondos</h1>
                <p className="font-paragraph text-muted-text">Transfiere dinero a tu cuenta bancaria</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-6"
              >
                <div className="space-y-6">
                  {/* Current Balance */}
                  <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl p-6 border-2 border-secondary/20">
                    <p className="font-paragraph text-sm text-muted-text mb-2">Balance Disponible</p>
                    <p className="font-heading text-4xl font-bold text-secondary">
                      RD$ {wallet?.totalBalance?.toLocaleString() || '0'}
                    </p>
                  </div>

                  {/* Withdrawal Amount */}
                  <div>
                    <label className="font-heading text-sm font-bold text-foreground mb-3 block">
                      Monto a Retirar (RD$)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-text" size={20} />
                      <input
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => {
                          setWithdrawalAmount(e.target.value);
                          setError(null);
                        }}
                        placeholder="0"
                        className="w-full pl-12 pr-4 py-4 border-2 border-secondary/30 rounded-2xl font-paragraph text-lg focus:outline-none focus:border-secondary transition-all"
                      />
                    </div>
                    <p className="font-paragraph text-xs text-muted-text mt-2">
                      Mínimo: RD$ 500 | Máximo: RD$ {wallet?.totalBalance?.toLocaleString() || '0'}
                    </p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <p className="font-paragraph text-xs text-muted-text mb-3">Montos rápidos:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[5000, 10000, 25000, 50000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            if (wallet && amount <= wallet.totalBalance) {
                              setWithdrawalAmount(amount.toString());
                              setError(null);
                            }
                          }}
                          disabled={!wallet || amount > wallet.totalBalance}
                          className="py-2 px-3 rounded-lg font-heading font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-secondary/10 hover:bg-secondary/20 text-secondary"
                        >
                          RD$ {(amount / 1000).toFixed(0)}K
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <p className="font-paragraph text-sm text-blue-900">
                      ℹ️ Los retiros se procesan en 1-3 días hábiles a tu cuenta bancaria registrada.
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

              <Button
                onClick={() => setStep('bank-account')}
                disabled={!withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
                className="w-full bg-gradient-to-r from-secondary to-accent text-white py-3 text-lg"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Step 2: Bank Account */}
          {step === 'bank-account' && (
            <motion.div
              key="bank-account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Cuenta Bancaria</h2>
                <p className="font-paragraph text-muted-text">Selecciona o agrega una cuenta para el retiro</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-6"
              >
                <div className="space-y-4 mb-6">
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((account) => (
                      <motion.div
                        key={account._id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedBankAccount(account._id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedBankAccount === account._id
                            ? 'border-secondary bg-secondary/10'
                            : 'border-border/50 hover:border-secondary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <Building2 className="text-secondary" size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-heading font-semibold text-foreground">{account.bankName}</p>
                            <p className="font-paragraph text-sm text-muted-text">
                              {account.accountHolderName}
                            </p>
                            <p className="font-paragraph text-xs text-muted-text mt-1">
                              Cuenta: ****{account.accountNumber.slice(-4)}
                            </p>
                          </div>
                          {selectedBankAccount === account._id && (
                            <Check className="text-secondary flex-shrink-0" size={20} />
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="font-paragraph text-muted-text">No tienes cuentas bancarias registradas</p>
                    </div>
                  )}
                </div>

                {/* Add New Bank Account */}
                {!showNewBankForm ? (
                  <button
                    onClick={() => setShowNewBankForm(true)}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-secondary/30 hover:border-secondary/50 transition-all flex items-center justify-center gap-2 text-secondary font-heading font-semibold"
                  >
                    <Plus size={20} />
                    Agregar Nueva Cuenta
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 bg-secondary/5 rounded-2xl border-2 border-secondary/20"
                  >
                    <div>
                      <label className="font-heading text-sm font-bold text-foreground mb-2 block">
                        Banco
                      </label>
                      <input
                        type="text"
                        value={newBankData.bankName}
                        onChange={(e) => setNewBankData({ ...newBankData, bankName: e.target.value })}
                        placeholder="Ej: Banco Popular"
                        className="w-full px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="font-heading text-sm font-bold text-foreground mb-2 block">
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        value={newBankData.accountNumber}
                        onChange={(e) => setNewBankData({ ...newBankData, accountNumber: e.target.value })}
                        placeholder="Ej: 1234567890"
                        className="w-full px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="font-heading text-sm font-bold text-foreground mb-2 block">
                        Titular de la Cuenta
                      </label>
                      <input
                        type="text"
                        value={newBankData.accountHolderName}
                        onChange={(e) => setNewBankData({ ...newBankData, accountHolderName: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="w-full px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div>
                      <label className="font-heading text-sm font-bold text-foreground mb-2 block">
                        Cédula/Identificación
                      </label>
                      <input
                        type="text"
                        value={newBankData.identificationNumber}
                        onChange={(e) => setNewBankData({ ...newBankData, identificationNumber: e.target.value })}
                        placeholder="Ej: 001-1234567-8"
                        className="w-full px-4 py-2 border-2 border-secondary/30 rounded-lg font-paragraph focus:outline-none focus:border-secondary"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowNewBankForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddBankAccount}
                        disabled={isLoading || !newBankData.bankName || !newBankData.accountNumber}
                        className="flex-1 bg-secondary text-white"
                      >
                        {isLoading ? <Loader className="animate-spin" size={18} /> : 'Agregar'}
                      </Button>
                    </div>
                  </motion.div>
                )}
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
                  onClick={() => setStep('amount')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleProceedToReview}
                  disabled={!selectedBankAccount || isLoading}
                  className="flex-1 bg-gradient-to-r from-secondary to-accent text-white"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && selectedBankAccount && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">Revisar Retiro</h2>
                <p className="font-paragraph text-muted-text">Confirma los detalles antes de proceder</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 border-2 border-border/50 shadow-xl mb-6"
              >
                <div className="space-y-6">
                  {/* Amount */}
                  <div className="pb-6 border-b border-border/50">
                    <p className="font-paragraph text-sm text-muted-text mb-2">Monto a Retirar</p>
                    <p className="font-heading text-4xl font-bold text-secondary">
                      RD$ {parseFloat(withdrawalAmount).toLocaleString()}
                    </p>
                  </div>

                  {/* Bank Account */}
                  <div className="pb-6 border-b border-border/50">
                    <p className="font-paragraph text-sm text-muted-text mb-3">Cuenta Bancaria</p>
                    {bankAccounts.find(a => a._id === selectedBankAccount) && (
                      <div className="p-4 bg-secondary/5 rounded-2xl border-2 border-secondary/20">
                        <p className="font-heading font-semibold text-foreground">
                          {bankAccounts.find(a => a._id === selectedBankAccount)?.bankName}
                        </p>
                        <p className="font-paragraph text-sm text-muted-text mt-1">
                          {bankAccounts.find(a => a._id === selectedBankAccount)?.accountHolderName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <p className="font-paragraph text-sm text-blue-900 font-semibold mb-2">
                      ℹ️ Información importante
                    </p>
                    <ul className="font-paragraph text-sm text-blue-900 space-y-1">
                      <li>• Tu solicitud será revisada por nuestro equipo</li>
                      <li>• El retiro se procesará en 1-3 días hábiles</li>
                      <li>• Recibirás una notificación cuando se complete</li>
                    </ul>
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
                  onClick={() => setStep('bank-account')}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button
                  onClick={handleConfirmWithdrawal}
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
                      Confirmar Retiro
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && withdrawal && (
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
                <h2 className="font-heading text-3xl font-bold text-foreground mb-2">¡Solicitud Enviada!</h2>
                <p className="font-paragraph text-muted-text text-lg">
                  Tu retiro está en revisión
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
                    <h3 className="font-heading text-lg font-bold text-foreground mb-4">Detalles de la Solicitud</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Monto</span>
                        <span className="font-heading font-semibold">RD$ {parseFloat(withdrawalAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Estado</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Pendiente
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-paragraph text-foreground">Referencia</span>
                        <span className="font-heading font-mono text-sm">{withdrawal._id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
                    <p className="font-paragraph text-sm text-foreground font-semibold mb-2">
                      ✓ Solicitud registrada correctamente
                    </p>
                    <p className="font-paragraph text-sm text-foreground">
                      Recibirás una notificación cuando se apruebe y procese tu retiro.
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
