import { useBusiness } from '@/contexts/BusinessContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, Mail, Phone, Globe, MapPin, Hash } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const socialIcons: { [key: string]: React.ElementType } = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

export function ProfilePage() {
  const { activeBusiness, isLoading } = useBusiness();

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!activeBusiness) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-10">
        <CardHeader className="text-center">
          <CardTitle>No Business Profile Selected</CardTitle>
          <CardDescription>
            Please select a business from the dropdown in the sidebar, or create one to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const {
    name,
    email,
    phone,
    website,
    address,
    town_city,
    region,
    tax_id,
    registration_number,
    logo_url,
    social_media_links
  } = activeBusiness;

  const smLinks = social_media_links as any || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-6">
          {logo_url ? (
            <img src={logo_url} alt={`${name} logo`} className="w-28 h-28 rounded-lg object-cover border" />
          ) : (
            <div className="w-28 h-28 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1.5">
            <CardTitle className="text-2xl">{name}</CardTitle>
            {website && 
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                <Globe size={14} /> {website}
              </a>
            }
            <div className="flex items-center gap-2 pt-1">
                <Mail size={14} className="text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">{email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">{phone || 'No phone provided'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 pt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold">Location</h3>
              <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-muted-foreground mt-1" />
                  <span className='text-sm'>
                      {address || 'No address provided'}<br />
                      {town_city || 'N/A'}, {region || 'N/A'}
                  </span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Official Details</h3>
              <div className="flex items-start gap-3">
                <Hash size={16} className="text-muted-foreground mt-1" />
                <span className='text-sm'>
                    <strong>Tax ID:</strong> {tax_id || 'N/A'}<br/>
                    <strong>Registration No:</strong> {registration_number || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Social Media</h3>
            <div className="flex items-center gap-4">
              {Object.entries(smLinks).map(([platform, link]) => {
                const Icon = socialIcons[platform];
                return link && Icon ? (
                  <a key={platform} href={link as string} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Icon size={20} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
