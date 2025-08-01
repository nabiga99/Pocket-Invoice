import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, deleteEvent } from '@/integrations/supabase/api';
import { useBusiness } from '@/contexts/BusinessContext';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Database } from '@/integrations/supabase/types';
import { EventForm } from './EventForm';

type Event = Database['public']['Tables']['events']['Row'];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export function EventsPage() {
  const { activeBusiness } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events', activeBusiness?.id],
    queryFn: () => getEvents(activeBusiness!.id),
    enabled: !!activeBusiness,
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', activeBusiness?.id] });
      toast({ title: 'Success', description: 'Event deleted successfully.' });
      setEventToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  const renderContent = () => {
    if (!activeBusiness) {
      return <p className="text-center p-8">Please select a business profile to manage events.</p>;
    }
    if (isLoading) {
      return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    if (isError) {
      return <p className="text-center p-8 text-destructive">Failed to load events.</p>;
    }
    if (!events || events.length === 0) {
      return (
        <div className="text-center p-8">
            <h3 className="text-xl font-semibold">No events found</h3>
            <p className="text-muted-foreground">Get started by creating a new event.</p>
        </div>
      );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
            <Card key={event.id}>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant={event.is_active ? 'default' : 'secondary'}>
                    {event.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.venue}, {event.town_city}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.max_capacity || 'Unlimited'} capacity</span>
                </div>
                <div className="font-bold text-lg">
                    {event.entry_fee ? formatCurrency(event.entry_fee) : 'Free Entry'}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(event)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Events</h2>
            <p className="text-muted-foreground">Create and manage your business events.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew} disabled={!activeBusiness}>
                <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>
                <EventForm 
                    isOpen={isFormOpen} 
                    setIsOpen={setIsFormOpen} 
                    event={editingEvent} 
                    businessId={activeBusiness!.id}
                />
            </DialogContent>
        </Dialog>
      </div>

      {renderContent()}

      <ConfirmDeleteDialog
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={deleteEventMutation.isPending}
        title="Delete Event?"
        description={`Are you sure you want to delete the event "${eventToDelete?.name || 'this event'}"? This action cannot be undone.`}
      />
    </div>
  );
}