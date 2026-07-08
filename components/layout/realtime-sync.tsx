"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const TABLE_KEYS: Record<string, string[][]> = {
  oportunidades: [["oportunidades"], ["partners"], ["etapa-historial"]],
  partners: [["partners"]],
  contactos: [["contactos"]],
  actividades: [["actividades"]],
  lead_submissions: [["lead-submissions"]],
};

/**
 * Sincronización en vivo: cuando otro usuario cambia algo,
 * invalida las queries afectadas y la UI se actualiza sola.
 */
export function RealtimeSync() {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(new Set<string>());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("crm-realtime");

    for (const table of Object.keys(TABLE_KEYS)) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          pending.current.add(table);
          // Debounce para no invalidar N veces por ráfaga de cambios
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => {
            for (const t of pending.current) {
              for (const key of TABLE_KEYS[t]) {
                queryClient.invalidateQueries({ queryKey: key });
              }
            }
            pending.current.clear();
          }, 300);
        }
      );
    }

    channel.subscribe();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
