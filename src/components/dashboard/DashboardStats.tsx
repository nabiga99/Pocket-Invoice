import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Calendar, TrendingUp, Receipt } from 'lucide-react';


interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    total_revenue: number;
    total_invoices: number;
    total_receipts: number;
    total_events: number;
  } | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function DashboardStats({ stats, isLoading, isError }: DashboardStatsProps) {

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error loading stats. Please try again later.</div>;
  }

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value={formatRevenue(stats?.total_revenue ?? 0)}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Invoices"
        value={stats?.total_invoices.toString() ?? '0'}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Receipts"
        value={stats?.total_receipts.toString() ?? '0'}
        icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Events"
        value={stats?.total_events.toString() ?? '0'}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}