import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Import JSON data directly
import countries from '@/public/data/countries.json';
import states from '@/public/data/states.json';

// ... (Timezone, CountryProps, StateProps interfaces)
interface Timezone {
  zoneName: string
  gmtOffset: number
  gmtOffsetName: string
  abbreviation: string
  tzName: string
}

interface CountryProps {
  id: number
  name: string
  iso3: string
  iso2: string
  numeric_code: string
  phone_code: string
  capital: string
  currency: string
  currency_name: string
  currency_symbol: string
  tld: string
  native: string
  region: string
  region_id: string
  subregion: string
  subregion_id: string
  nationality: string
  timezones: Timezone[]
  translations: Record<string, string>
  latitude: string
  longitude: string
  emoji: string
  emojiU: string
}

interface StateProps {
  id: number
  name: string
  country_id: number
  country_code: string
  country_name: string
  state_code: string
  type: string | null
  latitude: string
  longitude: string
}

interface LocationSelectorProps {
  disabled?: boolean;
  onCountryChange?: (country: CountryProps | null) => void;
  onStateChange?: (state: StateProps | null) => void;
  valueCountry?: string; // Add valueCountry prop
  valueState?: string; // Add valueState prop
}

const LocationSelector = ({
  disabled,
  onCountryChange,
  onStateChange,
  valueCountry, // Add valueCountry prop
  valueState, // Add valueState prop
}: LocationSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryProps | null>(null);
  const [selectedState, setSelectedState] = useState<StateProps | null>(null);
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);

  // Cast imported JSON data to their respective types
  const countriesData = countries as CountryProps[];
  const statesData = states as StateProps[];

  // Filter states for selected country
  const availableStates = statesData.filter(
    (state) => state.country_id === selectedCountry?.id,
  );

  useEffect(() => {
    if (valueCountry) {
      const country = countriesData.find((c) => c.name === valueCountry) || null;
      setSelectedCountry(country);
    } else {
      setSelectedCountry(null);
    }
  }, [valueCountry, countriesData]);

  useEffect(() => {
    if (valueState) {
      const state = statesData.find((s) => s.name === valueState) || null;
      setSelectedState(state);
    } else {
      setSelectedState(null);
    }
  }, [valueState, statesData]);

  const handleCountrySelect = (country: CountryProps | null) => {
    setSelectedCountry(country);
    setSelectedState(null); // Reset state when country changes
    onCountryChange?.(country);
    onStateChange?.(null);
  };

  const handleStateSelect = (state: StateProps | null) => {
    setSelectedState(state);
    onStateChange?.(state);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Country Selector */}
      <div className="flex-1">
        <Popover open={openCountryDropdown} onOpenChange={setOpenCountryDropdown}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCountryDropdown}
              disabled={disabled}
              className="w-full justify-between h-10 px-3 py-2 text-sm"
            >
              {selectedCountry ? (
                <div className="flex items-center gap-2 truncate">
                  <span>{selectedCountry.emoji}</span>
                  <span className="truncate">{selectedCountry.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select Country...</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0 z-[9999]"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder="Search country..." className="h-9" />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px] overflow-y-auto">
                    <div className="p-1">
                      {countriesData.map((country) => (
                        <CommandItem
                          key={country.id}
                          value={country.name}
                          onSelect={() => {
                            handleCountrySelect(country)
                            setOpenCountryDropdown(false)
                          }}
                          className="flex cursor-pointer items-center justify-between text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <span>{country.emoji}</span>
                            <span>{country.name}</span>
                          </div>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedCountry?.id === country.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </div>
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* State Selector - Only shown if selected country has states */}
      {availableStates.length > 0 && (
        <div className="flex-1">
          <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStateDropdown}
                disabled={!selectedCountry}
                className="w-full justify-between h-10 px-3 py-2 text-sm"
              >
                {selectedState ? (
                  <span className="truncate">{selectedState.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select State...</span>
                )}
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[300px] p-0 z-[9999]"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <Command>
                <CommandInput placeholder="Search state..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-[200px] overflow-y-auto">
                      <div className="p-1">
                        {availableStates.map((state) => (
                          <CommandItem
                            key={state.id}
                            value={state.name}
                            onSelect={() => {
                              handleStateSelect(state)
                              setOpenStateDropdown(false)
                            }}
                            className="flex cursor-pointer items-center justify-between text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
                          >
                            <span>{state.name}</span>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                selectedState?.id === state.id
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

    </div>
  );
};

export default LocationSelector;