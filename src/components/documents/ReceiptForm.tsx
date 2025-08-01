import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDocument, updateDocument } from '@/integrations/supabase/api';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Database, Json } from '@/integrations/supabase/types';
import { useBusiness } from '@/contexts/BusinessContext';

type Receipt = Database['public']['Tables']['documents']['Row'];

interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface ReceiptFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  receipt?: Receipt | null;
}

export function ReceiptForm({ isOpen, setIsOpen, receipt }: ReceiptFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeBusiness } = useBusiness();
  const isEditMode = !!receipt;

  const [title, setTitle] = useState('Receipt');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([{ id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    if (receipt) {
      const content = receipt.content as any;
      setTitle(receipt.title || 'Receipt');
      setClientName(content?.client?.name || '');
      setClientEmail(content?.client?.email || '');
      setClientPhone(content?.client?.phone || '');
      setClientAddress(content?.client?.address || '');
      setNotes(content?.notes || '');
      setItems(content?.items || [{ id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
    } else {
      resetForm();
    }
  }, [receipt, isOpen]);

  const resetForm = () => {
    setTitle('Receipt');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setNotes('');
    setItems([{ id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const mutationConfig = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', activeBusiness?.id, 'receipt'] });
      toast({ title: 'Success', description: `Receipt ${isEditMode ? 'updated' : 'created'} successfully.` });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  };

  const addReceiptMutation = useMutation({ mutationFn: addDocument, ...mutationConfig });
  const updateReceiptMutation = useMutation({ mutationFn: (data: { id: string; updates: any }) => updateDocument(data.id, data.updates), ...mutationConfig });

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;

    const receiptData = {
      business_id: activeBusiness.id,
      title,
      total_amount: totalAmount,
      status: 'published' as const,
      type: 'receipt' as const,
      content: {
        client: { name: clientName, email: clientEmail, phone: clientPhone, address: clientAddress },
        items: items.filter(item => item.description),
        notes,
      } as unknown as Json,
    };

    if (isEditMode) {
      updateReceiptMutation.mutate({ id: receipt.id, updates: receiptData });
    } else {
      addReceiptMutation.mutate({ ...receiptData, number: `RCPT-${Date.now().toString().slice(-6)}` });
    }
  };

  const isMutating = addReceiptMutation.isPending || updateReceiptMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Receipt' : 'Create New Receipt'}</DialogTitle>
          <DialogDescription>Fill in the details to create a new receipt for your client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="title">Receipt Title</Label>
                <Input id="title" placeholder="e.g. Payment for Services" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Receipt Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" />Add Item</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <Input placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="col-span-6" />
                  <Input type="number" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="col-span-2" />
                  <Input type="number" placeholder="0.00" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="col-span-2" />
                  <div className="col-span-1 text-right font-medium">
                    GH₵{(item.quantity * item.price).toFixed(2)}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length <= 1} className="col-span-1">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-right font-bold text-lg mt-4">
              Total: GH₵{totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Receipt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
