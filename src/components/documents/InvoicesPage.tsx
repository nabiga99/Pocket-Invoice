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
import { InvoiceForm } from '@/components/documents/InvoiceForm';
import { exportToExcel } from '@/lib/exportUtils';

type Invoice = Database['public']['Tables']['documents']['Row'];


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
}

export function InvoicesPage() {
  const { activeBusiness } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const { data: invoices, isLoading, isError } = useQuery({
    queryKey: ['documents', activeBusiness?.id, 'invoice'],
    queryFn: () => getDocuments(activeBusiness!.id, 'invoice'),
    enabled: !!activeBusiness,
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeBusiness?.id, 'invoice'] });
      toast({ title: 'Success', description: 'Invoice deleted successfully.' });
      setInvoiceToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddNew = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate(invoiceToDelete.id);
    }
  };

  const handleExport = () => {
    if (!invoices || !activeBusiness) return;

    const dataToExport = invoices.map(invoice => {
      const content = invoice.content as any;
      return {
        'Invoice Number': invoice.number,
        'Title': invoice.title,
        'Client Name': content?.client?.name ?? 'N/A',
        'Client Email': content?.client?.email ?? 'N/A',
        'Amount': invoice.total_amount ?? 0,
        'Status': invoice.status,
        'Due Date': content?.due_date ? new Date(content.due_date).toLocaleDateString() : 'N/A',
        'Created Date': new Date(invoice.created_at).toLocaleDateString(),
      };
    });

    const businessName = activeBusiness.name.replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    exportToExcel(dataToExport, `Invoices_${businessName}_${date}`);
  };

  const renderContent = () => {
    if (!activeBusiness) {
      return <p className="text-center p-8">Please select a business profile to manage invoices.</p>;
    }
    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (isError) {
      return <p className="text-center p-8 text-destructive">Failed to load invoices.</p>;
    }
    if (!invoices || invoices.length === 0) {
      return <p className="text-center p-8">No invoices found for this business. Get started by creating one!</p>;
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
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.number}</TableCell>
              <TableCell>{(invoice.content as any)?.client?.name ?? 'N/A'}</TableCell>
              <TableCell>{formatCurrency(invoice.total_amount ?? 0)}</TableCell>
              <TableCell><Badge variant={invoice.status === 'published' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(invoice)}><Trash2 className="h-4 w-4" /></Button>
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
            <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
            <p className="text-muted-foreground">Create and manage your business invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} disabled={!invoices || invoices.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button onClick={handleAddNew} disabled={!activeBusiness}>
            <Plus className="mr-2 h-4 w-4" /> Add Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeBusiness ? `${activeBusiness.name} - Invoices` : 'Invoices'}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>

      <InvoiceForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        invoice={editingInvoice}
        businessId={activeBusiness?.id}
      />

      {invoiceToDelete && (
        <ConfirmDeleteDialog
          isOpen={!!invoiceToDelete}
          onClose={() => setInvoiceToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Invoice?"
          description={`Are you sure you want to delete invoice #${invoiceToDelete.number}? This action cannot be undone.`}
          isPending={deleteInvoiceMutation.isPending}
        />
      )}
    </div>
  );
}
