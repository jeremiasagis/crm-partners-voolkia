"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { SnapshotMensual } from "@/lib/types";

export function useSnapshots() {
  return useQuery({
    queryKey: ["snapshots"],
    queryFn: async (): Promise<SnapshotMensual[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("snapshots_mensuales")
        .select("*")
        .order("periodo", { ascending: true });
      if (error) {
        if (error.code === "PGRST205") return []; // migración 005 pendiente
        throw error;
      }
      return data;
    },
    staleTime: 10 * 60_000,
  });
}
