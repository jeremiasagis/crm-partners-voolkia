"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Target, UserRound } from "lucide-react";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-search";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const TYPE_META: Record<
  SearchResult["type"],
  { label: string; icon: React.ElementType }
> = {
  partner: { label: "Partners", icon: Building2 },
  contacto: { label: "Contactos", icon: UserRound },
  oportunidad: { label: "Oportunidades", icon: Target },
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results = [], isFetching } = useGlobalSearch(query);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const grouped = (["partner", "contacto", "oportunidad"] as const)
    .map((type) => ({
      type,
      items: results.filter((r) => r.type === type),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-line bg-background px-3 text-sm text-muted-warm transition-colors hover:border-orange-vk/40 md:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Buscar…</span>
        <kbd className="rounded border border-line bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted-warm">
          Ctrl K
        </kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line bg-white p-2 text-muted-warm md:hidden"
        aria-label="Buscar"
      >
        <Search className="size-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar partners, contactos, oportunidades…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
          <CommandEmpty>
            {query.trim().length < 2
              ? "Escribí al menos 2 caracteres…"
              : isFetching
                ? "Buscando…"
                : "Sin resultados."}
          </CommandEmpty>
          {grouped.map((group) => {
            const meta = TYPE_META[group.type];
            const Icon = meta.icon;
            return (
              <CommandGroup key={group.type} heading={meta.label}>
                {group.items.map((r) => (
                  <CommandItem
                    key={`${r.type}-${r.id}`}
                    value={`${r.type}-${r.id}`}
                    onSelect={() => go(r.href)}
                  >
                    <Icon className="size-4 text-orange-deep" />
                    <span className="font-medium">{r.title}</span>
                    {r.subtitle && (
                      <span className="text-muted-warm"> — {r.subtitle}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
