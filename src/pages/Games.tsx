import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Users,
  Share,
  Eye,
  EyeOff,
  Globe,
  Link,
  Calendar,
  Building
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedGameForShare, setSelectedGameForShare] = useState<any>(null);

  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || game.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || game.publishStatus === filterStatus;
    const matchesCompany = filterCompany === 'all' || game.assignedCompany === filterCompany;
    return matchesSearch && matchesDifficulty && matchesStatus && matchesCompany;
  });

  // Get unique companies for filter
  const companies = [...new Set(games.map(g => g.assignedCompany).filter(Boolean))];

  // Generate shareable link
  const generateShareableLink = (gameId: string) => {
    return `${window.location.origin}/play/shared/${gameId}`;
  };

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

  const handlePublishToggle = (game: any) => {
    const newStatus = game.publishStatus === 'published' ? 'draft' : 'published';
    const updates = {
      publishStatus: newStatus,
      publishedAt: newStatus === 'published' ? new Date().toISOString() : undefined,
      shareableLink: newStatus === 'published' ? generateShareableLink(game.id) : undefined
    };
    
    // In a real app, this would update via API
    toast({
      title: newStatus === 'published' ? "Game Published" : "Game Unpublished",
      description: `${game.title} is now ${newStatus}`,
      variant: "default"
    });
  };

  const handleShareGame = (game: any) => {
    if (game.publishStatus !== 'published') {
      toast({
        title: "Game Not Published",
        description: "You must publish the game before sharing",
        variant: "destructive"
      });
      return;
    }
    setSelectedGameForShare(game);
    setShareDialogOpen(true);
  };

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard",
      variant: "default"
    });
  };

  const handleDuplicateGame = (game: any) => {
    const duplicatedGame = {
      ...game,
      id: `game-${Date.now()}`,
      title: `${game.title} (Copy)`,
      publishStatus: 'draft',
      publishedAt: undefined,
      shareableLink: undefined,
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
            <div className="flex flex-col lg:flex-row gap-4">
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
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                
                {companies.length > 0 && (
                  <Select value={filterCompany} onValueChange={setFilterCompany}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <Badge variant={game.publishStatus === 'published' ? 'default' : 'secondary'}>
                          {game.publishStatus === 'published' ? (
                            <><Globe className="h-3 w-3 mr-1" />Published</>
                          ) : (
                            <><Edit className="h-3 w-3 mr-1" />Draft</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {game.description}
                      </p>
                      {game.assignedCompany && (
                        <div className="flex items-center gap-1 mt-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{game.assignedCompany}</span>
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
                      variant={game.publishStatus === 'published' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePublishToggle(game)}
                    >
                      {game.publishStatus === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {game.publishStatus === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareGame(game)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    )}
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
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Created: {new Date(game.createdAt).toLocaleDateString()}</span>
                      {game.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    {game.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Published: {new Date(game.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Game</DialogTitle>
              <DialogDescription>
                Share this game with external organizations
              </DialogDescription>
            </DialogHeader>
            
            {selectedGameForShare && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{selectedGameForShare.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedGameForShare.description}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Shareable Link:</label>
                  <div className="flex gap-2">
                    <Input 
                      value={selectedGameForShare.shareableLink || generateShareableLink(selectedGameForShare.id)}
                      readOnly
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => copyShareLink(selectedGameForShare.shareableLink || generateShareableLink(selectedGameForShare.id))}
                      variant="outline"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Share this link with organizations like Lidl, Yoplait, or other companies to let them test their employees with this risk assessment game.
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}