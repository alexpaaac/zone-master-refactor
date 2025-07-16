import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Clock,
  Award,
  Download
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function Analytics() {
  const { games } = useApp();

  // Mock analytics data
  const analyticsData = {
    totalGames: games.length,
    totalPlayers: 127,
    totalSessions: 342,
    averageScore: 78.5,
    averageCompletionTime: 245,
    averageAccuracy: 82.3,
    topPerformers: [
      { name: 'Sarah Johnson', score: 95, accuracy: 94, time: 180 },
      { name: 'Mike Chen', score: 92, accuracy: 91, time: 210 },
      { name: 'Emma Davis', score: 89, accuracy: 88, time: 195 }
    ],
    gamePerformance: [
      { gameTitle: 'Industrial Safety Assessment', avgScore: 85, sessions: 45 },
      { gameTitle: 'Chemical Handling Procedures', avgScore: 78, sessions: 32 },
      { gameTitle: 'Emergency Evacuation Routes', avgScore: 82, sessions: 28 }
    ],
    riskCategoryStats: [
      { category: 'Electrical', identified: 89, missed: 11, accuracy: 89 },
      { category: 'Chemical', identified: 76, missed: 24, accuracy: 76 },
      { category: 'Mechanical', identified: 92, missed: 8, accuracy: 92 },
      { category: 'Safety', identified: 84, missed: 16, accuracy: 84 }
    ]
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Performance insights and statistics</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{analyticsData.totalGames}</p>
                  <p className="text-sm text-muted-foreground">Total Games</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{analyticsData.totalPlayers}</p>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{analyticsData.averageScore.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{formatTime(analyticsData.averageCompletionTime)}</p>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{performer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {performer.accuracy}% accuracy • {formatTime(performer.time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{performer.score}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Game Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.gamePerformance.map((game) => (
                  <div key={game.gameTitle} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{game.gameTitle}</h4>
                      <Badge variant="outline">{game.sessions} sessions</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="font-semibold">{game.avgScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Category Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.riskCategoryStats.map((category) => (
                <div key={category.category} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{category.category}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Identified:</span>
                      <span className="text-green-600 font-medium">{category.identified}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Missed:</span>
                      <span className="text-red-600 font-medium">{category.missed}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accuracy:</span>
                      <span className="font-medium">{category.accuracy}%</span>
                    </div>
                  </div>
                  
                  {/* Simple progress bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${category.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">87.3%</p>
                <p className="text-sm text-muted-foreground">Games completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analyticsData.averageAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Risk identification</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{analyticsData.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Games played</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}