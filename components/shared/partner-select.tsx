"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { usePartners } from "@/hooks/use-partners";
import { partnerDisplayName } from "@/lib/utils/labels";
import { countryFlag } from "@/lib/utils/countries";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Combobox searchable de partners (typeahead) */
export function PartnerSelect({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (partnerId: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: partners = [], isLoading } = usePartners();

  const selected = partners.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between bg-white font-normal"
        >
          {selected ? (
            <span className="truncate">
              {countryFlag(selected.country_code)}{" "}
              {partnerDisplayName(selected)}
            </span>
          ) : (
            <span className="text-muted-warm">
              {isLoading ? "Cargando…" : "Elegí un partner"}
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar partner…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {partners.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.legal_name} ${p.commercial_name ?? ""}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {countryFlag(p.country_code)} {partnerDisplayName(p)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
