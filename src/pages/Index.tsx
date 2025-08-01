import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/landing/LandingPage';
import AuthPage from './AuthPage';
import AppLayout from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProfilePage } from '@/components/business/ProfilePage';
import { ItemsPage } from '@/components/items/ItemsPage';
import { BusinessProfilesPage } from '@/components/business/BusinessProfilesPage';
import { EventsPage } from '@/components/events/EventsPage';
import { InvoicesPage } from '@/components/documents/InvoicesPage';
import { ReceiptsPage } from '@/components/documents/ReceiptsPage';
import { EntryPassesPage } from '@/components/passes/EntryPassesPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user && (location.pathname === '/' || location.pathname === '/auth')) {
        navigate('/app/dashboard');
      } else if (!user && location.pathname.startsWith('/app')) {
        navigate('/');
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/app" element={user ? <AppLayout /> : <LandingPage />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="businesses" element={<BusinessProfilesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="receipts" element={<ReceiptsPage />} />
        <Route path="passes" element={<EntryPassesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default Index;
