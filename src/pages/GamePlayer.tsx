import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, Target, MousePointer, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { GameResultsScreen } from '@/components/games/GameResultsScreen';
import { useNavigate } from 'react-router-dom';

interface GameSession {
  id: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  clicks: Array<{
    id: string;
    x: number;
    y: number;
    timestamp: string;
    hitZoneId?: string;
  }>;
  foundZones: string[];
  score: number;
  timeSpent: number;
  completed: boolean;
}

export default function GamePlayer() {
  const { toast } = useToast();
  const { currentGame, updateCurrentSession } = useApp();
  const navigate = useNavigate();
  
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start game
  const startGame = (name: string) => {
    if (!currentGame) {
      toast({
        title: "Error",
        description: "No game selected",
        variant: "destructive"
      });
      return;
    }

    const session: GameSession = {
      id: `session-${Date.now()}`,
      gameId: currentGame.id,
      startTime: new Date().toISOString(),
      clicks: [],
      foundZones: [],
      score: 0,
      timeSpent: 0,
      completed: false
    };

    setGameSession(session);
    setTimeRemaining(currentGame.timeLimit || 300);
    setIsGameActive(true);
    setShowNameInput(false);
    setPlayerName(name);
    updateCurrentSession(session);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: "Jeu commencé !",
      description: `Bonne chance, ${name} !`,
      variant: "default"
    });
  };

  // End game
  const endGame = () => {
    if (!gameSession || !currentGame) return;

    setIsGameActive(false);
    setGameCompleted(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const timeSpent = (currentGame.timeLimit || 300) - timeRemaining;
    const foundRisks = gameSession.foundZones.length;
    const totalRisks = currentGame.riskZones.length;
    const accuracy = totalRisks > 0 ? (foundRisks / totalRisks) * 100 : 0;
    const score = Math.round(accuracy * (timeRemaining / (currentGame.timeLimit || 300)) * 100);

    const finalSession = {
      ...gameSession,
      endTime: new Date().toISOString(),
      timeSpent,
      score,
      completed: true
    };

    setGameSession(finalSession);
    updateCurrentSession(finalSession);

    toast({
      title: "Jeu terminé !",
      description: `Score: ${score} | Trouvé: ${foundRisks}/${totalRisks} risques`,
      variant: "default"
    });
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isGameActive || !gameSession || !currentGame || !canvasRef.current) return;

    // Check click limit
    if (gameSession.clicks.length >= (currentGame.maxClicks || 17)) {
      toast({
        title: "Plus de clics !",
        description: "Vous avez utilisé tous vos clics. Fin du jeu...",
        variant: "destructive"
      });
      endGame(); // Auto-end game when out of clicks
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to original image size
    const scaleX = (imageRef.current?.naturalWidth || canvas.width) / canvas.width;
    const scaleY = (imageRef.current?.naturalHeight || canvas.height) / canvas.height;
    const originalX = x * scaleX;
    const originalY = y * scaleY;

    // Check if click hits any risk zone
    const hitZone = currentGame.riskZones.find(zone => {
      if (zone.type === 'circle') {
        const distance = Math.sqrt((originalX - zone.x) ** 2 + (originalY - zone.y) ** 2);
        return distance <= (zone.radius || 20);
      } else {
        return originalX >= zone.x && 
               originalX <= zone.x + (zone.width || 40) &&
               originalY >= zone.y && 
               originalY <= zone.y + (zone.height || 40);
      }
    });

    const clickId = `click-${Date.now()}`;
    const newClick = {
      id: clickId,
      x: originalX,
      y: originalY,
      timestamp: new Date().toISOString(),
      hitZoneId: hitZone?.id
    };

    // Update session with new click
    const updatedSession = {
      ...gameSession,
      clicks: [...gameSession.clicks, newClick],
      foundZones: hitZone && !gameSession.foundZones.includes(hitZone.id) 
        ? [...gameSession.foundZones, hitZone.id]
        : gameSession.foundZones
    };

    setGameSession(updatedSession);
    updateCurrentSession(updatedSession);

    if (hitZone && !gameSession.foundZones.includes(hitZone.id)) {
      toast({
        title: "Risque trouvé !",
        description: hitZone.description,
        variant: "default"
      });

      // Check if all risks found
      if (updatedSession.foundZones.length >= (currentGame.targetRisks || currentGame.riskZones.length)) {
        endGame();
      }
    }

    // Auto-end game if this was the last click
    if (updatedSession.clicks.length >= (currentGame.maxClicks || 17)) {
      setTimeout(() => {
        endGame();
      }, 1000); // Small delay to show the click result
    }

    // Redraw canvas with new click
    drawGame();
  };

  // Draw game state on canvas
  const drawGame = () => {
    if (!canvasRef.current || !imageRef.current || !currentGame) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / (imageRef.current.naturalWidth || canvas.width);
    const scaleY = canvas.height / (imageRef.current.naturalHeight || canvas.height);

    // Draw found risk zones
    if (gameSession) {
      gameSession.foundZones.forEach(zoneId => {
        const zone = currentGame.riskZones.find(z => z.id === zoneId);
        if (zone) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';

          ctx.beginPath();
          if (zone.type === 'circle') {
            ctx.arc(zone.x * scaleX, zone.y * scaleY, (zone.radius || 20) * scaleX, 0, 2 * Math.PI);
          } else {
            ctx.rect(zone.x * scaleX, zone.y * scaleY, (zone.width || 40) * scaleX, (zone.height || 40) * scaleY);
          }
          ctx.fill();
          ctx.stroke();
        }
      });

      // Draw click markers
      gameSession.clicks.forEach(click => {
        ctx.fillStyle = click.hitZoneId ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(click.x * scaleX, click.y * scaleY, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // If game completed, show all risk zones
    if (gameCompleted) {
      currentGame.riskZones.forEach(zone => {
        const isFound = gameSession?.foundZones.includes(zone.id);
        ctx.strokeStyle = isFound ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillStyle = isFound ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';

        ctx.beginPath();
        if (zone.type === 'circle') {
          ctx.arc(zone.x * scaleX, zone.y * scaleY, (zone.radius || 20) * scaleX, 0, 2 * Math.PI);
        } else {
          ctx.rect(zone.x * scaleX, zone.y * scaleY, (zone.width || 40) * scaleX, (zone.height || 40) * scaleY);
        }
        ctx.fill();
        ctx.stroke();
      });
    }
  };

  // Handle image load
  const handleImageLoad = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const maxWidth = 800;
      const maxHeight = 600;
      
      const aspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      
      if (aspectRatio > maxWidth / maxHeight) {
        canvas.width = maxWidth;
        canvas.height = maxWidth / aspectRatio;
      } else {
        canvas.height = maxHeight;
        canvas.width = maxHeight * aspectRatio;
      }
      
      drawGame();
    }
  };

  // Redraw when game state changes
  useEffect(() => {
    drawGame();
  }, [gameSession, gameCompleted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Show name input if no player name
  if (showNameInput) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Entrez votre nom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Nom du joueur"
                className="w-full p-3 border rounded-lg"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) {
                    startGame(playerName.trim());
                  }
                }}
              />
              <Button
                onClick={() => playerName.trim() && startGame(playerName.trim())}
                className="w-full"
                disabled={!playerName.trim()}
              >
                Commencer le jeu
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!currentGame) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Aucun jeu sélectionné</h2>
          <p className="text-muted-foreground">Veuillez sélectionner un jeu à jouer.</p>
        </div>
      </Layout>
    );
  }

  // Handle restart game
  const handlePlayAgain = () => {
    setGameSession(null);
    setTimeRemaining(0);
    setIsGameActive(false);
    setGameCompleted(false);
    setShowNameInput(true);
    setPlayerName('');
  };

  // Handle back to games
  const handleBackToMenu = () => {
    navigate('/games');
  };

  // Show results screen when game is completed
  if (gameCompleted && gameSession) {
    return (
      <Layout>
        <GameResultsScreen
          game={currentGame}
          session={gameSession}
          playerName={playerName}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{currentGame.title}</h1>
            <p className="text-muted-foreground">Joueur: {playerName}</p>
          </div>
          {gameCompleted && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              Jeu terminé !
            </Badge>
          )}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Temps restant</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Risques trouvés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {gameSession?.foundZones.length || 0}/{currentGame.riskZones.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Clics utilisés</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {gameSession?.clicks.length || 0}/{currentGame.maxClicks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {gameCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-orange-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Score</p>
                  <p className="text-2xl font-bold">
                    {gameSession?.score || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{gameSession?.foundZones.length || 0}/{currentGame.targetRisks} risques</span>
              </div>
              <Progress 
                value={((gameSession?.foundZones.length || 0) / currentGame.targetRisks) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Canvas */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              {currentGame.images[0] && (
                <>
                  <img
                    ref={imageRef}
                    src={currentGame.images[0].url}
                    alt="Game background"
                    className="hidden"
                    onLoad={handleImageLoad}
                  />
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`border rounded-lg ${isGameActive ? 'cursor-crosshair' : 'cursor-default'}`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </>
              )}
              
              {isGameActive && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Cliquez sur l'image pour identifier les zones de risque
                </p>
              )}
              
              {gameCompleted && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Résumé du jeu</h3>
                  <p className="text-green-700">
                    Trouvé {gameSession?.foundZones.length} sur {currentGame.riskZones.length} risques
                  </p>
                  <p className="text-green-700">
                    Utilisé {gameSession?.clicks.length} sur {currentGame.maxClicks} clics
                  </p>
                  <p className="text-green-700">
                    Score final: {gameSession?.score}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}