import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

type MainLayoutProps = {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const HEADER_HEIGHT = 72; // 18 * 4 = 72px (h-18 in Tailwind)

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header - Fixed */}
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen}
      />

      {/* Main content area */}
      <main 
        className={`transition-all duration-300 pt-[${HEADER_HEIGHT}px] min-h-screen ${
          // Desktop: always add left margin for sidebar
          // Mobile: no left margin (sidebar is overlay)
          'lg:ml-72'
        }`}
        style={{ 
          paddingTop: `${HEADER_HEIGHT}px`,
          minHeight: '100vh'
        }}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;