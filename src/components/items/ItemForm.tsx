import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Database } from '@/integrations/supabase/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addItem, updateItem } from '@/integrations/supabase/api';
import { Loader2 } from 'lucide-react';

type BusinessItem = Database['public']['Tables']['business_items']['Row'];

interface ItemFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item?: BusinessItem | null;
  businessId?: string;
}

export function ItemForm({ isOpen, setIsOpen, item, businessId }: ItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const isEditMode = !!item;

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description ?? '');
      setPrice(item.price ?? '');
      setUnit(item.unit ?? '');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setUnit('');
    }
    setError(null);
  }, [item, isOpen]);

  const addItemMutation = useMutation({
    mutationFn: addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', businessId] });
      setIsOpen(false);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: (updatedItem: { itemId: string; updates: Partial<BusinessItem> }) => updateItem(updatedItem.itemId, updatedItem.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', item?.business_id] });
      setIsOpen(false);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError('Item name is required.');
      return;
    }

    if (!businessId && !isEditMode) {
      setError('Cannot add an item without a selected business profile.');
      return;
    }

    const itemData = {
      name,
      description,
      price: price === '' ? null : Number(price),
      unit,
    };

    if (isEditMode && item) {
      updateItemMutation.mutate({ itemId: item.id, updates: itemData });
    } else if (businessId) {
      addItemMutation.mutate({ ...itemData, business_id: businessId });
    }
  };

  const isMutating = addItemMutation.isPending || updateItemMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your item.' : 'Fill in the details for your new product or service.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price (GHS)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="col-span-3" placeholder="e.g., kg, hour, item" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isMutating}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
