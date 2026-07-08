"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type SearchResult = {
  type: "partner" | "contacto" | "oportunidad";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export function useGlobalSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["global-search", q],
    enabled: q.length >= 2,
    queryFn: async (): Promise<SearchResult[]> => {
      const supabase = createClient();
      const like = `%${q}%`;

      const [partners, contactos, oportunidades] = await Promise.all([
        supabase
          .from("partners")
          .select("id, legal_name, commercial_name, country_code")
          .or(`legal_name.ilike.${like},commercial_name.ilike.${like}`)
          .limit(5),
        supabase
          .from("contactos")
          .select(
            "id, first_name, last_name, email, partner_id, partner:partners(commercial_name, legal_name)"
          )
          .or(
            `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`
          )
          .limit(5),
        supabase
          .from("oportunidades")
          .select(
            "id, cliente_final_name, etapa, partner:partners(commercial_name, legal_name)"
          )
          .ilike("cliente_final_name", like)
          .limit(5),
      ]);

      const results: SearchResult[] = [];

      for (const p of partners.data ?? []) {
        results.push({
          type: "partner",
          id: p.id,
          title: p.commercial_name || p.legal_name,
          subtitle: p.legal_name,
          href: `/partners/${p.id}`,
        });
      }

      for (const c of contactos.data ?? []) {
        const partner = c.partner as unknown as {
          commercial_name: string | null;
          legal_name: string;
        } | null;
        results.push({
          type: "contacto",
          id: c.id,
          title: `${c.first_name} ${c.last_name}`,
          subtitle:
            partner?.commercial_name || partner?.legal_name || c.email || "",
          href: `/partners/${c.partner_id}?tab=contactos`,
        });
      }

      for (const o of oportunidades.data ?? []) {
        const partner = o.partner as unknown as {
          commercial_name: string | null;
          legal_name: string;
        } | null;
        results.push({
          type: "oportunidad",
          id: o.id,
          title: o.cliente_final_name,
          subtitle: partner?.commercial_name || partner?.legal_name || "",
          href: `/oportunidades/${o.id}/edit`,
        });
      }

      return results;
    },
  });
}
