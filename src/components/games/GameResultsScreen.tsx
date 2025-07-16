import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react';
import { Game, GameSession } from '@/types';

interface GameResultsScreenProps {
  game: Game;
  session: GameSession;
  playerName: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function GameResultsScreen({
  game,
  session,
  playerName,
  onPlayAgain,
  onBackToMenu
}: GameResultsScreenProps) {
  const foundZones = game.riskZones.filter(zone => session.foundZones.includes(zone.id));
  const missedZones = game.riskZones.filter(zone => !session.foundZones.includes(zone.id));
  const accuracy = Math.round((foundZones.length / game.riskZones.length) * 100);
  const timeSpent = (game.timeLimit || 300) - session.timeSpent;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Excellent! Outstanding safety awareness!";
    if (accuracy >= 75) return "Great job! Good safety knowledge demonstrated.";
    if (accuracy >= 60) return "Good work! Room for improvement in risk identification.";
    if (accuracy >= 40) return "Fair performance. More training recommended.";
    return "Poor performance. Additional safety training required.";
  };

  const getPerformanceColor = () => {
    if (accuracy >= 90) return "text-green-700 bg-green-50 border-green-200";
    if (accuracy >= 75) return "text-blue-700 bg-blue-50 border-blue-200";
    if (accuracy >= 60) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    if (accuracy >= 40) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`border-2 ${getPerformanceColor()}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">
            Game Complete, {playerName}!
          </CardTitle>
          <div className="text-lg font-semibold">
            {getPerformanceMessage()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{session.score}</div>
              <div className="text-sm text-muted-foreground">Final Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{foundZones.length}/{game.riskZones.length}</div>
              <div className="text-sm text-muted-foreground">Risks Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{formatTime(session.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Found Risks */}
      {foundZones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Risks Successfully Identified ({foundZones.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {foundZones.map((zone, index) => (
                <div
                  key={zone.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 border-green-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-green-800">
                        Risk Zone {foundZones.indexOf(zone) + 1}
                      </h4>
                      <Badge className={getSeverityColor(zone.severity)}>
                        {zone.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700">
                      {zone.description}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {zone.type} at position ({Math.round(zone.x)}, {Math.round(zone.y)})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missed Risks */}
      {missedZones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Risks Missed ({missedZones.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {missedZones.map((zone, index) => (
                <div
                  key={zone.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-red-50 border-red-200"
                >
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-red-800">
                        Risk Zone {missedZones.indexOf(zone) + 1}
                      </h4>
                      <Badge className={getSeverityColor(zone.severity)}>
                        {zone.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700">
                      {zone.description}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {zone.type} at position ({Math.round(zone.x)}, {Math.round(zone.y)})
                    </p>
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      <strong>Learning Point:</strong> This risk zone represents a significant safety concern. 
                      In a real scenario, missing this could lead to {
                        zone.severity === 'critical' ? 'severe injury or death' :
                        zone.severity === 'high' ? 'serious injury' :
                        zone.severity === 'medium' ? 'moderate injury' :
                        'minor injury or property damage'
                      }.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onPlayAgain} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Play Again
        </Button>
        <Button onClick={onBackToMenu} variant="outline" size="lg" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Back to Games
        </Button>
      </div>
    </div>
  );
}