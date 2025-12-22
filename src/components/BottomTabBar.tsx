import { motion } from 'framer-motion';
import { Home, Briefcase, MessageSquare, Wallet, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export type TabType = 'home' | 'applications' | 'messages' | 'wallet' | 'profile';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  role: 'client' | 'joseador';
  badges?: {
    applications?: number;
    messages?: number;
  };
}

export default function BottomTabBar({
  activeTab,
  onTabChange,
  role,
  badges = {},
}: BottomTabBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clientTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: <Home size={24} /> },
    { id: 'applications', label: 'Solicitudes', icon: <Briefcase size={24} />, badge: badges.applications },
    { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={24} />, badge: badges.messages },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={24} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={24} /> },
  ];

  const joseadorTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: <Home size={24} /> },
    { id: 'applications', label: 'Aplicaciones', icon: <Briefcase size={24} />, badge: badges.applications },
    { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={24} />, badge: badges.messages },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={24} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={24} /> },
  ];

  const tabs = role === 'client' ? clientTabs : joseadorTabs;

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{
        height: 'max(60px, calc(60px + env(safe-area-inset-bottom)))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="h-full flex items-center justify-around px-0">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 group"
          >
            {/* Icon container with smooth color transition */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  color: activeTab === tab.id ? '#0E9FA8' : '#64748B',
                  scale: activeTab === tab.id ? 1.08 : 1,
                }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center justify-center"
              >
                {tab.icon}
              </motion.div>

              {/* Badge - Instagram style */}
              {tab.badge && tab.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </motion.div>
              )}
            </div>

            {/* Label - only show on active tab for Instagram-like feel */}
            {activeTab === tab.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="font-paragraph text-xs text-primary font-semibold"
              >
                {tab.label}
              </motion.span>
            )}

            {/* Subtle underline indicator - Instagram style */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
