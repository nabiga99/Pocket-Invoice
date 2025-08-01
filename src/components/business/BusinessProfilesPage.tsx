import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, AlertCircle, Briefcase, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBusinesses, deleteBusiness } from '@/integrations/supabase/api';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessProfileForm } from './BusinessProfileForm';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

export function BusinessProfilesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  const { data: businesses, isLoading, isError } = useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: () => getBusinesses(user!.id),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses', user?.id] });
      setDeleteConfirmOpen(false);
    },
  });

  const handleAdd = () => {
    setSelectedBusiness(null);
    setFormOpen(true);
  };

  const handleEdit = (business: Business) => {
    setSelectedBusiness(business);
    setFormOpen(true);
  };

  const handleDelete = (business: Business) => {
    setBusinessToDelete(business);
    setDeleteConfirmOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Failed to load business profiles.</p>
        </div>
      );
    }

    if (!businesses || businesses.length === 0) {
      return <p className="text-center p-8">You haven't created any business profiles yet. Get started by adding one!</p>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Card key={business.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{business.name}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {business.address || 'No address provided'}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(business)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(business)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Profiles</h2>
          <p className="text-muted-foreground">Manage your different business profiles here.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Businesses</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <BusinessProfileForm
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        business={selectedBusiness}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => businessToDelete && deleteMutation.mutate(businessToDelete.id)}
        isPending={deleteMutation.isPending}
        itemName={businessToDelete?.name || 'this business profile'}
      />
    </div>
  );
}
