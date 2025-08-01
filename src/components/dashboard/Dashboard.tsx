import { DashboardStats } from './DashboardStats';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/integrations/supabase/api';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProps {
}

const RecentActivity = ({ title, items, isLoading, isError, type }: { title: string, items: any[], isLoading: boolean, isError: boolean, type: 'document' | 'event' }) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading documents...</p>}
        {isError && <p>Could not load documents.</p>}
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {type === 'document' 
                      ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(item.total_amount ?? 0)
                      : new Date(item.created_at).toLocaleDateString()
                    }
                  </p>
                </div>
                <Badge variant={item.status === 'published' || item.is_active ? 'default' : 'secondary'}>{item.type}</Badge>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && <p>No recent activity found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useQuery({
    queryKey: ['dashboardStats', user],
    queryFn: () => getDashboardStats(user),
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to Pocket Invoice. Manage your documents and events from here.
        </p>
      </div>

      <DashboardStats stats={stats} isLoading={isLoadingStats} isError={isErrorStats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Invoice</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Invoice</div>
            <p className="text-xs text-muted-foreground">
              Generate professional invoices
            </p>
            <Button asChild className="w-full"><Link to="/app/invoices">View Invoices</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Receipt</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Receipt</div>
            <p className="text-xs text-muted-foreground">
              Generate payment receipts
            </p>
            <Button asChild className="w-full mt-3" size="sm">
              <Link to="/app/receipts">
                <Plus className="mr-2 h-4 w-4" />
                Create Now
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Entry Pass</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Entry Pass</div>
            <p className="text-xs text-muted-foreground">
              Generate event entry passes
            </p>
            <Button asChild className="w-full mt-3" size="sm">
              <Link to="/app/passes">
                <Plus className="mr-2 h-4 w-4" />
                Create Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity 
            title="Recent Activity"
            items={stats?.recent_activity || []}
            isLoading={isLoadingStats}
            isError={isErrorStats}
            type="document" // This is a bit of a hack, we can improve the display logic later
          />
        </CardContent>
      </Card>
    </div>
  );
}