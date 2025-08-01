import { supabase } from './client';
import { Database } from './types';
import { User } from '@supabase/supabase-js';

// --- Type Aliases for Clarity ---
type Document = Database['public']['Tables']['documents']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Item = Database['public']['Tables']['business_items']['Row'];

// --- Business Helpers ---

export const getBusinesses = async (userId: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching businesses:', error);
    throw new Error('Could not fetch businesses.');
  }
  return data;
};

const getBusinessIdsForUser = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching business IDs for user:', error);
        return [];
    }
    return data.map(b => b.id);
};

// --- Documents (Invoices & Receipts) ---

export const getDocuments = async (businessId: string, type: 'invoice' | 'receipt'): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('type', type)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const addDocument = async (documentData: Database['public']['Tables']['documents']['Insert']) => {
    const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

    if (error) {
        console.error('Error adding document:', error);
        throw new Error('Could not add new document.');
    }

    return data;
};

export const updateDocument = async (documentId: string, updates: Database['public']['Tables']['documents']['Update']) => {
    const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

    if (error) {
        console.error('Error updating document:', error);
        throw new Error('Could not update document.');
    }

    return data;
};

// --- Items ---

export const getItems = async (businessId: string): Promise<Item[]> => {
  const { data, error } = await supabase
    .from('business_items')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const deleteItem = async (id: string) => {
  const { error } = await supabase.from('business_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const addItem = async (item: Database['public']['Tables']['business_items']['Insert']) => {
  const { data, error } = await supabase
    .from('business_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error adding business item:', error);
    throw new Error('Could not add business item.');
  }

  return data;
};

export const updateItem = async (itemId: string, updates: Database['public']['Tables']['business_items']['Update']) => {
  const { data, error } = await supabase
    .from('business_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating business item:', error);
    throw new Error('Could not update business item.');
  }

  return data;
};

// --- Events ---

export const getEvents = async (businessId: string): Promise<Event[]> => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
};

export const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const addEvent = async (eventData: Database['public']['Tables']['events']['Insert']) => {
    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

    if (error) {
        console.error('Error adding event:', error);
        throw new Error('Could not add new event.');
    }

    return data;
};

export const updateEvent = async (eventId: string, updates: Database['public']['Tables']['events']['Update']) => {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

    if (error) {
        console.error('Error updating event:', error);
        throw new Error('Could not update event.');
    }

    return data;
};

// --- Dashboard ---

export const getDashboardStats = async (user: User | null) => {
  if (!user) {
    return {
      total_revenue: 0,
      total_invoices: 0,
      total_receipts: 0,
      total_events: 0,
      recent_activity: [],
    };
  }

  const businessIds = await getBusinessIdsForUser(user.id);

  if (!businessIds || businessIds.length === 0) {
    return {
      total_revenue: 0,
      total_invoices: 0,
      total_receipts: 0,
      total_events: 0,
      recent_activity: [],
    };
  }

  const { data: docTotals, error: docTotalsError } = await supabase
    .from('documents')
    .select('type, total_amount')
    .in('business_id', businessIds)
    .eq('status', 'published');

  if (docTotalsError) {
    console.error('Error fetching document totals:', docTotalsError);
    throw new Error(docTotalsError.message);
  }
  
  const { count: eventCount, error: eventCountError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .in('business_id', businessIds);

  if (eventCountError) {
    console.error('Error fetching event count:', eventCountError);
    throw new Error(eventCountError.message);
  }

  const stats = {
    total_revenue: 0,
    total_invoices: 0,
    total_receipts: 0,
    total_events: eventCount ?? 0,
  };

  if (docTotals) {
    stats.total_revenue = docTotals
      .filter(d => d.type === 'invoice')
      .reduce((acc, doc) => acc + (doc.total_amount || 0), 0);
    stats.total_invoices = docTotals.filter(d => d.type === 'invoice').length;
    stats.total_receipts = docTotals.filter(d => d.type === 'receipt').length;
  }

  // Fetch recent activity from both documents and events to show a mixed feed
  const { data: recentDocs, error: recentDocsError } = await supabase
    .from('documents')
    .select('id, type, title, created_at, total_amount')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: recentEvents, error: recentEventsError } = await supabase
    .from('events')
    .select('id, name, created_at')
    .in('business_id', businessIds)
    .order('created_at', { ascending: false })
    .limit(2);

  if (recentDocsError || recentEventsError) {
    console.error('Error fetching recent activity:', recentDocsError || recentEventsError);
  }

  const formattedRecentDocs = (recentDocs || []).map(d => ({ ...d, title: d.title || d.type, kind: 'document' }));
  const formattedRecentEvents = (recentEvents || []).map(e => ({ ...e, type: 'event', title: e.name, total_amount: null, kind: 'event' }));

  const recent_activity = [...formattedRecentDocs, ...formattedRecentEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    ...stats,
    recent_activity: recent_activity || [],
  };
};

// --- Business Profile Management ---
export const addBusiness = async (businessData: Database['public']['Tables']['businesses']['Insert']) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert(businessData)
    .select()
    .single();

  if (error) {
    console.error('Error adding business:', error);
    throw new Error('Could not add new business profile.');
  }

  return data;
};

export const updateBusiness = async (businessId: string, updates: Database['public']['Tables']['businesses']['Update']) => {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .select()
    .single();

  if (error) {
    console.error('Error updating business:', error);
    throw new Error('Could not update business profile.');
  }

  return data;
};

export async function uploadBusinessLogo(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`Logo upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from('logos').getPublicUrl(filePath);

  if (!data) {
    throw new Error('Could not get public URL for logo.');
  }

  return data.publicUrl;
}

export const deleteBusiness = async (businessId: string) => {
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) {
    console.error('Error deleting business:', error);
    throw new Error('Could not delete business profile.');
  }

  return true;
};