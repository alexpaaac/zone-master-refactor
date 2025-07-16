import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface RiskZoneTemplate {
  id: string;
  name: string;
  description: string;
  type: 'circle' | 'rectangle';
  defaultSize: { width?: number; height?: number; radius?: number };
  color: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

export default function RiskZones() {
  const { toast } = useToast();
  const { games } = useApp();
  
  const [selectedTemplate, setSelectedTemplate] = useState<RiskZoneTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<RiskZoneTemplate>>({
    name: '',
    description: '',
    type: 'circle',
    color: '#ef4444',
    severity: 'medium',
    category: 'safety'
  });

  // Mock risk zone templates
  const [templates, setTemplates] = useState<RiskZoneTemplate[]>([
    {
      id: '1',
      name: 'Electrical Hazard',
      description: 'Live electrical components or exposed wiring',
      type: 'circle',
      defaultSize: { radius: 25 },
      color: '#eab308',
      severity: 'high',
      category: 'electrical'
    },
    {
      id: '2',
      name: 'Fall Risk',
      description: 'Areas with potential for falls or drops',
      type: 'rectangle',
      defaultSize: { width: 60, height: 40 },
      color: '#ef4444',
      severity: 'critical',
      category: 'safety'
    },
    {
      id: '3',
      name: 'Chemical Spill',
      description: 'Chemical storage or spill areas',
      type: 'circle',
      defaultSize: { radius: 30 },
      color: '#8b5cf6',
      severity: 'high',
      category: 'chemical'
    },
    {
      id: '4',
      name: 'Moving Machinery',
      description: 'Equipment with moving parts',
      type: 'rectangle',
      defaultSize: { width: 80, height: 60 },
      color: '#f97316',
      severity: 'medium',
      category: 'mechanical'
    }
  ]);

  // Get all risk zones from all games
  const getAllRiskZones = () => {
    const allZones: any[] = [];
    games.forEach(game => {
      game.riskZones.forEach(zone => {
        allZones.push({
          ...zone,
          gameTitle: game.title,
          gameId: game.id
        });
      });
    });
    return allZones;
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const template: RiskZoneTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      type: newTemplate.type || 'circle',
      defaultSize: newTemplate.type === 'circle' 
        ? { radius: 25 } 
        : { width: 50, height: 40 },
      color: newTemplate.color || '#ef4444',
      severity: newTemplate.severity || 'medium',
      category: newTemplate.category || 'safety'
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      description: '',
      type: 'circle',
      color: '#ef4444',
      severity: 'medium',
      category: 'safety'
    });
    setIsCreating(false);

    toast({
      title: "Template Created",
      description: `Created new template: ${template.name}`,
      variant: "default"
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Template Deleted",
      description: "Risk zone template has been removed",
      variant: "destructive"
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle2;
      case 'medium': return Shield;
      case 'high': return AlertTriangle;
      case 'critical': return Target;
      default: return Shield;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Zones</h1>
            <p className="text-muted-foreground">Manage risk zone templates and existing zones</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="zones">All Zones</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Create New Template */}
            {isCreating && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Electrical Hazard"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTemplate.category}
                        onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="chemical">Chemical</SelectItem>
                          <SelectItem value="mechanical">Mechanical</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Shape Type</Label>
                      <Select
                        value={newTemplate.type}
                        onValueChange={(value: 'circle' | 'rectangle') => setNewTemplate(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rectangle">Rectangle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={newTemplate.severity}
                        onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                          setNewTemplate(prev => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="color"
                          type="color"
                          value={newTemplate.color}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-10 border rounded"
                        />
                        <Input
                          value={newTemplate.color}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, color: e.target.value }))}
                          placeholder="#ef4444"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this type of risk zone..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate}>
                      Create Template
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const SeverityIcon = getSeverityIcon(template.severity);
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: template.color }}
                            />
                            {template.name}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <SeverityIcon className={`h-4 w-4 ${getSeverityColor(template.severity)}`} />
                          <span className={`text-sm ${getSeverityColor(template.severity)}`}>
                            {template.severity}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Type: {template.type}</p>
                        {template.type === 'circle' ? (
                          <p>Default radius: {template.defaultSize.radius}px</p>
                        ) : (
                          <p>Default size: {template.defaultSize.width}×{template.defaultSize.height}px</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-6">
            {/* All Risk Zones from Games */}
            <Card>
              <CardHeader>
                <CardTitle>All Risk Zones ({getAllRiskZones().length})</CardTitle>
              </CardHeader>
              <CardContent>
                {getAllRiskZones().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No risk zones found in any games</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getAllRiskZones().map((zone, index) => (
                      <div key={`${zone.gameId}-${zone.id}`} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: zone.color }}
                            />
                            <div>
                              <h4 className="font-medium">{zone.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                From: {zone.gameTitle}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">
                              {zone.type}
                            </Badge>
                            <Badge variant={
                              zone.severity === 'low' ? 'outline' :
                              zone.severity === 'medium' ? 'secondary' :
                              zone.severity === 'high' ? 'default' : 'destructive'
                            }>
                              {zone.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}