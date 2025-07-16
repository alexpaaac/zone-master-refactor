import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2, Save, X } from 'lucide-react';

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

interface RiskZoneEditorProps {
  zones: RiskZone[];
  selectedZoneId: string | null;
  onZoneUpdate: (zoneId: string, updates: Partial<RiskZone>) => void;
  onZoneDelete: (zoneId: string) => void;
  onZoneSelect: (zoneId: string | null) => void;
}

export function RiskZoneEditor({
  zones,
  selectedZoneId,
  onZoneUpdate,
  onZoneDelete,
  onZoneSelect
}: RiskZoneEditorProps) {
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RiskZone>>({});

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const startEditing = (zone: RiskZone) => {
    setEditingZone(zone.id);
    setEditForm({
      description: zone.description,
      severity: zone.severity,
      color: zone.color,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      radius: zone.radius
    });
  };

  const cancelEditing = () => {
    setEditingZone(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingZone && editForm) {
      onZoneUpdate(editingZone, editForm);
      setEditingZone(null);
      setEditForm({});
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (zones.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No risk zones created yet. Click on the image to add zones.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk Zones ({zones.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {zones.map((zone, index) => (
          <div
            key={zone.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedZoneId === zone.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:bg-accent'
            }`}
            onClick={() => onZoneSelect(zone.id === selectedZoneId ? null : zone.id)}
          >
            {editingZone === zone.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="text-xs"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Severity</Label>
                    <Select
                      value={editForm.severity || zone.severity}
                      onValueChange={(value) => setEditForm({ ...editForm, severity: value as RiskZone['severity'] })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Position X</Label>
                    <Input
                      type="number"
                      value={editForm.x || zone.x}
                      onChange={(e) => setEditForm({ ...editForm, x: parseInt(e.target.value) })}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Position Y</Label>
                    <Input
                      type="number"
                      value={editForm.y || zone.y}
                      onChange={(e) => setEditForm({ ...editForm, y: parseInt(e.target.value) })}
                      className="text-xs"
                    />
                  </div>
                </div>

                {zone.type === 'rectangle' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Width</Label>
                      <Input
                        type="number"
                        value={editForm.width || zone.width || 0}
                        onChange={(e) => setEditForm({ ...editForm, width: parseInt(e.target.value) })}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Height</Label>
                      <Input
                        type="number"
                        value={editForm.height || zone.height || 0}
                        onChange={(e) => setEditForm({ ...editForm, height: parseInt(e.target.value) })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">Radius</Label>
                    <Input
                      type="number"
                      value={editForm.radius || zone.radius || 0}
                      onChange={(e) => setEditForm({ ...editForm, radius: parseInt(e.target.value) })}
                      className="text-xs"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editForm.color || zone.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={editForm.color || zone.color}
                      onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                      className="text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEditing} className="flex-1">
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {index + 1}. {zone.description}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {zone.type} at ({Math.round(zone.x)}, {Math.round(zone.y)})
                      {zone.type === 'rectangle' 
                        ? ` - ${zone.width}×${zone.height}` 
                        : ` - r:${zone.radius}`
                      }
                    </p>
                  </div>
                  <Badge className={`text-xs ${getSeverityColor(zone.severity)}`}>
                    {zone.severity}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(zone);
                    }}
                    className="flex-1"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoneDelete(zone.id);
                    }}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}