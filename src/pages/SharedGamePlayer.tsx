import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  Target, 
  User,
  Building,
  Share
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { Game } from '@/types';

export default function SharedGamePlayer() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        setError('No game ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const gameData = await gameService.getGame(gameId);
        
        // Check if game is published and accessible
        if (gameData.publishStatus !== 'published') {
          setError('This game is not publicly available');
          setIsLoading(false);
          return;
        }
        
        setGame(gameData);
      } catch (err) {
        setError('Game not found or not accessible');
        console.error('Error loading game:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  const handleStartGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Player Name Required",
        description: "Please enter your name to start the game",
        variant: "destructive"
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: "Company Name Required",
        description: "Please enter your company name",
        variant: "destructive"
      });
      return;
    }

    // Store player info and start game
    const playerInfo = {
      name: playerName,
      company: companyName,
      gameId: game?.id
    };
    
    localStorage.setItem('sharedGamePlayer', JSON.stringify(playerInfo));
    
    // Navigate to game player with shared game context
    navigate(`/play?shared=true&gameId=${gameId}&player=${encodeURIComponent(playerName)}&company=${encodeURIComponent(companyName)}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Game Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with branding */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Acapella</h1>
              <p className="text-primary-foreground/80">Risk Assessment Platform</p>
            </div>
            <Badge variant="secondary" className="text-primary">
              <Share className="h-3 w-3 mr-1" />
              Shared Game
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Game Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{game.title}</CardTitle>
                  <p className="text-muted-foreground">{game.description}</p>
                  {game.assignedCompany && (
                    <div className="flex items-center gap-2 mt-3">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Assigned to: {game.assignedCompany}</span>
                    </div>
                  )}
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
            
            <CardContent>
              {/* Game Preview */}
              {game.images && game.images[0] && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
                  <img
                    src={game.images[0].url}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Game Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Limit</p>
                    <p className="font-semibold">{formatTime(game.timeLimit || 300)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Zones</p>
                    <p className="font-semibold">{game.riskZones.length} to find</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Max Clicks</p>
                    <p className="font-semibold">{game.maxClicks || 17} clicks</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to Play</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Look carefully at the workplace image</li>
                  <li>• Click on areas where you spot safety risks or hazards</li>
                  <li>• Find all {game.riskZones.length} risk zones within the time limit</li>
                  <li>• Be strategic with your clicks - you have a maximum of {game.maxClicks || 17}</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Player Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start?</CardTitle>
              <p className="text-muted-foreground">
                Please provide your information before beginning the assessment
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="playerName" className="text-sm font-medium">
                    Your Name *
                  </label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleStartGame}
                  className="w-full md:w-auto"
                  size="lg"
                  disabled={!playerName.trim() || !companyName.trim()}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Risk Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}