import { Clock, Play, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  type: 'game_created' | 'game_played' | 'game_edited' | 'game_deleted';
  title: string;
  subtitle: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const activityIcons = {
  game_created: Plus,
  game_played: Play,
  game_edited: Edit,
  game_deleted: Trash2,
};

const activityColors = {
  game_created: 'text-success',
  game_played: 'text-primary',
  game_edited: 'text-warning',
  game_deleted: 'text-destructive',
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as you use the platform</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div key={activity.id} className="flex items-center space-x-4 group">
                  <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.subtitle}
                    </p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.timestamp)}
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full text-sm">
                View all activity
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}