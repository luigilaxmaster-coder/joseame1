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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-[100rem] mx-auto px-6 py-4">
          <Link to="/joseador/dashboard" className="inline-flex items-center gap-2 text-muted-text hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-paragraph">Volver al Dashboard</span>
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
            Mi Wallet
          </h1>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-secondary via-accent to-support rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Wallet size={28} />
                <h3 className="font-heading text-lg font-semibold">Balance Total</h3>
              </div>
              <p className="font-heading text-4xl font-bold mb-2">
                RD$ {balance.toLocaleString()}
              </p>
              <p className="font-paragraph text-white/80 text-sm">Disponible para retiro</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={28} className="text-accent" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Piquetes Gratis</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground mb-2">
                {freeQuotaBalance}
              </p>
              <p className="font-paragraph text-muted-text text-sm">Aplicaciones gratuitas</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart size={28} className="text-secondary" />
                <h3 className="font-heading text-lg font-semibold text-foreground">Piquetes Comprados</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground mb-2">
                {piquetesBalance}
              </p>
              <p className="font-paragraph text-muted-text text-sm">Aplicaciones disponibles</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link to="/joseador/buy-piquetes">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingCart size={32} className="text-secondary mb-3" />
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  Comprar Piquetes
                </h3>
                <p className="font-paragraph text-muted-text">
                  Adquiere paquetes de aplicaciones para más oportunidades
                </p>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <DollarSign size={32} className="text-accent mb-3" />
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Retirar Fondos
              </h3>
              <p className="font-paragraph text-muted-text">
                Transfiere tu balance a tu cuenta bancaria
              </p>
            </motion.div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl p-8 border border-border shadow-lg">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
              Historial de Transacciones
            </h2>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-accent/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp size={24} className="text-accent" />
                      ) : (
                        <ShoppingCart size={24} className="text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-muted-text text-sm">
                        <Calendar size={14} />
                        <span className="font-paragraph">
                          {new Date(transaction.date).toLocaleDateString('es-DO')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-heading text-xl font-bold ${
                    transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}RD$ {transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
