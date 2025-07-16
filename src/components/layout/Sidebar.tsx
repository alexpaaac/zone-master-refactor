import { useState } from 'react';
import { 
  Home, 
  Gamepad2, 
  Settings, 
  BarChart3, 
  Shield, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath?: string; // Make this optional
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, isActive: true },
  { name: 'Games', href: '/games', icon: Gamepad2, isActive: false },
  { name: 'Risk Zones', href: '/zones', icon: Shield, isActive: false },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, isActive: false },
  { name: 'Settings', href: '/settings', icon: Settings, isActive: false },
];

export function Sidebar({ isOpen, onToggle, currentPath = '/' }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r transition-all duration-300 z-50",
          "md:relative md:top-0 md:h-screen md:z-auto",
          isOpen ? "w-64" : "w-0 md:w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Toggle button */}
          <div className="hidden md:flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              const isClickable = item.href === '/'; // Only dashboard is clickable for now
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (isClickable) {
                      // Navigation would go here
                      console.log(`Navigate to ${item.href}`);
                    } else {
                      console.log(`${item.name} - Coming soon!`);
                    }
                  }}
                  disabled={!isClickable}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground shadow-glow",
                    !isClickable && "opacity-60 cursor-not-allowed",
                    !isOpen && "md:justify-center md:px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isOpen && <span className="truncate">{item.name}</span>}
                  {isOpen && !isClickable && (
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
            
            {/* Quick actions */}
            <div className="pt-4 mt-4 border-t">
              <Button
                variant="gaming-outline"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2",
                  !isOpen && "md:w-auto md:px-2"
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {isOpen && <span>New Game</span>}
              </Button>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t">
            {isOpen ? (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">Version 3.0</p>
                <p>Risk Assessment Platform</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-6 w-6 mx-auto rounded bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">C3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}