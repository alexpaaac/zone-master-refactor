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
  const [selectedTool, setSelectedTool] = useState<'circle' | 'rectangle'>('circle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<RiskZone[][]>([]);
  const [redoStack, setRedoStack] = useState<RiskZone[][]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
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

  // Handle canvas mouse events
  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on existing zone
    const clickedZone = riskZones.find(zone => {
      if (zone.type === 'circle') {
        const distance = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
        return distance <= (zone.radius || 0);
      } else {
        return x >= zone.x && x <= zone.x + (zone.width || 0) &&
               y >= zone.y && y <= zone.y + (zone.height || 0);
      }
    });

    if (clickedZone) {
      setSelectedZone(clickedZone.id);
      return;
    }

    // Start drawing new zone
    saveToUndoStack();
    setIsDrawing(true);
    setSelectedZone(null);

    const newZone: RiskZone = {
      id: `zone-${Date.now()}`,
      type: selectedTool,
      x,
      y,
      color: '#ef4444',
      description: `Risk Zone ${riskZones.length + 1}`,
      severity: 'medium'
    };

    if (selectedTool === 'circle') {
      newZone.radius = 20;
    } else {
      newZone.width = 40;
      newZone.height = 40;
    }

    setRiskZones(prev => [...prev, newZone]);
  };

  // Draw risk zones on canvas
  const drawRiskZones = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw risk zones
    riskZones.forEach(zone => {
      ctx.strokeStyle = zone.id === selectedZone ? '#00ff00' : zone.color;
      ctx.lineWidth = zone.id === selectedZone ? 3 : 2;
      ctx.fillStyle = `${zone.color}30`;

      ctx.beginPath();
      
      if (zone.type === 'circle') {
        ctx.arc(zone.x, zone.y, zone.radius || 20, 0, 2 * Math.PI);
      } else {
        ctx.rect(zone.x, zone.y, zone.width || 40, zone.height || 40);
      }
      
      ctx.fill();
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const textX = zone.type === 'circle' ? zone.x : zone.x + (zone.width || 40) / 2;
      const textY = zone.type === 'circle' ? zone.y + 4 : zone.y + (zone.height || 40) / 2;
      ctx.fillText(zone.description, textX, textY);
    });
  };

  // Handle image load
  const handleImageLoad = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      canvas.width = imageRef.current.naturalWidth;
      canvas.height = imageRef.current.naturalHeight;
      drawRiskZones();
    }
  };

  // Redraw when zones change
  useEffect(() => {
    drawRiskZones();
  }, [riskZones, selectedZone]);

  // Delete selected zone
  const deleteSelectedZone = () => {
    if (selectedZone) {
      saveToUndoStack();
      setRiskZones(prev => prev.filter(zone => zone.id !== selectedZone));
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
        width: imageRef.current?.naturalWidth || 800,
        height: imageRef.current?.naturalHeight || 600,
        alt: selectedImage.name
      }],
      riskZones: riskZones.map(zone => ({
        ...zone,
        found: false
      })),
      timeLimit: gameConfig.timeLimit,
      maxClicks: gameConfig.maxClicks,
      difficulty: 'medium' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    updateCurrentGame(gameData);

    toast({
      title: "Success",
      description: "Game created successfully!",
      variant: "default"
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Game Builder</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            >
              <Redo className="h-4 w-4 mr-2" />
              Redo
            </Button>
            <Button onClick={handleCreateGame}>
              <Save className="h-4 w-4 mr-2" />
              Create Game
            </Button>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="image">Image & Zones</TabsTrigger>
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
                      <div className="flex gap-2">
                        <Button
                          variant={selectedTool === 'circle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('circle')}
                        >
                          <Circle className="h-4 w-4 mr-2" />
                          Circle
                        </Button>
                        <Button
                          variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedTool('rectangle')}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Rectangle
                        </Button>
                        {selectedZone && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedZone}
                          >
                            Delete Zone
                          </Button>
                        )}
                      </div>
                      
                      <div className="relative border rounded-lg overflow-hidden max-w-4xl">
                        <img
                          ref={imageRef}
                          src={imagePreview}
                          alt="Game background"
                          className="hidden"
                          onLoad={handleImageLoad}
                        />
                        <canvas
                          ref={canvasRef}
                          onMouseDown={handleCanvasMouseDown}
                          className="block max-w-full h-auto cursor-crosshair"
                          style={{ maxHeight: '600px' }}
                        />
                      </div>
                      
                      {riskZones.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Risk Zones ({riskZones.length})</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {riskZones.map((zone, index) => (
                              <div
                                key={zone.id}
                                className={`text-sm p-2 rounded border cursor-pointer ${
                                  selectedZone === zone.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                }`}
                                onClick={() => setSelectedZone(zone.id)}
                              >
                                {index + 1}. {zone.description} ({zone.type})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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