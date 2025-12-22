import { useState, useEffect } from 'react';
import { useRoleStore } from '@/store/roleStore';
import BottomTabBar, { TabType } from '@/components/BottomTabBar';

interface DashboardWithBottomTabsProps {
  role: 'client' | 'joseador';
  homeContent: React.ReactNode;
  applicationsContent: React.ReactNode;
  messagesContent: React.ReactNode;
  walletContent: React.ReactNode;
  profileContent: React.ReactNode;
  badges?: {
    applications?: number;
    messages?: number;
  };
}

export default function DashboardWithBottomTabs({
  role,
  homeContent,
  applicationsContent,
  messagesContent,
  walletContent,
  profileContent,
  badges = {},
}: DashboardWithBottomTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Persist last active tab to localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem(`dashboard-active-tab-${role}`);
    if (savedTab && ['home', 'applications', 'messages', 'wallet', 'profile'].includes(savedTab)) {
      setActiveTab(savedTab as TabType);
    }
  }, [role]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(`dashboard-active-tab-${role}`, tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return homeContent;
      case 'applications':
        return applicationsContent;
      case 'messages':
        return messagesContent;
      case 'wallet':
        return walletContent;
      case 'profile':
        return profileContent;
      default:
        return homeContent;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background relative overflow-hidden pb-[90px]">
      {/* Content Area */}
      <div className="w-full">
        {renderContent()}
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={role}
        badges={badges}
      />
    </div>
  );
}
