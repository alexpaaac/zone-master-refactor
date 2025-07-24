import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Clock,
  Award,
  Download,
  Filter,
  FileText,
  Eye
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

export default function Analytics() {
  const { games } = useApp();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<string>('all');

  // Données d'analytics simulées
  const analyticsData = {
    totalGames: games.length,
    totalPlayers: 127,
    totalSessions: 342,
    averageScore: 78.5,
    averageCompletionTime: 245,
    averageAccuracy: 82.3,
    topPerformers: [
      { name: 'Sarah Dubois', score: 95, accuracy: 94, time: 180, company: 'Lidl France' },
      { name: 'Marc Chen', score: 92, accuracy: 91, time: 210, company: 'Yoplait' },
      { name: 'Emma Martin', score: 89, accuracy: 88, time: 195, company: 'Carrefour' }
    ],
    gamePerformance: [
      { 
        gameId: '1',
        gameTitle: 'Évaluation de Sécurité Industrielle', 
        avgScore: 85, 
        sessions: 45,
        participants: [
          { name: 'Pierre Durand', score: 88, time: 180, company: 'Lidl France', zones: [1,2,3], missedZones: [4] },
          { name: 'Marie Leroy', score: 92, time: 165, company: 'Lidl France', zones: [1,2,3,4], missedZones: [] }
        ]
      },
      { 
        gameId: '2',
        gameTitle: 'Procédures de Manipulation Chimique', 
        avgScore: 78, 
        sessions: 32,
        participants: [
          { name: 'Jean Moreau', score: 82, time: 220, company: 'Yoplait', zones: [1,3], missedZones: [2,4] },
          { name: 'Sophie Bernard', score: 74, time: 245, company: 'Yoplait', zones: [1,2], missedZones: [3,4] }
        ]
      },
      { 
        gameId: '3',
        gameTitle: 'Itinéraires d\'Évacuation d\'Urgence', 
        avgScore: 82, 
        sessions: 28,
        participants: [
          { name: 'David Laurent', score: 85, time: 200, company: 'Carrefour', zones: [1,2,4], missedZones: [3] }
        ]
      }
    ],
    riskCategoryStats: [
      { category: 'Électrique', identified: 89, missed: 11, accuracy: 89 },
      { category: 'Chimique', identified: 76, missed: 24, accuracy: 76 },
      { category: 'Mécanique', identified: 92, missed: 8, accuracy: 92 },
      { category: 'Sécurité', identified: 84, missed: 16, accuracy: 84 }
    ]
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrer les données par jeu sélectionné
  const getFilteredData = () => {
    if (selectedGame === 'all') {
      return analyticsData;
    }
    
    const gameData = analyticsData.gamePerformance.find(g => g.gameId === selectedGame);
    if (!gameData) return analyticsData;
    
    return {
      ...analyticsData,
      totalSessions: gameData.sessions,
      averageScore: gameData.avgScore,
      gamePerformance: [gameData]
    };
  };

  // Export CSV pour un jeu spécifique
  const exportGameCSV = (gameId: string) => {
    const gameData = analyticsData.gamePerformance.find(g => g.gameId === gameId);
    if (!gameData) return;

    const csvData = [
      ['Nom du Joueur', 'Entreprise', 'Score', 'Temps (min)', 'Zones Trouvées', 'Zones Manquées', 'Précision (%)'],
      ...gameData.participants.map(p => [
        p.name,
        p.company,
        p.score.toString(),
        Math.round(p.time / 60).toString(),
        p.zones.length.toString(),
        p.missedZones.length.toString(),
        Math.round((p.zones.length / (p.zones.length + p.missedZones.length)) * 100).toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `analyse-${gameData.gameTitle.replace(/\s+/g, '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Réussi",
      description: `Données exportées pour "${gameData.gameTitle}"`,
      variant: "default"
    });
  };

  // Export général CSV
  const exportGeneralCSV = () => {
    const csvData = [
      ['Jeu', 'Joueur', 'Entreprise', 'Score', 'Temps (min)', 'Précision (%)'],
      ...analyticsData.gamePerformance.flatMap(game => 
        game.participants.map(p => [
          game.gameTitle,
          p.name,
          p.company,
          p.score.toString(),
          Math.round(p.time / 60).toString(),
          Math.round((p.zones.length / (p.zones.length + p.missedZones.length)) * 100).toString()
        ])
      )
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'rapport-analytics-general.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Réussi",
      description: "Rapport général exporté avec succès",
      variant: "default"
    });
  };

  const filteredData = getFilteredData();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Analyses de performance et statistiques</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrer par jeu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les jeux</SelectItem>
                {analyticsData.gamePerformance.map((game) => (
                  <SelectItem key={game.gameId} value={game.gameId}>
                    {game.gameTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportGeneralCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Métriques Clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredData.totalGames}</p>
                  <p className="text-sm text-muted-foreground">Jeux Totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredData.totalPlayers}</p>
                  <p className="text-sm text-muted-foreground">Joueurs Totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredData.averageScore.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Score Moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{formatTime(filteredData.averageCompletionTime)}</p>
                  <p className="text-sm text-muted-foreground">Temps Moyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meilleurs Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Meilleurs Performers
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
                          {performer.company} • {performer.accuracy}% précision • {formatTime(performer.time)}
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

          {/* Performance par Jeu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance par Jeu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.gamePerformance.map((game) => (
                  <div key={game.gameTitle} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{game.gameTitle}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">{game.sessions} sessions</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => exportGameCSV(game.gameId)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          CSV
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Score Moyen</span>
                      <span className="font-semibold">{game.avgScore}</span>
                    </div>
                    {selectedGame !== 'all' && game.participants && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium">Participants ({game.participants.length})</h5>
                        {game.participants.map((participant, idx) => (
                          <div key={idx} className="text-xs bg-muted p-2 rounded">
                            <div className="flex justify-between">
                              <span>{participant.name} ({participant.company})</span>
                              <span>Score: {participant.score}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Zones trouvées: {participant.zones.length}</span>
                              <span>Temps: {formatTime(participant.time)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyse par Catégorie de Risque */}
        <Card>
          <CardHeader>
            <CardTitle>Analyse par Catégorie de Risque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.riskCategoryStats.map((category) => (
                <div key={category.category} className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">{category.category}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Identifiés:</span>
                      <span className="text-green-600 font-medium">{category.identified}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Manqués:</span>
                      <span className="text-red-600 font-medium">{category.missed}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Précision:</span>
                      <span className="font-medium">{category.accuracy}%</span>
                    </div>
                  </div>
                  
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

        {/* Statistiques Supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taux de Complétion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">87.3%</p>
                <p className="text-sm text-muted-foreground">Jeux terminés</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Précision Moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{analyticsData.averageAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Identification des risques</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessions Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">{filteredData.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Jeux joués</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}