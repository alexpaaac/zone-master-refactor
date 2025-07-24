import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, Circle, Square, Undo, Redo, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { RiskZoneEditor } from '@/components/games/RiskZoneEditor';
import { InteractiveCanvas } from '@/components/games/InteractiveCanvas';

interface GameConfig {
  name: string;
  description: string;
  timeLimit: number;
  maxClicks: number;
  targetRisks: number;
  isPublic: boolean;
}

interface RiskZone {
  id: string;
  type: 'circle' | 'rectangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function GameBuilder() {
  const { toast } = useToast();
  const { updateCurrentGame } = useApp();
  
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    name: '',
    description: '',
    timeLimit: 300,
    maxClicks: 17,
    targetRisks: 15,
    isPublic: false
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<RiskZone[][]>([]);
  const [redoStack, setRedoStack] = useState<RiskZone[][]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save to undo stack
  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(riskZones))]);
    setRedoStack([]);
  };

  // Undo functionality
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(riskZones))]);
      setRiskZones(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Redo functionality
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(riskZones))]);
      setRiskZones(nextState);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };

  // Create zone handler for InteractiveCanvas
  const handleZoneCreate = (zone: Omit<RiskZone, 'id'>) => {
    saveToUndoStack();
    const newZone: RiskZone = {
      ...zone,
      id: `zone-${Date.now()}`
    };
    setRiskZones(prev => [...prev, newZone]);
  };

  // Update risk zone
  const handleZoneUpdate = (zoneId: string, updates: Partial<RiskZone>) => {
    saveToUndoStack();
    setRiskZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, ...updates } : zone
    ));
  };

  // Delete risk zone
  const handleZoneDelete = (zoneId: string) => {
    saveToUndoStack();
    setRiskZones(prev => prev.filter(zone => zone.id !== zoneId));
    if (selectedZone === zoneId) {
      setSelectedZone(null);
    }
  };

  // Create game
  const handleCreateGame = () => {
    if (!gameConfig.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a game name",
        variant: "destructive"
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "Error", 
        description: "Please select an image",
        variant: "destructive"
      });
      return;
    }

    if (riskZones.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one risk zone",
        variant: "destructive"
      });
      return;
    }

    // Create game object
    const gameData = {
      id: `game-${Date.now()}`,
      title: gameConfig.name,
      description: gameConfig.description,
      images: [{
        id: `img-${Date.now()}`,
        url: imagePreview,
        width: 800, // Standard width for now
        height: 600, // Standard height for now
        alt: selectedImage.name
      }],
      riskZones: riskZones.map(zone => ({
        ...zone,
        found: false
      })),
      timeLimit: gameConfig.timeLimit,
      maxClicks: gameConfig.maxClicks,
      targetRisks: gameConfig.targetRisks,
      difficulty: 'medium' as const,
      publishStatus: 'draft' as const,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    updateCurrentGame(gameData);

    toast({
      title: "Succès",
      description: "Jeu créé avec succès ! Vous pouvez maintenant y jouer.",
      variant: "default"
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Créateur de jeu</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            >
              <Redo className="h-4 w-4 mr-2" />
              Refaire
            </Button>
            <Button onClick={handleCreateGame}>
              <Save className="h-4 w-4 mr-2" />
              Créer le jeu
            </Button>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="image">Image et zones</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Game Name</Label>
                    <Input
                      id="name"
                      value={gameConfig.name}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter game name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={gameConfig.timeLimit}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxClicks">Max Clicks</Label>
                    <Input
                      id="maxClicks"
                      type="number"
                      value={gameConfig.maxClicks}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, maxClicks: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetRisks">Target Risks</Label>
                    <Input
                      id="targetRisks"
                      type="number"
                      value={gameConfig.targetRisks}
                      onChange={(e) => setGameConfig(prev => ({ ...prev, targetRisks: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={gameConfig.description}
                    onChange={(e) => setGameConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter game description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={gameConfig.isPublic}
                    onCheckedChange={(checked) => setGameConfig(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="public">Make game public</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  
                  {imagePreview && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <InteractiveCanvas
                            imageUrl={imagePreview}
                            imageAlt="Game background"
                            zones={riskZones}
                            onZoneCreate={handleZoneCreate}
                            onZoneUpdate={handleZoneUpdate}
                            onZoneDelete={handleZoneDelete}
                            selectedZoneId={selectedZone}
                            onZoneSelect={setSelectedZone}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <RiskZoneEditor
                            zones={riskZones}
                            selectedZoneId={selectedZone}
                            onZoneUpdate={handleZoneUpdate}
                            onZoneDelete={handleZoneDelete}
                            onZoneSelect={setSelectedZone}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}