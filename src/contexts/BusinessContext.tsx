import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getBusinesses } from '@/integrations/supabase/api';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

interface BusinessContextType {
  activeBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;
  switchBusiness: (businessId: string) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: () => getBusinesses(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (businesses.length > 0 && !activeBusiness) {
      const lastSelectedBusinessId = localStorage.getItem('activeBusinessId');
      const foundBusiness = businesses.find(b => b.id === lastSelectedBusinessId);
      setActiveBusiness(foundBusiness || businesses[0]);
    }
  }, [businesses, activeBusiness]);

  useEffect(() => {
    if (activeBusiness) {
      localStorage.setItem('activeBusinessId', activeBusiness.id);
    } else {
      localStorage.removeItem('activeBusinessId');
    }
  }, [activeBusiness]);

  const switchBusiness = (businessId: string) => {
    const businessToSet = businesses.find(b => b.id === businessId);
    if (businessToSet) {
      setActiveBusiness(businessToSet);
    }
  };

  const value = {
    activeBusiness,
    businesses,
    isLoading,
    switchBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
