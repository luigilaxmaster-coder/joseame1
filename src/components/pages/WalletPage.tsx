import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ShoppingCart, DollarSign } from 'lucide-react';
import DashboardWithBottomTabs from '@/components/DashboardWithBottomTabs';
import { Button } from '@/components/ui/button';
import WalletOverview from '@/components/wallet/WalletOverview';
import { motion } from 'framer-motion';

function WalletContent() {
  const navigate = useNavigate();

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

          {/* Wallet Overview */}
          <WalletOverview />

          {/* Actions - Enhanced Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mt-8 md:mt-12">
            <motion.button
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(58, 182, 137, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => navigate('/joseador/buy-piquetes')}
              className="relative overflow-hidden rounded-3xl p-4 md:p-6 cursor-pointer h-full bg-gradient-to-br from-secondary/5 to-accent/5 border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all text-left"
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
            </motion.button>

            <motion.button
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(113, 210, 97, 0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              onClick={() => navigate('/joseador/withdraw')}
              className="relative overflow-hidden rounded-3xl p-4 md:p-6 cursor-pointer h-full bg-gradient-to-br from-accent/5 to-support/5 border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all text-left"
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
            </motion.button>
          </div>
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
