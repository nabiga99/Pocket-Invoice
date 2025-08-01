import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBusiness, updateBusiness, uploadBusinessLogo } from '@/integrations/supabase/api';
import { Database } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

type Business = Database['public']['Tables']['businesses']['Row'];

interface BusinessProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  business?: Business | null;
}

export function BusinessProfileForm({ isOpen, onClose, business }: BusinessProfileFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [townCity, setTownCity] = useState('');
  const [region, setRegion] = useState('');
  const [taxId, setTaxId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [socialMedia, setSocialMedia] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '' });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!business;

  useEffect(() => {
    if (business) {
      setName(business.name ?? '');
      setEmail(business.email ?? '');
      setPhone(business.phone ?? '');
      setWebsite(business.website ?? '');
      setAddress(business.address ?? '');
      setCategory(business.business_category ?? '');
      setTownCity(business.town_city ?? '');
      setRegion(business.region ?? '');
      setTaxId(business.tax_id ?? '');
      setRegistrationNumber(business.registration_number ?? '');
      setLogoUrl(business.logo_url ?? null);
      const sm = business.social_media_links as any;
      setSocialMedia({
        facebook: sm?.facebook ?? '',
        twitter: sm?.twitter ?? '',
        instagram: sm?.instagram ?? '',
        linkedin: sm?.linkedin ?? '',
      });
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setAddress('');
      setCategory('');
      setTownCity('');
      setRegion('');
      setTaxId('');
      setRegistrationNumber('');
      setLogoUrl(null);
      setLogoFile(null);
      setSocialMedia({ facebook: '', twitter: '', instagram: '', linkedin: '' });
    }
    setError(null);
  }, [business, isOpen]);

  const addBusinessMutation = useMutation({
    mutationFn: addBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateBusinessMutation = useMutation({
    mutationFn: (updated: { businessId: string; updates: Partial<Business> }) => updateBusiness(updated.businessId, updated.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError('Business name is required.');
      return;
    }
    if (!user) {
      setError('You must be logged in.');
      return;
    }

    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        finalLogoUrl = await uploadBusinessLogo(user.id, logoFile);
      }

      const businessData = {
        user_id: user.id,
        name,
        email,
        phone,
        website,
        address,
        business_category: category,
        town_city: townCity,
        region,
        tax_id: taxId,
        registration_number: registrationNumber,
        social_media_links: socialMedia,
        logo_url: finalLogoUrl,
      };

      if (isEditMode && business) {
        updateBusinessMutation.mutate({ businessId: business.id, updates: businessData });
      } else {
        addBusinessMutation.mutate(businessData);
      }
    } catch (uploadError: any) {
      setError(`Failed to upload logo: ${uploadError.message}`);
    }
  };

  const isMutating = addBusinessMutation.isPending || updateBusinessMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Business Profile' : 'Add New Business'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the details of your business.' : 'Fill in the details for your new business profile.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                  <Label htmlFor="logo">Logo</Label>
                  {logoUrl && <img src={logoUrl} alt="logo" className="w-24 h-24 object-cover rounded-md" />}
                  <Input id="logo" type="file" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} accept="image/*" />
                  <p className="text-xs text-muted-foreground">Optional. Will be displayed on invoices and receipts.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Business Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="hospitality">Hospitality</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="townCity">Town/City</Label>
                    <Input id="townCity" value={townCity} onChange={(e) => setTownCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select onValueChange={setRegion} value={region}>
                        <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="greater-accra">Greater Accra</SelectItem>
                            <SelectItem value="ashanti">Ashanti</SelectItem>
                            <SelectItem value="western">Western</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input id="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input id="registrationNumber" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Social Media Links (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" value={socialMedia.facebook} onChange={(e) => setSocialMedia({...socialMedia, facebook: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input id="twitter" value={socialMedia.twitter} onChange={(e) => setSocialMedia({...socialMedia, twitter: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" value={socialMedia.instagram} onChange={(e) => setSocialMedia({...socialMedia, instagram: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input id="linkedin" value={socialMedia.linkedin} onChange={(e) => setSocialMedia({...socialMedia, linkedin: e.target.value})} />
                  </div>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Business'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}