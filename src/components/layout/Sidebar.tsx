import { NavLink } from 'react-router-dom';
import { Building2, FileText, Calendar, Receipt, CreditCard, Settings, LogOut, Package, Briefcase, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/profile', label: 'Profile', icon: Building2 },
  { to: '/app/items', label: 'Products & Services', icon: Package },
  { to: '/app/businesses', label: 'Business Profiles', icon: Briefcase },
  { to: '/app/events', label: 'Events', icon: Calendar },
  { to: '/app/invoices', label: 'Invoices', icon: CreditCard },
  { to: '/app/receipts', label: 'Receipts', icon: Receipt },
  { to: '/app/passes', label: 'Entry Passes', icon: FileText },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const { businesses, activeBusiness, switchBusiness } = useBusiness();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Pocket Invoice
        </h1>
        {businesses.length > 0 && (
          <div>
            <Select onValueChange={(id) => switchBusiness(id)} value={activeBusiness?.id}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a business..." />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose} // Close sidebar on mobile after selection
              className={({ isActive }) => cn(
                'w-full justify-start flex items-center px-4 py-2 text-sm font-medium rounded-md',
                'hover:bg-muted',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}