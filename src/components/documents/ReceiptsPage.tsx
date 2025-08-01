import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, deleteDocument } from '@/integrations/supabase/api';
import { useBusiness } from '@/contexts/BusinessContext';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Database } from '@/integrations/supabase/types';
import { ReceiptForm } from './ReceiptForm';
import { exportToExcel } from '@/lib/exportUtils';

type Receipt = Database['public']['Tables']['documents']['Row'];


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
}

export function ReceiptsPage() {
  const { activeBusiness } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

  const { data: receipts, isLoading, isError } = useQuery({
    queryKey: ['documents', activeBusiness?.id, 'receipt'],
    queryFn: () => getDocuments(activeBusiness!.id, 'receipt'),
    enabled: !!activeBusiness,
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeBusiness?.id, 'receipt'] });
      toast({ title: 'Success', description: 'Receipt deleted successfully.' });
      setReceiptToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddNew = () => {
    setEditingReceipt(null);
    setIsFormOpen(true);
  };

  const handleEdit = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setIsFormOpen(true);
  };

  const handleDelete = (receipt: Receipt) => {
    setReceiptToDelete(receipt);
  };

  const handleConfirmDelete = () => {
    if (receiptToDelete) {
      deleteReceiptMutation.mutate(receiptToDelete.id);
    }
  };

  const handleExport = () => {
    if (!receipts || !activeBusiness) return;

    const dataToExport = receipts.map(receipt => {
      const content = receipt.content as any;
      return {
        'Receipt Number': receipt.number,
        'Title': receipt.title,
        'Client Name': content?.client?.name ?? 'N/A',
        'Client Email': content?.client?.email ?? 'N/A',
        'Amount': receipt.total_amount ?? 0,
        'Status': receipt.status,
        'Created Date': new Date(receipt.created_at).toLocaleDateString(),
      };
    });

    const businessName = activeBusiness.name.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    exportToExcel(dataToExport, `Receipts_${businessName}_${date}`);
  };

  const renderContent = () => {
    if (!activeBusiness) {
      return <p className="text-center p-8">Please select a business profile to manage receipts.</p>;
    }
    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (isError) {
      return <p className="text-center p-8 text-destructive">Failed to load receipts.</p>;
    }
    if (!receipts || receipts.length === 0) {
      return <p className="text-center p-8">No receipts found for this business. Get started by creating one!</p>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell className="font-medium">{receipt.number}</TableCell>
              <TableCell>{(receipt.content as any)?.client?.name ?? 'N/A'}</TableCell>
              <TableCell>{formatCurrency(receipt.total_amount ?? 0)}</TableCell>
              <TableCell><Badge variant={receipt.status === 'published' ? 'default' : 'secondary'}>{receipt.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(receipt)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(receipt)}><Trash2 className="h-4 w-4" /></Button>
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
            <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
            <p className="text-muted-foreground">Create and manage your business receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} disabled={!receipts || receipts.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleAddNew} disabled={!activeBusiness}>
            <Plus className="mr-2 h-4 w-4" /> Add Receipt
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>

      <ReceiptForm 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
        receipt={editingReceipt} 
        businessId={activeBusiness?.id}
      />

      <ConfirmDeleteDialog
        isOpen={!!receiptToDelete}
        onClose={() => setReceiptToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteReceiptMutation.isPending}
        title="Delete Receipt?"
        description={`Are you sure you want to delete receipt #${receiptToDelete?.number || 'this receipt'}? This action cannot be undone.`}
      />
    </div>
  );
}
