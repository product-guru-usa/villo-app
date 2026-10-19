import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type Worker = Tables<"workers">;
export type Booking = Tables<"bookings">;

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.from("services").select("*").order("sort").order("created_at");
    if (error) throw error;
    return data;
  },
});

export const workersQuery = (serviceId?: string) =>
  queryOptions({
    queryKey: ["workers", serviceId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("workers").select("*").order("created_at");
      if (serviceId) q = q.eq("service_id", serviceId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const workerQuery = (id: string) =>
  queryOptions({
    queryKey: ["worker", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("workers").select("*, services(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const bookingsQuery = (all: boolean) =>
  queryOptions({
    queryKey: ["bookings", all ? "all" : "mine"],
    queryFn: async () => {
      let q = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (!all) {
        const { data: u } = await supabase.auth.getUser();
        q = q.eq("user_id", u.user?.id ?? "");
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
