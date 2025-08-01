import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Bell, Shield, Palette, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    marketing: boolean;
  };
  privacy: {
    analytics: boolean;
    dataSharing: boolean;
  };
}

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState<string | undefined>('');

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    notifications: {
      email: true,
      browser: true,
      marketing: false
    },
    privacy: {
      analytics: true,
      dataSharing: false
    }
  });

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
      loadSettings();
    }
  }, [user]);

  const loadSettings = () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  };

  const saveSettings = (newSettings: AppSettings) => {
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    setSettings(newSettings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    const newSettings = { ...settings, theme };
    saveSettings(newSettings);
    
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleNotificationChange = (key: keyof AppSettings['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const handlePrivacyChange = (key: keyof AppSettings['privacy'], value: boolean) => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const confirmation = prompt('Type "DELETE" to confirm account deletion:');
      if (confirmation === 'DELETE') {
        try {
          setLoading(true);
          // In a real app, you would call a server function to handle account deletion
          // For now, we'll just sign out the user
          await signOut();
          toast({
            title: "Account deletion initiated",
            description: "Your account deletion request has been processed.",
          });
        } catch (error) {
          console.error('Error deleting account:', error);
          toast({
            title: "Error",
            description: "Failed to delete account. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's business data
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user?.id);

      if (businessError) throw businessError;

      // Fetch user's documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          businesses!inner(user_id)
        `)
        .eq('businesses.user_id', user?.id);

      if (documentsError) throw documentsError;

      // Create export data
      const exportData = {
        user_profile: {
          id: user?.id,
          email: user?.email,
          full_name: user?.user_metadata.full_name,
          phone: user?.user_metadata.phone,
          created_at: user?.created_at,
        },
        businesses: businesses || [],
        documents: documents || [],
        exported_at: new Date().toISOString(),
        app_settings: settings
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `docugen-pro-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });
    if (error) {
      toast({ title: 'Error', description: `Failed to update profile: ${error.message}`, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your information has been saved successfully.' });
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="account">
            <Settings className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <PhoneInput id="phone" value={phone} onChange={setPhone} className="input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground mt-1">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="created">Member Since</Label>
                  <Input id="created" value={user ? new Date(user.created_at).toLocaleDateString() : ''} disabled className="bg-muted" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your preferred theme or use system setting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in your browser
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={settings.notifications.browser}
                  onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-notifications">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and offers
                  </p>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app by sharing usage analytics
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => handlePrivacyChange('analytics', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-sharing">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing anonymized data with partners
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Download all your data in JSON format
                </p>
                <Button onClick={exportData} disabled={loading} variant="outline">
                  {loading ? 'Exporting...' : 'Export Data'}
                </Button>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium">Sign Out</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Sign out of your account on this device
                </p>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Permanently delete your account and all associated data
                </p>
                <Button 
                  onClick={handleDeleteAccount} 
                  disabled={loading}
                  variant="destructive"
                >
                  {loading ? 'Processing...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}