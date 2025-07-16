import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Trophy,
  Calendar,
  Target,
  MousePointer,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface GameResult {
  id: string;
  playerName: string;
  teamName?: string;
  gameId: string;
  gameTitle: string;
  score: number;
  risksFound: number;
  totalRisks: number;
  clicksUsed: number;
  maxClicks: number;
  timeSpent: number;
  timeLimit: number;
  accuracy: number;
  efficiency: number;
  completedAt: string;
}

export default function GameResults() {
  const { toast } = useToast();
  const { currentGame, currentSession } = useApp();
  
  const [results, setResults] = useState<GameResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<GameResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'individual' | 'team'>('individual');

  // Mock results data - in real app this would come from API
  useEffect(() => {
    const mockResults: GameResult[] = [
      {
        id: '1',
        playerName: 'John Doe',
        teamName: 'Safety Team A',
        gameId: 'game-1',
        gameTitle: 'Industrial Safety Assessment',
        score: 85,
        risksFound: 12,
        totalRisks: 15,
        clicksUsed: 14,
        maxClicks: 17,
        timeSpent: 240,
        timeLimit: 300,
        accuracy: 80,
        efficiency: 90,
        completedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        playerName: 'Jane Smith',
        teamName: 'Safety Team A',
        gameId: 'game-1',
        gameTitle: 'Industrial Safety Assessment',
        score: 92,
        risksFound: 14,
        totalRisks: 15,
        clicksUsed: 15,
        maxClicks: 17,
        timeSpent: 280,
        timeLimit: 300,
        accuracy: 93,
        efficiency: 88,
        completedAt: '2024-01-15T14:45:00Z'
      },
      {
        id: '3',
        playerName: 'Mike Johnson',
        teamName: 'Safety Team B',
        gameId: 'game-1',
        gameTitle: 'Industrial Safety Assessment',
        score: 78,
        risksFound: 11,
        totalRisks: 15,
        clicksUsed: 16,
        maxClicks: 17,
        timeSpent: 295,
        timeLimit: 300,
        accuracy: 73,
        efficiency: 75,
        completedAt: '2024-01-15T15:00:00Z'
      }
    ];

    // Add current session if completed
    if (currentSession?.completed && currentGame) {
      const currentResult: GameResult = {
        id: currentSession.id,
        playerName: 'Current Player',
        gameId: currentSession.gameId,
        gameTitle: currentGame.title,
        score: currentSession.score,
        risksFound: currentSession.foundZones.length,
        totalRisks: currentGame.riskZones.length,
        clicksUsed: currentSession.clicks.length,
        maxClicks: currentGame.maxClicks || 17,
        timeSpent: currentSession.timeSpent,
        timeLimit: currentGame.timeLimit || 300,
        accuracy: currentGame.riskZones.length > 0 ? 
          (currentSession.foundZones.length / currentGame.riskZones.length) * 100 : 0,
        efficiency: currentSession.timeSpent > 0 ? 
          (currentSession.foundZones.length / currentSession.timeSpent) * 100 : 0,
        completedAt: currentSession.endTime || new Date().toISOString()
      };
      mockResults.unshift(currentResult);
    }

    setResults(mockResults);
    setFilteredResults(mockResults);
  }, [currentSession, currentGame]);

  // Filter results by team
  useEffect(() => {
    if (selectedTeam === 'all') {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(r => r.teamName === selectedTeam));
    }
  }, [results, selectedTeam]);

  // Get unique teams
  const teams = Array.from(new Set(results.map(r => r.teamName).filter(Boolean)));

  // Calculate team statistics
  const getTeamStats = () => {
    const teamMap = new Map<string, GameResult[]>();
    
    results.forEach(result => {
      const team = result.teamName || 'No Team';
      if (!teamMap.has(team)) {
        teamMap.set(team, []);
      }
      teamMap.get(team)!.push(result);
    });

    return Array.from(teamMap.entries()).map(([teamName, teamResults]) => ({
      teamName,
      playerCount: teamResults.length,
      averageScore: Math.round(teamResults.reduce((sum, r) => sum + r.score, 0) / teamResults.length),
      averageAccuracy: Math.round(teamResults.reduce((sum, r) => sum + r.accuracy, 0) / teamResults.length),
      totalRisksFound: teamResults.reduce((sum, r) => sum + r.risksFound, 0),
      bestScore: Math.max(...teamResults.map(r => r.score)),
      bestPlayer: teamResults.reduce((best, current) => 
        current.score > best.score ? current : best
      ).playerName
    }));
  };

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Player Name',
      'Team',
      'Game',
      'Score',
      'Risks Found',
      'Total Risks',
      'Accuracy (%)',
      'Clicks Used',
      'Time Spent (s)',
      'Efficiency',
      'Completed At'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredResults.map(result => [
        result.playerName,
        result.teamName || '',
        result.gameTitle,
        result.score,
        result.risksFound,
        result.totalRisks,
        result.accuracy.toFixed(1),
        result.clicksUsed,
        result.timeSpent,
        result.efficiency.toFixed(1),
        new Date(result.completedAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Results exported to CSV file",
      variant: "default"
    });
  };

  const exportToPDF = () => {
    // In a real app, this would use a PDF library like jsPDF
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented here",
      variant: "default"
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Game Results</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{results.length}</p>
                  <p className="text-sm text-muted-foreground">Total Players</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Average Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{teams.length}</p>
                  <p className="text-sm text-muted-foreground">Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Mode */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Team:</label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="all">All Teams</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('individual')}
                >
                  Individual
                </Button>
                <Button
                  variant={viewMode === 'team' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('team')}
                >
                  By Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'individual' | 'team')}>
          <TabsContent value="individual">
            {/* Individual Results */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Results ({filteredResults.length} players)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredResults.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No results found</p>
                  ) : (
                    filteredResults.map((result, index) => (
                      <div
                        key={result.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{result.playerName}</h3>
                              {result.teamName && (
                                <p className="text-sm text-muted-foreground">{result.teamName}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-primary">{result.score}</p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="font-semibold">{result.risksFound}/{result.totalRisks}</p>
                              <p className="text-xs text-muted-foreground">Risks</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="font-semibold">{result.accuracy.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Accuracy</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="font-semibold">{formatTime(result.timeSpent)}</p>
                              <p className="text-xs text-muted-foreground">Time</p>
                            </div>
                            
                            <div className="text-center">
                              <p className="font-semibold">{result.clicksUsed}</p>
                              <p className="text-xs text-muted-foreground">Clicks</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                          <span>{result.gameTitle}</span>
                          <span>{formatDate(result.completedAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            {/* Team Results */}
            <Card>
              <CardHeader>
                <CardTitle>Team Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTeamStats().map((team, index) => (
                    <div
                      key={team.teamName}
                      className="border rounded-lg p-6 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-lg font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{team.teamName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {team.playerCount} player{team.playerCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <p className="text-2xl font-bold text-primary">{team.averageScore}</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                          </div>
                          
                          <div>
                            <p className="text-2xl font-bold text-green-600">{team.averageAccuracy}%</p>
                            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                          </div>
                          
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{team.totalRisksFound}</p>
                            <p className="text-xs text-muted-foreground">Total Risks</p>
                          </div>
                          
                          <div>
                            <p className="text-2xl font-bold text-yellow-600">{team.bestScore}</p>
                            <p className="text-xs text-muted-foreground">Best Score</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Top Performer:</strong> {team.bestPlayer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}