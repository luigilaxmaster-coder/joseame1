import React from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('es')}
        className={`px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all ${
          language === 'es'
            ? 'bg-white text-primary shadow-lg'
            : 'text-white hover:bg-white/20'
        }`}
      >
        🇩🇴 ES
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('en')}
        className={`px-4 py-2 rounded-full font-heading font-semibold text-sm transition-all ${
          language === 'en'
            ? 'bg-white text-primary shadow-lg'
            : 'text-white hover:bg-white/20'
        }`}
      >
        🇺🇸 EN
      </motion.button>
    </div>
  );
}
