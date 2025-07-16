import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Clock,
  Target,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

export default function Games() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { games, setCurrentGame } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Filter games based on search and difficulty
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || game.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handlePlayGame = (game: any) => {
    setCurrentGame(game);
    navigate('/play');
    toast({
      title: "Game Selected",
      description: `Starting ${game.title}`,
      variant: "default"
    });
  };

  const handleEditGame = (game: any) => {
    setCurrentGame(game);
    navigate('/builder');
    toast({
      title: "Edit Mode",
      description: `Editing ${game.title}`,
      variant: "default"
    });
  };

  const handleDuplicateGame = (game: any) => {
    const duplicatedGame = {
      ...game,
      id: `game-${Date.now()}`,
      title: `${game.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, this would save to backend
    toast({
      title: "Game Duplicated",
      description: `Created copy of ${game.title}`,
      variant: "default"
    });
  };

  const handleDeleteGame = (game: any) => {
    // In a real app, this would delete from backend
    toast({
      title: "Game Deleted",
      description: `Deleted ${game.title}`,
      variant: "destructive"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Games</h1>
            <p className="text-muted-foreground">Manage your risk hunt games</p>
          </div>
          <Button onClick={() => navigate('/builder')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Game
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No games found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterDifficulty !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first game to get started'
                  }
                </p>
                <Button onClick={() => navigate('/builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Game
                </Button>
              </div>
            </div>
          ) : (
            filteredGames.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {game.description}
                      </p>
                    </div>
                    <Badge variant={
                      game.difficulty === 'easy' ? 'outline' :
                      game.difficulty === 'medium' ? 'secondary' :
                      game.difficulty === 'hard' ? 'default' : 'destructive'
                    }>
                      {game.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Game Preview Image */}
                  {game.images && game.images[0] && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={game.images[0].url}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Game Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatTime(game.timeLimit || 300)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span>{game.riskZones.length} risks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{game.maxClicks || 17} clicks</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handlePlayGame(game)}
                      className="flex-1"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGame(game)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateGame(game)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGame(game)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Game Info */}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(game.createdAt).toLocaleDateString()}
                    {game.isActive && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}