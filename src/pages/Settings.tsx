import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Upload,
  Save,
  RefreshCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  defaultTimeLimit: number;
  defaultMaxClicks: number;
  defaultTargetRisks: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fr';
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

interface BrandingConfig {
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  customCSS: string;
}

export default function Settings() {
  const { toast } = useToast();
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    defaultTimeLimit: 300,
    defaultMaxClicks: 17,
    defaultTargetRisks: 15,
    enableAutoSave: true,
    autoSaveInterval: 30,
    theme: 'system',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    companyName: 'Acapella',
    primaryColor: '#3b82f6',
    secondaryColor: '#ef4444',
    logo: '',
    customCSS: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setBrandingConfig(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save system settings
  const saveSystemSettings = () => {
    // In a real app, this would save to backend/localStorage
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
    
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully",
      variant: "default"
    });
  };

  // Save branding settings
  const saveBrandingSettings = () => {
    // In a real app, this would save to backend/localStorage
    localStorage.setItem('brandingConfig', JSON.stringify(brandingConfig));
    
    // Apply CSS variables for theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', brandingConfig.primaryColor);
    root.style.setProperty('--secondary-color', brandingConfig.secondaryColor);
    
    toast({
      title: "Branding Saved",
      description: "Branding settings have been updated successfully",
      variant: "default"
    });
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSystemConfig({
      defaultTimeLimit: 300,
      defaultMaxClicks: 17,
      defaultTargetRisks: 15,
      enableAutoSave: true,
      autoSaveInterval: 30,
      theme: 'system',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    });

    setBrandingConfig({
      companyName: 'Acapella',
      primaryColor: '#3b82f6',
      secondaryColor: '#ef4444',
      logo: '',
      customCSS: ''
    });

    setLogoPreview('');
    
    toast({
      title: "Reset Complete",
      description: "All settings have been reset to defaults",
      variant: "default"
    });
  };

  // Load settings on mount
  React.useEffect(() => {
    const savedSystemConfig = localStorage.getItem('systemConfig');
    const savedBrandingConfig = localStorage.getItem('brandingConfig');
    
    if (savedSystemConfig) {
      setSystemConfig(JSON.parse(savedSystemConfig));
    }
    
    if (savedBrandingConfig) {
      const config = JSON.parse(savedBrandingConfig);
      setBrandingConfig(config);
      if (config.logo) {
        setLogoPreview(config.logo);
      }
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Restaurer par défaut
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="h-4 w-4 mr-2" />
              Image de marque
            </TabsTrigger>
            <TabsTrigger value="localization">
              <Globe className="h-4 w-4 mr-2" />
              Localisation
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Avancé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres par défaut des jeux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTimeLimit">Limite de temps par défaut (secondes)</Label>
                    <Input
                      id="defaultTimeLimit"
                      type="number"
                      value={systemConfig.defaultTimeLimit}
                      onChange={(e) => setSystemConfig(prev => ({ 
                        ...prev, 
                        defaultTimeLimit: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultMaxClicks">Nombre max de clics par défaut</Label>
                    <Input
                      id="defaultMaxClicks"
                      type="number"
                      value={systemConfig.defaultMaxClicks}
                      onChange={(e) => setSystemConfig(prev => ({ 
                        ...prev, 
                        defaultMaxClicks: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultTargetRisks">Risques cibles par défaut</Label>
                    <Input
                      id="defaultTargetRisks"
                      type="number"
                      value={systemConfig.defaultTargetRisks}
                      onChange={(e) => setSystemConfig(prev => ({ 
                        ...prev, 
                        defaultTargetRisks: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
                
                <Button onClick={saveSystemSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres par défaut
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sauvegarde automatique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableAutoSave"
                    checked={systemConfig.enableAutoSave}
                    onCheckedChange={(checked) => setSystemConfig(prev => ({ 
                      ...prev, 
                      enableAutoSave: checked 
                    }))}
                  />
                  <Label htmlFor="enableAutoSave">Activer la sauvegarde automatique</Label>
                </div>
                
                {systemConfig.enableAutoSave && (
                  <div className="space-y-2">
                    <Label htmlFor="autoSaveInterval">Intervalle de sauvegarde automatique (secondes)</Label>
                    <Input
                      id="autoSaveInterval"
                      type="number"
                      value={systemConfig.autoSaveInterval}
                      onChange={(e) => setSystemConfig(prev => ({ 
                        ...prev, 
                        autoSaveInterval: parseInt(e.target.value) 
                      }))}
                      className="w-32"
                    />
                  </div>
                )}
                
                <Button onClick={saveSystemSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres de sauvegarde automatique
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={brandingConfig.companyName}
                    onChange={(e) => setBrandingConfig(prev => ({ 
                      ...prev, 
                      companyName: e.target.value 
                    }))}
                    placeholder="Entrez le nom de l'entreprise"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de l'entreprise</Label>
                  <div className="flex items-center space-x-4">
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('logo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger un logo
                    </Button>
                    {logoPreview && (
                      <div className="w-16 h-16 border rounded-lg overflow-hidden">
                        <img
                          src={logoPreview}
                          alt="Aperçu du logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Button onClick={saveBrandingSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les informations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Palette de couleurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Couleur primaire</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="primaryColor"
                        type="color"
                        value={brandingConfig.primaryColor}
                        onChange={(e) => setBrandingConfig(prev => ({ 
                          ...prev, 
                          primaryColor: e.target.value 
                        }))}
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={brandingConfig.primaryColor}
                        onChange={(e) => setBrandingConfig(prev => ({ 
                          ...prev, 
                          primaryColor: e.target.value 
                        }))}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="secondaryColor"
                        type="color"
                        value={brandingConfig.secondaryColor}
                        onChange={(e) => setBrandingConfig(prev => ({ 
                          ...prev, 
                          secondaryColor: e.target.value 
                        }))}
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={brandingConfig.secondaryColor}
                        onChange={(e) => setBrandingConfig(prev => ({ 
                          ...prev, 
                          secondaryColor: e.target.value 
                        }))}
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={saveBrandingSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les couleurs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de langue et de format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select
                      value={systemConfig.language}
                      onValueChange={(value: 'en' | 'fr') => setSystemConfig(prev => ({ 
                        ...prev, 
                        language: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select
                      value={systemConfig.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => setSystemConfig(prev => ({ 
                        ...prev, 
                        theme: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="system">Système</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Format de date</Label>
                    <Select
                      value={systemConfig.dateFormat}
                      onValueChange={(value) => setSystemConfig(prev => ({ 
                        ...prev, 
                        dateFormat: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Format d'heure</Label>
                    <Select
                      value={systemConfig.timeFormat}
                      onValueChange={(value: '12h' | '24h') => setSystemConfig(prev => ({ 
                        ...prev, 
                        timeFormat: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 heures</SelectItem>
                        <SelectItem value="24h">24 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={saveSystemSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder la localisation
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres avancés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customCSS">CSS personnalisé</Label>
                  <textarea
                    id="customCSS"
                    value={brandingConfig.customCSS}
                    onChange={(e) => setBrandingConfig(prev => ({ 
                      ...prev, 
                      customCSS: e.target.value 
                    }))}
                    placeholder="Entrez du CSS personnalisé..."
                    className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Ajoutez du CSS personnalisé pour remplacer le style par défaut
                  </p>
                </div>
                
                <Button onClick={saveBrandingSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres avancés
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestion des données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline">
                    Exporter toutes les données
                  </Button>
                  <Button variant="outline">
                    Importer des données
                  </Button>
                  <Button variant="destructive">
                    Effacer toutes les données
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gérez les données de votre application - exportez pour une sauvegarde ou effacez pour repartir à zéro
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}