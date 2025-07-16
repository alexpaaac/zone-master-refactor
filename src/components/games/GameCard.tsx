import { useState } from 'react';
import { 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  Clock, 
  Target, 
  Shield,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Game } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: Game;
  onPlay?: (game: Game) => void;
  onEdit?: (game: Game) => void;
  onDuplicate?: (game: Game) => void;
  onDelete?: (game: Game) => void;
  onPreview?: (game: Game) => void;
}

const difficultyColors = {
  easy: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  hard: 'bg-danger/20 text-danger border-danger/30',
  expert: 'bg-destructive/20 text-destructive border-destructive/30'
};

export function GameCard({ 
  game, 
  onPlay, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onPreview 
}: GameCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!onPlay) return;
    setIsLoading(true);
    try {
      await onPlay(game);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryImage = game.images[0];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-elevated group">
      {/* Game image */}
      <div className="relative h-48 overflow-hidden bg-canvas-bg">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || game.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-surface">
            <Shield className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={game.isActive ? "default" : "secondary"}
            className={cn(
              "text-xs",
              game.isActive && "bg-success text-success-foreground"
            )}
          >
            {game.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Quick preview button */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
            onClick={() => onPreview?.(game)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg line-clamp-2">{game.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {game.description}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(game)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(game)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(game)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Game stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>{game.riskZones.length} zones</span>
          </div>
          
          {game.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(game.timeLimit / 60)}:{(game.timeLimit % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
          
          {game.maxClicks && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{game.maxClicks} clicks</span>
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="flex justify-between items-center">
          <Badge className={difficultyColors[game.difficulty]}>
            {game.difficulty.toUpperCase()}
          </Badge>
          
          <span className="text-xs text-muted-foreground">
            Updated {new Date(game.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      <CardFooter className="gap-2">
        <Button
          variant="gaming"
          className="flex-1"
          onClick={handlePlay}
          disabled={isLoading || !game.isActive}
        >
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? 'Starting...' : 'Play Game'}
        </Button>
        
        <Button
          variant="gaming-outline"
          size="icon"
          onClick={() => onEdit?.(game)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}