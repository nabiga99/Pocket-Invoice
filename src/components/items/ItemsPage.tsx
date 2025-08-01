import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, deleteItem } from '@/integrations/supabase/api';
import { useBusiness } from '@/contexts/BusinessContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ItemForm } from './ItemForm';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Database } from '@/integrations/supabase/types';

type BusinessItem = Database['public']['Tables']['business_items']['Row'];

export function ItemsPage() {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BusinessItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BusinessItem | null>(null);

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['items', activeBusiness?.id],
    queryFn: () => getItems(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', activeBusiness?.id] });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: BusinessItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (item: BusinessItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const renderContent = () => {
    if (!activeBusiness) {
      return <p className="text-center p-8">Please select a business profile to manage items.</p>;
    }

    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>Failed to load items. Please try again.</p>
        </div>
      );
    }

    if (!items || items.length === 0) {
      return <p className="text-center p-8">You haven't added any items for this business yet. Get started by adding one!</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.price ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(item.price) : 'N/A'}</TableCell>
              <TableCell>{item.unit ?? 'N/A'}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products & Services</h2>
          <p className="text-muted-foreground">
            Manage your items, products, and services here.
          </p>
        </div>
        <Button onClick={handleAddItem} disabled={!activeBusiness}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeBusiness ? `${activeBusiness.name} - Items` : 'Items'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      <ItemForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        item={selectedItem}
        businessId={activeBusiness?.id}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure?"
        description={`This will permanently delete the item "${itemToDelete?.name}". This action cannot be undone.`}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
