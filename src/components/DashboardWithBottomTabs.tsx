import BottomTabBar from '@/components/BottomTabBar';

interface DashboardWithBottomTabsProps {
  role: 'client' | 'joseador';
  children: React.ReactNode;
  badges?: {
    applications?: number;
    messages?: number;
  };
}

export default function DashboardWithBottomTabs({
  role,
  children,
  badges = {},
}: DashboardWithBottomTabsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#f0f8fb] to-background relative overflow-hidden pb-[90px]">
      {/* Content Area */}
      <div className="w-full">
        {children}
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        role={role}
        badges={badges}
      />
    </div>
  );
}
