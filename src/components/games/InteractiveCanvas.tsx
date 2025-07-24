import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Square, 
  Circle, 
  MousePointer, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Save
} from 'lucide-react';
import { RiskZone } from '@/types';

interface Point {
  x: number;
  y: number;
}

interface InteractiveCanvasProps {
  imageUrl: string;
  imageAlt?: string;
  zones: RiskZone[];
  onZoneCreate: (zone: Omit<RiskZone, 'id'>) => void;
  onZoneUpdate: (zoneId: string, updates: Partial<RiskZone>) => void;
  onZoneDelete: (zoneId: string) => void;
  selectedZoneId?: string;
  onZoneSelect: (zoneId: string | null) => void;
}

type DrawingMode = 'select' | 'rectangle' | 'circle';

export function InteractiveCanvas({
  imageUrl,
  imageAlt = 'Game image',
  zones,
  onZoneCreate,
  onZoneUpdate,
  onZoneDelete,
  selectedZoneId,
  onZoneSelect
}: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [mode, setMode] = useState<DrawingMode>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  // Load and draw image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (imageRef.current) {
        imageRef.current = img;
        setCanvasDimensions({ width: img.width, height: img.height });
        setImageLoaded(true);
        redrawCanvas();
      }
    };
    img.src = imageUrl;
    imageRef.current = img;
  }, [imageUrl]);

  // Redraw canvas with image and zones
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img || !imageLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Draw existing zones
    zones.forEach(zone => {
      drawZone(ctx, zone, zone.id === selectedZoneId);
    });
    
    // Draw current drawing
    if (isDrawing && startPoint && currentPoint) {
      drawPreviewZone(ctx);
    }
  }, [zones, selectedZoneId, isDrawing, startPoint, currentPoint, imageLoaded]);

  // Draw a zone on canvas
  const drawZone = (ctx: CanvasRenderingContext2D, zone: RiskZone, isSelected: boolean) => {
    ctx.save();
    
    // Set zone color
    ctx.fillStyle = zone.color + '40'; // Semi-transparent
    ctx.strokeStyle = isSelected ? '#ffffff' : zone.color;
    ctx.lineWidth = isSelected ? 3 : 2;
    
    if (zone.type === 'rectangle' && zone.width && zone.height) {
      ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    } else if (zone.type === 'circle' && zone.radius) {
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw zone label
    if (isSelected) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      const labelX = zone.type === 'circle' ? zone.x : zone.x + (zone.width || 0) / 2;
      const labelY = zone.type === 'circle' ? zone.y : zone.y + (zone.height || 0) / 2;
      
      ctx.strokeText(zone.description, labelX, labelY);
      ctx.fillText(zone.description, labelX, labelY);
    }
    
    ctx.restore();
  };

  // Draw preview zone while drawing
  const drawPreviewZone = (ctx: CanvasRenderingContext2D) => {
    if (!startPoint || !currentPoint) return;
    
    ctx.save();
    ctx.fillStyle = '#3b82f6' + '40';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    if (mode === 'rectangle') {
      const width = currentPoint.x - startPoint.x;
      const height = currentPoint.y - startPoint.y;
      ctx.fillRect(startPoint.x, startPoint.y, width, height);
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (mode === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) + 
        Math.pow(currentPoint.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (mode === 'select') {
      // Check if clicking on existing zone
      const clickedZone = zones.find(zone => {
        if (zone.type === 'rectangle' && zone.width && zone.height) {
          return pos.x >= zone.x && pos.x <= zone.x + zone.width &&
                 pos.y >= zone.y && pos.y <= zone.y + zone.height;
        } else if (zone.type === 'circle' && zone.radius) {
          const distance = Math.sqrt(
            Math.pow(pos.x - zone.x, 2) + Math.pow(pos.y - zone.y, 2)
          );
          return distance <= zone.radius;
        }
        return false;
      });
      
      onZoneSelect(clickedZone ? clickedZone.id : null);
    } else {
      // Start drawing new zone
      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentPoint(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      const pos = getMousePos(e);
      setCurrentPoint(pos);
      redrawCanvas();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && startPoint && currentPoint) {
      const pos = getMousePos(e);
      
      // Create new zone
      if (mode === 'rectangle') {
        const width = Math.abs(pos.x - startPoint.x);
        const height = Math.abs(pos.y - startPoint.y);
        
        if (width > 10 && height > 10) { // Minimum size
          const newZone: Omit<RiskZone, 'id'> = {
            type: 'rectangle',
            x: Math.min(startPoint.x, pos.x),
            y: Math.min(startPoint.y, pos.y),
            width,
            height,
            color: '#ef4444',
            description: `Risk Zone ${zones.length + 1}`,
            severity: 'medium'
          };
          onZoneCreate(newZone);
        }
      } else if (mode === 'circle') {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPoint.x, 2) + 
          Math.pow(pos.y - startPoint.y, 2)
        );
        
        if (radius > 10) { // Minimum radius
          const newZone: Omit<RiskZone, 'id'> = {
            type: 'circle',
            x: startPoint.x,
            y: startPoint.y,
            radius,
            color: '#ef4444',
            description: `Risk Zone ${zones.length + 1}`,
            severity: 'medium'
          };
          onZoneCreate(newZone);
        }
      }
      
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      setMode('select');
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  // Delete selected zone
  const handleDeleteSelected = () => {
    if (selectedZoneId) {
      onZoneDelete(selectedZoneId);
      onZoneSelect(null);
    }
  };

  // Update canvas when zones change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Interactive Zone Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {zones.length} zone{zones.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={mode === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('select')}
          >
            <MousePointer className="h-4 w-4 mr-1" />
            Select
          </Button>
          
          <Button
            variant={mode === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('rectangle')}
          >
            <Square className="h-4 w-4 mr-1" />
            Rectangle
          </Button>
          
          <Button
            variant={mode === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('circle')}
          >
            <Circle className="h-4 w-4 mr-1" />
            Circle
          </Button>
          
          <div className="border-l pl-2 flex gap-1">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedZoneId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={containerRef}
          className="relative overflow-auto border rounded-lg"
          style={{ maxHeight: '70vh' }}
        >
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            className="block cursor-crosshair"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              maxWidth: '100%'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDrawing(false);
              setStartPoint(null);
              setCurrentPoint(null);
            }}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Loading image...</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Instructions:</strong> 
            {mode === 'select' && ' Click on zones to select them'}
            {mode === 'rectangle' && ' Click and drag to draw rectangles'}
            {mode === 'circle' && ' Click and drag to draw circles (from center outward)'}
          </p>
          <p className="mt-1">
            Scale: {Math.round(scale * 100)}% | 
            Zones: {zones.length} | 
            {selectedZoneId && ` Selected: ${zones.find(z => z.id === selectedZoneId)?.description}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}