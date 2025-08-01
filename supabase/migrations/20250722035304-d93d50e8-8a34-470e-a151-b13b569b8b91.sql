-- Create enum types
CREATE TYPE document_type AS ENUM ('invoice', 'receipt', 'entry_pass');
CREATE TYPE document_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE pass_status AS ENUM ('active', 'used', 'expired', 'cancelled');

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    website TEXT,
    tax_id TEXT,
    registration_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_items table
CREATE TABLE public.business_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    sku TEXT,
    category TEXT,
    unit TEXT DEFAULT 'pcs',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    max_capacity INTEGER,
    entry_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create templates table
CREATE TABLE public.templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type document_type NOT NULL,
    content JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id),
    type document_type NOT NULL,
    number TEXT NOT NULL,
    title TEXT,
    content JSONB NOT NULL,
    status document_status DEFAULT 'draft',
    total_amount DECIMAL(10,2),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(business_id, number, type)
);

-- Create entry_passes table
CREATE TABLE public.entry_passes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id),
    pass_code TEXT NOT NULL UNIQUE,
    holder_name TEXT NOT NULL,
    holder_email TEXT,
    holder_phone TEXT,
    status pass_status DEFAULT 'active',
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    qr_code_url TEXT,
    verification_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pass_scans table
CREATE TABLE public.pass_scans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pass_id UUID NOT NULL REFERENCES public.entry_passes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    scanner_info TEXT,
    location TEXT,
    metadata JSONB
);

-- Create document_shares table
CREATE TABLE public.document_shares (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    share_url TEXT NOT NULL UNIQUE,
    share_type TEXT NOT NULL,
    recipient_info JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pass_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Businesses policies
CREATE POLICY "Users can view their own businesses" ON public.businesses
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own businesses" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own businesses" ON public.businesses
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own businesses" ON public.businesses
    FOR DELETE USING (auth.uid() = user_id);

-- Business items policies
CREATE POLICY "Users can view items from their businesses" ON public.business_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create items for their businesses" ON public.business_items
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can update items from their businesses" ON public.business_items
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete items from their businesses" ON public.business_items
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));

-- Events policies
CREATE POLICY "Users can view events from their businesses" ON public.events
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create events for their businesses" ON public.events
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can update events from their businesses" ON public.events
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete events from their businesses" ON public.events
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));

-- Templates policies
CREATE POLICY "Users can view templates from their businesses" ON public.templates
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create templates for their businesses" ON public.templates
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can update templates from their businesses" ON public.templates
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete templates from their businesses" ON public.templates
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));

-- Documents policies
CREATE POLICY "Users can view documents from their businesses" ON public.documents
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can create documents for their businesses" ON public.documents
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can update documents from their businesses" ON public.documents
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete documents from their businesses" ON public.documents
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND user_id = auth.uid()));

-- Entry passes policies (allow public access for verification)
CREATE POLICY "Anyone can view active entry passes" ON public.entry_passes
    FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create passes for their events" ON public.entry_passes
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.events e 
        JOIN public.businesses b ON e.business_id = b.id 
        WHERE e.id = event_id AND b.user_id = auth.uid()
    ));
CREATE POLICY "Users can update passes for their events" ON public.entry_passes
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.events e 
        JOIN public.businesses b ON e.business_id = b.id 
        WHERE e.id = event_id AND b.user_id = auth.uid()
    ));

-- Pass scans policies (allow public scanning)
CREATE POLICY "Anyone can create pass scans" ON public.pass_scans
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view scans for their passes" ON public.pass_scans
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.entry_passes ep
        JOIN public.events e ON ep.event_id = e.id
        JOIN public.businesses b ON e.business_id = b.id
        WHERE ep.id = pass_id AND b.user_id = auth.uid()
    ));

-- Document shares policies (allow public access via share URL)
CREATE POLICY "Anyone can view shared documents" ON public.document_shares
    FOR SELECT USING (expires_at IS NULL OR expires_at > now());
CREATE POLICY "Users can create shares for their documents" ON public.document_shares
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.businesses b ON d.business_id = b.id
        WHERE d.id = document_id AND b.user_id = auth.uid()
    ));

-- Create indexes for performance
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_business_items_business_id ON public.business_items(business_id);
CREATE INDEX idx_events_business_id ON public.events(business_id);
CREATE INDEX idx_templates_business_id ON public.templates(business_id);
CREATE INDEX idx_documents_business_id ON public.documents(business_id);
CREATE INDEX idx_entry_passes_event_id ON public.entry_passes(event_id);
CREATE INDEX idx_entry_passes_pass_code ON public.entry_passes(pass_code);
CREATE INDEX idx_pass_scans_pass_id ON public.pass_scans(pass_id);
CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_share_url ON public.document_shares(share_url);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_items_updated_at BEFORE UPDATE ON public.business_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_entry_passes_updated_at BEFORE UPDATE ON public.entry_passes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();