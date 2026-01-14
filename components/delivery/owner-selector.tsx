'use client';

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Owner } from '@/types';

interface OwnerSelectorProps {
  owners: Owner[];
  selectedOwner: Owner | null;
  onSelectOwner: (owner: Owner | null) => void;
  disabled?: boolean;
}

export function OwnerSelector({
  owners,
  selectedOwner,
  onSelectOwner,
  disabled = false,
}: OwnerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <User className="h-4 w-4" />
        To
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedOwner ? (
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {selectedOwner.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Select recipient...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search owners..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>No owner found.</CommandEmpty>
              <CommandGroup>
                {owners.map((owner) => (
                  <CommandItem
                    key={owner.id}
                    value={owner.name}
                    onSelect={() => {
                      onSelectOwner(
                        selectedOwner?.id === owner.id ? null : owner
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedOwner?.id === owner.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{owner.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {owner.email} • {owner.phone}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOwner && (
        <div className="mt-3 p-3 bg-muted rounded-lg space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{selectedOwner.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{selectedOwner.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-medium text-right ml-2">{selectedOwner.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Country:</span>
            <span className="font-medium">{selectedOwner.country}</span>
          </div>
        </div>
      )}
    </div>
  );
}

