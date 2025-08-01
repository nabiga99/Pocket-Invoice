import { useBusiness } from '@/contexts/BusinessContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BusinessSwitcher() {
  const { activeBusiness, businesses, setActiveBusiness, isLoading } = useBusiness();

  if (isLoading) {
    return (
        <Button variant="outline" className="w-[200px] justify-start" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </Button>
    );
  }

  if (!businesses || businesses.length === 0) {
    return null; // Don't show switcher if no businesses
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between truncate"
        >
          {activeBusiness ? (
            <>
              <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{activeBusiness.name}</span>
            </>
          ) : (
            'Select Business'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel>Your Businesses</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onSelect={() => setActiveBusiness(business)}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span>{business.name}</span>
            <Check
              className={cn(
                'ml-auto h-4 w-4',
                activeBusiness?.id === business.id ? 'opacity-100' : 'opacity-0'
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
