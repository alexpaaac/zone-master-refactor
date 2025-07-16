import { useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mock user data - in real app this would come from auth context
  const user = {
    name: 'Alex Cohen',
    email: 'alex@cohen3.com',
    avatar: undefined
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={toggleSidebar} user={user} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} currentPath={location.pathname} />
        
        <main className="flex-1 min-w-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}