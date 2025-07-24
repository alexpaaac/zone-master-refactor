import { useState, ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Mock user data - in real app this would come from auth context
  const user = {
    name: 'Thierry Cohen',
    email: 'thierry@acapella.com',
    avatar: undefined
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={toggleSidebar} user={user} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <main 
          className={cn(
            "flex-1 transition-all duration-300",
            "md:ml-0",
            sidebarOpen ? "md:ml-64" : "md:ml-16"
          )}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}