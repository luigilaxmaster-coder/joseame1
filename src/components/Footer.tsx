import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '@/store/languageStore';
import { getTranslation } from '@/lib/translations';

export default function Footer() {
  const { language } = useLanguageStore();
  const t = (key: string) => getTranslation(key, language);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white py-12 md:py-16">
      <div className="max-w-[100rem] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-4 bg-gradient-to-r from-accent via-support to-secondary bg-clip-text text-transparent">
              JOSEAME
            </h3>
            <p className="font-paragraph text-sm text-white/70">
              {language === 'es'
                ? 'La infraestructura digital del joseo. Conecta con profesionales o encuentra trabajos en minutos.'
                : 'The digital infrastructure of work. Connect with professionals or find jobs in minutes.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Inicio' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Acerca de' : 'About'}
                </Link>
              </li>
              <li>
                <Link to="/login" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {language === 'es' ? 'Para Clientes' : 'For Clients'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Publicar Trabajo' : 'Post a Job'}
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Cómo Funciona' : 'How It Works'}
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Precios' : 'Pricing'}
                </a>
              </li>
            </ul>
          </div>

          {/* For Workers */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {language === 'es' ? 'Para Joseadores' : 'For Workers'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Encontrar Trabajos' : 'Find Jobs'}
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Crear Perfil' : 'Create Profile'}
                </a>
              </li>
              <li>
                <a href="#" className="font-paragraph text-sm text-white/70 hover:text-accent transition-colors">
                  {language === 'es' ? 'Seguridad' : 'Safety'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-paragraph text-sm text-white/60">
              © {currentYear} JOSEAME. {language === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="font-paragraph text-sm text-white/60 hover:text-accent transition-colors">
                {language === 'es' ? 'Privacidad' : 'Privacy'}
              </a>
              <a href="#" className="font-paragraph text-sm text-white/60 hover:text-accent transition-colors">
                {language === 'es' ? 'Términos' : 'Terms'}
              </a>
              <a href="#" className="font-paragraph text-sm text-white/60 hover:text-accent transition-colors">
                {language === 'es' ? 'Contacto' : 'Contact'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
