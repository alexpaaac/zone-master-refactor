import { useEffect, useState } from 'react';
import { Plus, Gamepad2, TrendingUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { GameCard } from '@/components/games/GameCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { gameService } from '@/services/gameService';
import { Game } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  const { state, dispatch } = useApp();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock stats data
  const stats = {
    totalGames: state.games.length,
    activeGames: state.games.filter(g => g.isActive).length,
    totalSessions: 147,
    averageScore: 823,
    totalRiskZones: state.games.reduce((acc, game) => acc + game.riskZones.length, 0),
    averageCompletionTime: 243
  };

  // Mock recent activity
  const recentActivity = [
    {
      id: '1',
      type: 'game_played' as const,
      title: 'Industrial Safety Assessment completed',
      subtitle: 'Score: 892 • Time: 4:23',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: '2',
      type: 'game_created' as const,
      title: 'New game created',
      subtitle: 'Construction Site Hazards',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '3',
      type: 'game_edited' as const,
      title: 'Game settings updated',
      subtitle: 'Factory Safety Training',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: games } = await gameService.getGames(1, 10);
        dispatch({ type: 'SET_GAMES', payload: games });
        
        // Get featured games (first 3 active games)
        const featured = games.filter(g => g.isActive).slice(0, 3);
        setFeaturedGames(featured);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  const handlePlayGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    toast.success(`Starting ${game.title}...`);
    // In a real app, this would navigate to the game play screen
  };

  const handleEditGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    toast.info(`Opening editor for ${game.title}`);
    // In a real app, this would navigate to the game editor
  };

  const handleDuplicateGame = async (game: Game) => {
    try {
      const duplicated = await gameService.duplicateGame(game.id);
      dispatch({ type: 'ADD_GAME', payload: duplicated });
      toast.success(`${game.title} duplicated successfully`);
    } catch (error) {
      toast.error('Failed to duplicate game');
    }
  };

  const handleDeleteGame = async (game: Game) => {
    try {
      await gameService.deleteGame(game.id);
      dispatch({ type: 'DELETE_GAME', payload: game.id });
      toast.success(`${game.title} deleted`);
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-gaming font-bold text-primary">
              Welcome to Cohen3
            </h1>
            <p className="text-muted-foreground mt-1">
              Professional risk assessment platform for safety training
            </p>
          </div>
          
          <Button 
            variant="gaming" 
            className="self-start"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Create New Game button clicked');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Game
          </Button>
        </div>

        {/* Dashboard stats */}
        <DashboardStats stats={stats} isLoading={isLoading} />

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Featured games */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-primary" />
                Featured Games
              </h2>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardHeader>
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : featuredGames.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {featuredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={handlePlayGame}
                    onEdit={handleEditGame}
                    onDuplicate={handleDuplicateGame}
                    onDelete={handleDeleteGame}
                  />
                ))}
              </div>
            ) : (
              <Card className="surface-elevated">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gamepad2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No games yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first risk assessment game to get started
                  </p>
                  <Button variant="gaming">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Game
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent activity */}
          <div>
            <RecentActivity activities={recentActivity} isLoading={isLoading} />
          </div>
        </div>

        {/* Quick stats */}
        <Card className="surface-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-muted-foreground">Average Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">4:12</div>
                <div className="text-sm text-muted-foreground">Avg Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">94%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
