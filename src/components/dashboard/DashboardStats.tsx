import { TrendingUp, Users, Gamepad2, Shield, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsData {
  totalGames: number;
  activeGames: number;
  totalSessions: number;
  averageScore: number;
  totalRiskZones: number;
  averageCompletionTime: number;
}

interface DashboardStatsProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Games',
      value: stats.totalGames,
      icon: Gamepad2,
      description: `${stats.activeGames} active`,
      color: 'text-primary'
    },
    {
      title: 'Game Sessions',
      value: stats.totalSessions,
      icon: Users,
      description: 'This month',
      color: 'text-accent'
    },
    {
      title: 'Risk Zones',
      value: stats.totalRiskZones,
      icon: Shield,
      description: 'Across all games',
      color: 'text-success'
    },
    {
      title: 'Average Score',
      value: stats.averageScore,
      icon: TrendingUp,
      description: 'Out of 1000',
      color: 'text-warning'
    },
    {
      title: 'Completion Time',
      value: `${Math.floor(stats.averageCompletionTime / 60)}:${(stats.averageCompletionTime % 60).toString().padStart(2, '0')}`,
      icon: Clock,
      description: 'Average time',
      color: 'text-primary'
    },
    {
      title: 'Accuracy Rate',
      value: '87%',
      icon: Target,
      description: 'Average accuracy',
      color: 'text-success'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-1" />
              <div className="h-3 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => (
        <Card key={stat.title} className="surface-elevated hover:shadow-elevated transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}