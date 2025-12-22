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
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'applications', label: 'Mis Solicitudes', icon: <Briefcase size={20} />, badge: badges.applications },
    { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={20} />, badge: badges.messages },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  const joseadorTabs: Tab[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'applications', label: 'Mis Aplicaciones', icon: <Briefcase size={20} />, badge: badges.applications },
    { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={20} />, badge: badges.messages },
    { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
  ];

  const tabs = role === 'client' ? clientTabs : joseadorTabs;

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-border/50 shadow-2xl safe-area-inset-bottom"
      style={{
        height: '76px',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors group"
          >
            {/* Active indicator background */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon container */}
            <div className="relative z-10">
              <motion.div
                animate={{
                  color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted-text)',
                  scale: activeTab === tab.id ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {tab.icon}
              </motion.div>

              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                >
                  {tab.badge > 9 ? '9+' : tab.badge}
                </motion.div>
              )}
            </div>

            {/* Label */}
            <motion.span
              animate={{
                fontSize: activeTab === tab.id ? '0.625rem' : '0.625rem',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted-text)',
                fontWeight: activeTab === tab.id ? 600 : 500,
              }}
              transition={{ duration: 0.2 }}
              className="font-paragraph text-xs text-center line-clamp-1 relative z-10"
            >
              {tab.label}
            </motion.span>

            {/* Active indicator line */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                style={{ width: '24px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
