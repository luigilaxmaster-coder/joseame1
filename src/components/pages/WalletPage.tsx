import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, ShoppingCart, DollarSign, Calendar, Zap, Award, Target, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import DashboardWithBottomTabs from '@/components/DashboardWithBottomTabs';
import { Button } from '@/components/ui/button';

function WalletContent() {
  const navigate = useNavigate();
  const [balance] = useState(0);
  const [freeQuotaBalance] = useState(5);
  const [piquetesBalance] = useState(5);

  const transactions = [
    { id: '1', type: 'credit', amount: 5000, description: 'Pago por trabajo completado', date: '2025-01-15' },
    { id: '2', type: 'debit', amount: 150, description: 'Compra de paquete de piquetes', date: '2025-01-14' },
    { id: '3', type: 'credit', amount: 3500, description: 'Pago por trabajo completado', date: '2025-01-12' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fbf8] via-background to-[#e8f5f1] pb-[90px]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-[120rem] mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/joseador/dashboard')}
              className="h-9 w-9 rounded-full hover:bg-accent/10"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Mi Wallet
            </h1>
          </div>
          <p className="font-paragraph text-muted-text text-sm ml-12">
            Gestiona tus fondos y piquetes
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[120rem] mx-auto px-4 md:px-6 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title Section */}
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-secondary via-accent to-support flex items-center justify-center flex-shrink-0 shadow-lg"
            >
              <Wallet className="text-white" size={24} />
            </motion.div>
            <div>
              <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground">
                Mi Wallet
              </h1>
              <p className="font-paragraph text-muted-text text-xs md:text-sm">Gestiona tus piquetes y fondos</p>
            </div>
          </div>

          {/* Balance Cards - Enhanced Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
            {/* Main Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(58, 182, 137, 0.2)' }}
              className="sm:col-span-2 lg:col-span-1 relative overflow-hidden rounded-3xl p-4 md:p-6 text-white shadow-xl"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-accent to-support opacity-100" />
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <h3 className="font-heading text-sm md:text-lg font-semibold">Balance Total</h3>
                  </div>
                  <div className="px-3 py-1 bg-white/20 rounded-full">
                    <span className="font-paragraph text-xs font-semibold text-white">Disponible</span>
                  </div>
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold mb-2 md:mb-3">
                  RD$ {balance.toLocaleString()}
                </p>
                <p className="font-paragraph text-white/80 text-xs md:text-sm">Listo para retirar a tu cuenta bancaria</p>
              </div>
            </motion.div>

            {/* Free Quota Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-3xl p-4 md:p-6 border-2 border-accent/30 shadow-lg bg-gradient-to-br from-white to-[#f0fbf8]"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full -mr-10 -mt-10" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Zap size={20} className="text-accent" />
                    </div>
                    <h3 className="font-heading text-sm md:text-lg font-semibold text-foreground">Piquetes Gratis</h3>
                  </div>
                  <span className="px-2 py-1 bg-accent/10 rounded-full">
                    <span className="font-paragraph text-xs font-bold text-accent">Gratis</span>
                  </span>
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-accent mb-2 md:mb-3">
                  {freeQuotaBalance}
                </p>
                <p className="font-paragraph text-muted-text text-xs md:text-sm">Aplicaciones sin costo</p>
              </div>
            </motion.div>

            {/* Purchased Piquetes Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="relative overflow-hidden rounded-3xl p-4 md:p-6 border-2 border-secondary/30 shadow-lg bg-gradient-to-br from-white to-[#f5f8fb]"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-full -mr-10 -mt-10" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <ShoppingCart size={20} className="text-secondary" />
                    </div>
                    <h3 className="font-heading text-sm md:text-lg font-semibold text-foreground">Piquetes Comprados</h3>
                  </div>
                  <span className="px-2 py-1 bg-secondary/10 rounded-full">
                    <span className="font-paragraph text-xs font-bold text-secondary">Activos</span>
                  </span>
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-secondary mb-2 md:mb-3">
                  {piquetesBalance}
                </p>
                <p className="font-paragraph text-muted-text text-xs md:text-sm">Listos para usar</p>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-3 md:p-4 border border-accent/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-accent" />
                <span className="font-paragraph text-xs text-muted-text">Total Ganado</span>
              </div>
              <p className="font-heading text-lg md:text-xl font-bold text-accent">RD$ 8,500</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-3 md:p-4 border border-secondary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-secondary" />
                <span className="font-paragraph text-xs text-muted-text">Trabajos</span>
              </div>
              <p className="font-heading text-lg md:text-xl font-bold text-secondary">12</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-support/10 to-support/5 rounded-2xl p-3 md:p-4 border border-support/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-support" />
                <span className="font-paragraph text-xs text-muted-text">Tasa Éxito</span>
              </div>
              <p className="font-heading text-lg md:text-xl font-bold text-support">95%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-3 md:p-4 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-primary" />
                <span className="font-paragraph text-xs text-muted-text">Gastado</span>
              </div>
              <p className="font-heading text-lg md:text-xl font-bold text-primary">RD$ 150</p>
            </motion.div>
          </div>

          {/* Actions - Enhanced Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
            <Link to="/joseador/buy-piquetes">
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(58, 182, 137, 0.15)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="relative overflow-hidden rounded-3xl p-4 md:p-6 cursor-pointer h-full bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20 shadow-lg"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full -mr-12 -mt-12" />
                <div className="relative z-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-3 md:mb-4">
                    <ShoppingCart size={24} className="text-white" />
                  </div>
                  <h3 className="font-heading text-base md:text-xl font-bold text-foreground mb-1 md:mb-2">
                    Comprar Piquetes
                  </h3>
                  <p className="font-paragraph text-muted-text text-xs md:text-sm line-clamp-2">
                    Adquiere paquetes para más oportunidades
                  </p>
                </div>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(113, 210, 97, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="relative overflow-hidden rounded-3xl p-4 md:p-6 cursor-pointer h-full bg-gradient-to-br from-accent/5 to-support/5 border-2 border-accent/20 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -mr-12 -mt-12" />
              <div className="relative z-10">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-accent to-support flex items-center justify-center mb-3 md:mb-4">
                  <DollarSign size={24} className="text-white" />
                </div>
                <h3 className="font-heading text-base md:text-xl font-bold text-foreground mb-1 md:mb-2">
                  Retirar Fondos
                </h3>
                <p className="font-paragraph text-muted-text text-xs md:text-sm line-clamp-2">
                  Transfiere a tu cuenta bancaria
                </p>
              </div>
            </motion.div>
          </div>

          {/* Transaction History - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-3xl p-4 md:p-8 border-2 border-border/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-heading text-lg md:text-2xl font-bold text-foreground">
                Historial de Transacciones
              </h2>
              <span className="px-3 py-1 bg-accent/10 rounded-full">
                <span className="font-paragraph text-xs font-semibold text-accent">{transactions.length} movimientos</span>
              </span>
            </div>
            <div className="space-y-2 md:space-y-4 max-h-[350px] md:max-h-none overflow-y-auto">
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(113, 210, 97, 0.05)' }}
                  className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-background/30 to-background/10 rounded-2xl border border-border/30 transition-all"
                >
                  <div className="flex items-center gap-2 md:gap-4 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'credit' 
                          ? 'bg-gradient-to-br from-accent/20 to-accent/10' 
                          : 'bg-gradient-to-br from-destructive/20 to-destructive/10'
                      }`}
                    >
                      {transaction.type === 'credit' ? (
                        <ArrowUpRight size={18} className="md:size-24 text-accent" />
                      ) : (
                        <ArrowDownLeft size={18} className="md:size-24 text-destructive" />
                      )}
                    </motion.div>
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
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`font-heading text-sm md:text-lg font-bold flex-shrink-0 ${
                      transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}RD$ {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <DashboardWithBottomTabs role="joseador">
      <WalletContent />
    </DashboardWithBottomTabs>
  );
}
