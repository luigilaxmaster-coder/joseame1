import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Zap, DollarSign, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { WalletService, LedgerTransaction, PIQUETE_VALUE_RD } from '@/lib/wallet-service';
import { useMember } from '@/integrations';

export default function WalletOverview() {
  const { member } = useMember();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, [member?.profile?.nickname]);

  const loadWalletData = async () => {
    if (!member?.profile?.nickname) return;

    try {
      setIsLoading(true);
      const walletData = await WalletService.getOrCreateWallet(member.profile.nickname);
      setWallet(walletData);

      const txHistory = await WalletService.getTransactionHistory(member.profile.nickname, 10);
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <Wallet className="text-secondary" size={32} />
        </div>
      </div>
    );
  }

  const totalPiquetes = wallet.freePiquetesBalance + wallet.purchasedPiquetesBalance;

  return (
    <div className="space-y-6">
      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-secondary via-accent to-support"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <span className="font-paragraph text-sm font-semibold">Balance Total</span>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">Disponible</span>
            </div>
            <p className="font-heading text-4xl font-bold mb-2">
              RD$ {wallet.totalBalance.toLocaleString()}
            </p>
            <p className="font-paragraph text-white/80 text-sm">Listo para retirar</p>
          </div>
        </motion.div>

        {/* Purchased Piquetes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-3xl p-6 border-2 border-secondary/30 shadow-lg bg-gradient-to-br from-white to-[#f5f8fb]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -mr-10 -mt-10" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-secondary" />
                </div>
                <span className="font-paragraph text-sm font-semibold text-foreground">Piquetes Comprados</span>
              </div>
              <span className="px-2 py-1 bg-secondary/10 rounded-full text-xs font-bold text-secondary">Activos</span>
            </div>
            <p className="font-heading text-4xl font-bold text-secondary mb-2">
              {wallet.purchasedPiquetesBalance}
            </p>
            <p className="font-paragraph text-muted-text text-sm">
              RD$ {(wallet.purchasedPiquetesBalance * PIQUETE_VALUE_RD).toLocaleString()} valor
            </p>
          </div>
        </motion.div>

        {/* Free Piquetes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="relative overflow-hidden rounded-3xl p-6 border-2 border-accent/30 shadow-lg bg-gradient-to-br from-white to-[#f0fbf8]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Zap size={20} className="text-accent" />
                </div>
                <span className="font-paragraph text-sm font-semibold text-foreground">Piquetes Gratis</span>
              </div>
              <span className="px-2 py-1 bg-accent/10 rounded-full text-xs font-bold text-accent">Gratis</span>
            </div>
            <p className="font-heading text-4xl font-bold text-accent mb-2">
              {wallet.freePiquetesBalance}
            </p>
            <p className="font-paragraph text-muted-text text-sm">Aplicaciones sin costo</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-3xl p-6 border-2 border-border/50 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-foreground">Transacciones Recientes</h3>
          <span className="px-3 py-1 bg-accent/10 rounded-full text-xs font-semibold text-accent">
            {transactions.length} movimientos
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(113, 210, 97, 0.05)' }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-background/30 to-background/10 rounded-2xl border border-border/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.transactionType === 'credit'
                        ? 'bg-accent/20'
                        : 'bg-destructive/20'
                    }`}
                  >
                    {tx.transactionType === 'credit' ? (
                      <ArrowUpRight size={18} className="text-accent" />
                    ) : (
                      <ArrowDownLeft size={18} className="text-destructive" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-foreground text-sm truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1 text-muted-text text-xs">
                      <Clock size={12} />
                      <span className="font-paragraph">
                        {new Date(tx.transactionTimestamp || 0).toLocaleDateString('es-DO')}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`font-heading text-lg font-bold flex-shrink-0 ${
                    tx.transactionType === 'credit' ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {tx.transactionType === 'credit' ? '+' : '-'}RD$ {tx.amount.toLocaleString()}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="font-paragraph text-muted-text">No hay transacciones aún</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
