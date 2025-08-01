import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addEvent, updateEvent } from '@/integrations/supabase/api'; // Assuming these functions will be created
import { Loader2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { GHANA_REGIONS } from '@/lib/pdfUtils';

type Event = Database['public']['Tables']['events']['Row'];

interface EventFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  event?: Event | null;
  businessId: string;
}

export function EventForm({ isOpen, setIsOpen, event, businessId }: EventFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!event;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    town_city: '',
    region: '',
    gps_address: '',
    start_date: '',
    end_date: '',
    max_capacity: '',
    entry_fee: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        venue: event.venue || '',
        town_city: event.town_city || '',
        region: event.region || '',
        gps_address: event.gps_address || '',
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        max_capacity: event.max_capacity?.toString() || '',
        entry_fee: event.entry_fee?.toString() || '',
      });
    } else {
      resetForm();
    }
  }, [event]);

  const resetForm = () => {
    setFormData({
        name: '', description: '', venue: '', town_city: '', region: '',
        gps_address: '', start_date: '', end_date: '', max_capacity: '', entry_fee: '',
    });
  };

  const mutationConfig = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', businessId] });
      toast({ title: 'Success', description: `Event ${isEditMode ? 'updated' : 'created'} successfully.` });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  };

  const addEventMutation = useMutation({ mutationFn: addEvent, ...mutationConfig });
  const updateEventMutation = useMutation({ 
    mutationFn: (data: { id: string; updates: Partial<Event> }) => updateEvent(data.id, data.updates), 
    ...mutationConfig 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      business_id: businessId,
      max_capacity: parseInt(formData.max_capacity) || null,
      entry_fee: parseFloat(formData.entry_fee) || null,
      is_active: true,
    };

    if (isEditMode) {
      updateEventMutation.mutate({ id: event.id, updates: eventData });
    } else {
      addEventMutation.mutate(eventData);
    }
  };

  const isMutating = addEventMutation.isPending || updateEventMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
      <div>
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-medium">Location Details</h3>
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="Event venue name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="town_city">Town/City</Label>
            <Input
              id="town_city"
              value={formData.town_city}
              onChange={(e) => setFormData({ ...formData, town_city: e.target.value })}
              placeholder="Enter town/city"
            />
          </div>
          <div>
            <Label htmlFor="region">Region</Label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full p-2 border bg-background rounded-md"
            >
              <option value="">Select region</option>
              {GHANA_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="gps_address">Ghana Post GPS Address</Label>
          <Input
            id="gps_address"
            value={formData.gps_address}
            onChange={(e) => setFormData({ ...formData, gps_address: e.target.value })}
            placeholder="e.g., GA-123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max_capacity">Max Capacity</Label>
          <Input
            id="max_capacity"
            type="number"
            value={formData.max_capacity}
            onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="entry_fee">Entry Fee (GHS)</Label>
          <Input
            id="entry_fee"
            type="number"
            step="0.01"
            value={formData.entry_fee}
            onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
        <Button type="submit" disabled={isMutating}>
          {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Save Changes' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
