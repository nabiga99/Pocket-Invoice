import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ticket, Plus, Edit, QrCode, Download, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import QRCode from 'qrcode';
import { generatePDF, shareOnWhatsApp } from '@/lib/pdfUtils';

interface EntryPass {
  id: string;
  pass_code: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  valid_from: string;
  valid_until: string;
  qr_code_url: string;
  verification_url: string;
  event_id: string;
  created_at: string;
  events: {
    name: string;
    venue: string;
    start_date: string;
  };
}

interface Event {
  id: string;
  name: string;
  venue: string;
  start_date: string;
  end_date?: string;
}

export function EntryPassesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [passes, setPasses] = useState<EntryPass[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPass, setEditingPass] = useState<EntryPass | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<EntryPass | null>(null);
  const [formData, setFormData] = useState({
    event_id: '',
    holder_name: '',
    holder_email: '',
    holder_phone: '',
    valid_from: '',
    valid_until: ''
  });
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
    fetchPasses();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, venue, start_date, end_date, businesses!inner(user_id)')
        .eq('businesses.user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0 && !formData.event_id) {
        const selectedEvent = data[0];
        setFormData(prev => ({
          ...prev,
          event_id: selectedEvent.id,
          valid_from: selectedEvent.start_date ? new Date(selectedEvent.start_date).toISOString().slice(0, 16) : '',
          valid_until: selectedEvent.end_date ? new Date(selectedEvent.end_date).toISOString().slice(0, 16) : ''
        }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  };

  const fetchPasses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('entry_passes')
        .select(`
          *,
          events!inner(
            name,
            venue,
            start_date,
            businesses!inner(user_id)
          )
        `)
        .eq('events.businesses.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasses(data || []);
    } catch (error) {
      console.error('Error fetching passes:', error);
      toast({
        title: "Error",
        description: "Failed to load entry passes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePassCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const generateQRCode = async (passId: string, passCode: string) => {
    try {
      const verificationUrl = `${window.location.origin}/verify/${passId}`;
      const qrCodeData = await QRCode.toDataURL(verificationUrl);
      return { qrCodeData, verificationUrl };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { qrCodeData: '', verificationUrl: '' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const passCode = generatePassCode();
      const passId = crypto.randomUUID();
      const { qrCodeData, verificationUrl } = await generateQRCode(passId, passCode);

      const passData = {
        id: passId,
        event_id: formData.event_id,
        pass_code: passCode,
        holder_name: formData.holder_name,
        holder_email: formData.holder_email,
        holder_phone: formData.holder_phone,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        qr_code_url: qrCodeData,
        verification_url: verificationUrl,
        status: 'active' as const
      };

      if (editingPass) {
        const { error } = await supabase
          .from('entry_passes')
          .update({
            holder_name: formData.holder_name,
            holder_email: formData.holder_email,
            holder_phone: formData.holder_phone,
            valid_from: passData.valid_from,
            valid_until: passData.valid_until
          })
          .eq('id', editingPass.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Entry pass updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('entry_passes')
          .insert([passData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Entry pass created successfully",
        });
      }

      setDialogOpen(false);
      setEditingPass(null);
      resetForm();
      fetchPasses();
    } catch (error) {
      console.error('Error saving pass:', error);
      toast({
        title: "Error",
        description: "Failed to save entry pass",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pass: EntryPass) => {
    setEditingPass(pass);
    setFormData({
      event_id: pass.event_id,
      holder_name: pass.holder_name,
      holder_email: pass.holder_email || '',
      holder_phone: pass.holder_phone || '',
      valid_from: pass.valid_from ? new Date(pass.valid_from).toISOString().slice(0, 16) : '',
      valid_until: pass.valid_until ? new Date(pass.valid_until).toISOString().slice(0, 16) : ''
    });
    setDialogOpen(true);
  };

  const handleViewQR = (pass: EntryPass) => {
    setSelectedPass(pass);
    setQrDialogOpen(true);
  };

  const handleEventChange = (eventId: string) => {
    const selectedEvent = events.find(e => e.id === eventId);
    setFormData(prev => ({
      ...prev,
      event_id: eventId,
      valid_from: selectedEvent?.start_date ? new Date(selectedEvent.start_date).toISOString().slice(0, 16) : '',
      valid_until: selectedEvent?.end_date ? new Date(selectedEvent.end_date).toISOString().slice(0, 16) : ''
    }));
  };

  const handleDownloadPDF = async (pass: EntryPass) => {
    setSelectedPass(pass); // Set the pass for PDF template
    
    // Wait for React to update the DOM
    setTimeout(async () => {
      if (!passRef.current) return;
      
      try {
        await generatePDF(passRef.current, `entry-pass-${pass.pass_code}.pdf`);
        toast({
          title: "Success",
          description: "Entry pass PDF downloaded successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate PDF",
          variant: "destructive",
        });
      }
    }, 100);
  };

  const handleShare = (pass: EntryPass) => {
    const text = `Entry Pass for ${pass.events.name}\nHolder: ${pass.holder_name}\nCode: ${pass.pass_code}`;
    shareOnWhatsApp(text, pass.verification_url);
  };

  const resetForm = () => {
    const firstEvent = events[0];
    setFormData({
      event_id: firstEvent?.id || '',
      holder_name: '',
      holder_email: '',
      holder_phone: '',
      valid_from: firstEvent?.start_date ? new Date(firstEvent.start_date).toISOString().slice(0, 16) : '',
      valid_until: firstEvent?.end_date ? new Date(firstEvent.end_date).toISOString().slice(0, 16) : ''
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'used':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="p-6">Loading entry passes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hidden PDF Template */}
      <div ref={passRef} className="hidden">
        {selectedPass && (
          <div className="max-w-4xl mx-auto p-8 bg-white text-black">
            <div className="border-2 border-blue-500 rounded-lg p-6">
              <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
                <h1 className="text-4xl font-bold text-blue-600 mb-2">ENTRY PASS</h1>
                <p className="text-xl text-gray-600">Pass Code: {selectedPass.pass_code}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Pass Holder Information:</h2>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedPass.holder_name}</p>
                    <p><strong>Email:</strong> {selectedPass.holder_email}</p>
                    <p><strong>Phone:</strong> {selectedPass.holder_phone}</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-4">Event Information:</h2>
                  <div className="space-y-2">
                    <p><strong>Event:</strong> {events.find(e => e.id === selectedPass.event_id)?.name}</p>
                    <p><strong>Valid From:</strong> {new Date(selectedPass.valid_from).toLocaleString()}</p>
                    <p><strong>Valid Until:</strong> {new Date(selectedPass.valid_until).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-block p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <QrCode className="h-24 w-24 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">QR Code: {selectedPass.pass_code}</p>
                </div>
              </div>
              
              <div className="text-center text-gray-500 border-t pt-4">
                <p className="text-sm">This pass is valid for the specified event and dates only.</p>
                <p className="text-sm">Please present this pass along with valid ID at the venue.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Entry Passes</h2>
          <p className="text-muted-foreground">
            Generate and manage event entry passes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} disabled={events.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Create Pass
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPass ? 'Edit Entry Pass' : 'Create New Entry Pass'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="event">Event</Label>
                <select
                  id="event"
                  value={formData.event_id}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={!!editingPass}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.venue}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="holder_name">Holder Name</Label>
                <Input
                  id="holder_name"
                  value={formData.holder_name}
                  onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="holder_email">Holder Email</Label>
                <Input
                  id="holder_email"
                  type="email"
                  value={formData.holder_email}
                  onChange={(e) => setFormData({ ...formData, holder_email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="holder_phone">Holder Phone</Label>
                <Input
                  id="holder_phone"
                  value={formData.holder_phone}
                  onChange={(e) => setFormData({ ...formData, holder_phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPass ? 'Update Pass' : 'Create Pass'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active events</h3>
            <p className="text-muted-foreground mb-4">
              Create an event first to generate entry passes
            </p>
          </CardContent>
        </Card>
      ) : passes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No entry passes found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first entry pass to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Pass
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Entry Passes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass Code</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passes.map((pass) => (
                  <TableRow key={pass.id}>
                    <TableCell className="font-mono">{pass.pass_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pass.holder_name}</div>
                        {pass.holder_email && (
                          <div className="text-sm text-muted-foreground">{pass.holder_email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pass.events.name}</div>
                        <div className="text-sm text-muted-foreground">{pass.events.venue}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(pass.status)}>
                        {pass.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(pass.valid_until)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(pass)}
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(pass)}
                          title="Share on WhatsApp"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQR(pass)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(pass)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Entry Pass QR Code</DialogTitle>
          </DialogHeader>
          {selectedPass && (
            <div className="space-y-4 text-center">
              <div>
                <h3 className="font-medium">{selectedPass.holder_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPass.events.name}</p>
              </div>
              {selectedPass.qr_code_url && (
                <div className="flex justify-center">
                  <img 
                    src={selectedPass.qr_code_url} 
                    alt="QR Code" 
                    className="w-48 h-48 border rounded-lg"
                  />
                </div>
              )}
              <div>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  Pass Code: {selectedPass.pass_code}
                </p>
              </div>
              <Button
                onClick={() => {
                  if (selectedPass.qr_code_url) {
                    const link = document.createElement('a');
                    link.href = selectedPass.qr_code_url;
                    link.download = `pass-${selectedPass.pass_code}.png`;
                    link.click();
                  }
                }}
                className="w-full"
              >
                Download QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}