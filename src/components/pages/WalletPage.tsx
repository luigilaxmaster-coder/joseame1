import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, ShoppingCart, DollarSign, Calendar } from 'lucide-react';

export default function WalletPage() {
  const [balance] = useState(0);
  const [freeQuotaBalance] = useState(5);
  const [piquetesBalance] = useState(5);

  const transactions = [
    { id: '1', type: 'credit', amount: 5000, description: 'Pago por trabajo completado', date: '2025-01-15' },
    { id: '2', type: 'debit', amount: 150, description: 'Compra de paquete de piquetes', date: '2025-01-14' },
    { id: '3', type: 'credit', amount: 3500, description: 'Pago por trabajo completado', date: '2025-01-12' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0fbf8] to-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-4 md:px-6 py-3 md:py-4">
          <Link to="/joseador/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-secondary transition-colors font-paragraph font-semibold group">
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={18} className="group-hover:text-secondary transition-colors" />
            </motion.div>
            <span className="text-sm md:text-base">Volver</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[120rem] mx-auto px-4 md:px-6 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
              <Wallet className="text-white" size={20} />
            </div>
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground">
              Mi Wallet
            </h1>
          </div>

          {/* Balance Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
            {/* Main Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-secondary via-accent to-support rounded-2xl p-4 md:p-6 text-white shadow-lg"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Wallet size={22} className="md:size-28" />
                <h3 className="font-heading text-sm md:text-lg font-semibold">Balance Total</h3>
              </div>
              <p className="font-heading text-3xl md:text-4xl font-bold mb-1 md:mb-2">
                RD$ {balance.toLocaleString()}
              </p>
              <p className="font-paragraph text-white/80 text-xs md:text-sm">Disponible para retiro</p>
            </motion.div>

            {/* Free Quota Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-4 md:p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <TrendingUp size={20} className="md:size-28 text-accent" />
                <h3 className="font-heading text-sm md:text-lg font-semibold text-foreground">Piquetes Gratis</h3>
              </div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                {freeQuotaBalance}
              </p>
              <p className="font-paragraph text-muted-text text-xs md:text-sm">Aplicaciones gratuitas</p>
            </motion.div>

            {/* Purchased Piquetes Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-4 md:p-6 border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <ShoppingCart size={20} className="md:size-28 text-secondary" />
                <h3 className="font-heading text-sm md:text-lg font-semibold text-foreground">Piquetes Comprados</h3>
              </div>
              <p className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">
                {piquetesBalance}
              </p>
              <p className="font-paragraph text-muted-text text-xs md:text-sm">Aplicaciones disponibles</p>
            </motion.div>
          </div>

          {/* Actions - Compact Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
            <Link to="/joseador/buy-piquetes">
              <motion.div
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl p-4 md:p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer h-full"
              >
                <ShoppingCart size={24} className="md:size-32 text-secondary mb-2 md:mb-3" />
                <h3 className="font-heading text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                  Comprar Piquetes
                </h3>
                <p className="font-paragraph text-muted-text text-xs md:text-sm line-clamp-2">
                  Adquiere paquetes de aplicaciones
                </p>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl p-4 md:p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer h-full"
            >
              <DollarSign size={24} className="md:size-32 text-accent mb-2 md:mb-3" />
              <h3 className="font-heading text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">
                Retirar Fondos
              </h3>
              <p className="font-paragraph text-muted-text text-xs md:text-sm line-clamp-2">
                Transfiere tu balance a tu cuenta
              </p>
            </motion.div>
          </div>

          {/* Transaction History - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl p-4 md:p-8 border border-border shadow-lg"
          >
            <h2 className="font-heading text-lg md:text-2xl font-bold text-foreground mb-3 md:mb-6">
              Historial de Transacciones
            </h2>
            <div className="space-y-2 md:space-y-4 max-h-[300px] md:max-h-none overflow-y-auto">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-background/50 to-background rounded-xl hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'credit' 
                        ? 'bg-accent/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp size={18} className="md:size-24 text-accent" />
                      ) : (
                        <ShoppingCart size={18} className="md:size-24 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-foreground text-sm md:text-base truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-1 md:gap-2 text-muted-text text-xs md:text-sm">
                        <Calendar size={12} className="md:size-14 flex-shrink-0" />
                        <span className="font-paragraph">
                          {new Date(transaction.date).toLocaleDateString('es-DO')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-heading text-sm md:text-xl font-bold flex-shrink-0 ml-2 ${
                    transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}RD$ {transaction.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
