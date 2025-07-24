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
      title: 'Évaluation de sécurité industrielle terminée',
      subtitle: 'Score: 892 • Temps: 4:23',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      id: '2',
      type: 'game_created' as const,
      title: 'Nouveau jeu créé',
      subtitle: 'Dangers du chantier de construction',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: '3',
      type: 'game_edited' as const,
      title: 'Paramètres du jeu mis à jour',
      subtitle: 'Formation sécurité en usine',
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
        toast.error('Échec du chargement des données du tableau de bord');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  const handlePlayGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    toast.success(`Démarrage de ${game.title}...`);
    // In a real app, this would navigate to the game play screen
  };

  const handleEditGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    toast.info(`Ouverture de l'éditeur pour ${game.title}`);
    // In a real app, this would navigate to the game editor
  };

  const handleDuplicateGame = async (game: Game) => {
    try {
      const duplicated = await gameService.duplicateGame(game.id);
      dispatch({ type: 'ADD_GAME', payload: duplicated });
      toast.success(`${game.title} dupliqué avec succès`);
    } catch (error) {
      toast.error('Échec de la duplication du jeu');
    }
  };

  const handleDeleteGame = async (game: Game) => {
    try {
      await gameService.deleteGame(game.id);
      dispatch({ type: 'DELETE_GAME', payload: game.id });
      toast.success(`${game.title} supprimé`);
    } catch (error) {
      toast.error('Échec de la suppression du jeu');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-gaming font-bold text-primary">
              Bienvenue sur Acapella
            </h1>
            <p className="text-muted-foreground mt-1">
              Plateforme professionnelle d'évaluation des risques et de formation à la sécurité
            </p>
          </div>
          
          <Button variant="gaming" className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Créer un nouveau jeu
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
                Jeux en vedette
              </h2>
              <Button variant="ghost" size="sm">
                Voir tout
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
                  <h3 className="text-lg font-medium mb-2">Aucun jeu pour le moment</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Créez votre premier jeu d'évaluation des risques pour commencer
                  </p>
                  <Button variant="gaming">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer votre premier jeu
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
              Aperçu des performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-muted-foreground">Précision moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">4:12</div>
                <div className="text-sm text-muted-foreground">Temps moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">94%</div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
