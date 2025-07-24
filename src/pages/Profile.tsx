import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Upload,
  Save,
  Edit3,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  role: 'admin' | 'user';
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  lastLogin?: string;
  gamesCreated: number;
  gamesPlayed: number;
  avgScore: number;
}

export default function Profile() {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'Thierry Cohen',
    email: 'thierry@acapella.com',
    phone: '+33 1 23 45 67 89',
    department: 'Safety & Training',
    role: 'admin',
    bio: 'Risk assessment specialist with 5+ years of experience in workplace safety training.',
    location: 'Paris, France',
    joinedAt: '2023-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    gamesCreated: 12,
    gamesPlayed: 47,
    avgScore: 85
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setProfile(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const saveProfile = () => {
    // In a real app, this would save to backend
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully",
      variant: "default"
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    // Reset to saved data
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  };

  // Load profile on mount
  React.useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setProfile(profileData);
      if (profileData.avatar) {
        setAvatarPreview(profileData.avatar);
      }
    }
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Calendar className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="space-y-2">
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('avatar')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Department"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profile.location || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Location"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                        {profile.role === 'admin' ? 'Administrator' : 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full p-3 border rounded-md resize-none h-24 disabled:bg-muted"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Games Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center text-primary">
                    {profile.gamesCreated}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Games Played</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center text-primary">
                    {profile.gamesPlayed}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center text-primary">
                    {profile.avgScore}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member since</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(profile.joinedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {profile.lastLogin && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last login</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(profile.lastLogin).toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full">
                  Enable Two-Factor Authentication
                </Button>
                
                <Button variant="outline" className="w-full">
                  Download Account Data
                </Button>
                
                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}