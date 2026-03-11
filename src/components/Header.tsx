import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMember } from '@/integrations';
import { useLanguageStore } from '@/store/languageStore';
import { getTranslation } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { member, isAuthenticated, actions } = useMember();
  const { language } = useLanguageStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = (key: string) => getTranslation(key, language);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-[100rem] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="font-heading font-bold text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
          >
            JOSEAME
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/about"
              className="font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Acerca de
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {member?.profile?.nickname || 'Perfil'}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={actions.logout}
                  className="px-4 py-2 bg-destructive text-destructive-foreground font-heading font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Salir
                </motion.button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-white/95 backdrop-blur-md"
        >
          <div className="max-w-[100rem] mx-auto px-6 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Acerca de
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block font-paragraph text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {member?.profile?.nickname || 'Perfil'}
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    actions.logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-destructive text-destructive-foreground font-heading font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Salir
                </motion.button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-6 py-2 bg-gradient-to-r from-primary via-secondary to-accent text-white font-heading font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
