"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { LinkedItem } from "@/components/ui/composite/linked-items";
import { getOfferDisplayLabel } from "@/lib/utils";

export interface UseLinkedDataOptions {
  organizationId?: string;
  userId?: string;
  customerId?: string;
}

export interface UnlinkResult {
  success: boolean;
  error?: string;
}

export function useLinkedData(options: UseLinkedDataOptions) {
  const { organizationId } = options;
  const [linkedCustomers, setLinkedCustomers] = useState<LinkedItem[]>([]);
  const [linkedJobs, setLinkedJobs] = useState<LinkedItem[]>([]);
  const [linkedOffers, setLinkedOffers] = useState<LinkedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cast to any to work around Supabase Database type `never` inference
  const supabase = useMemo(() => createBrowserSupabaseClient() as any, []);

  const fetchLinkedData = useCallback(async () => {
    if (!organizationId) {
      setLinkedCustomers([]);
      setLinkedJobs([]);
      setLinkedOffers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [{ data: customers }, { data: jobs }, { data: offers }] =
        await Promise.all([
          supabase
            .from("customers")
            .select("id, name, email, company_role")
            .eq("organization_id", organizationId)
            .order("name"),
          supabase
            .from("jobs")
            .select("id, title, status")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false }),
          supabase
            .from("offers")
            .select("id, title, status")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false }),
        ]);

      setLinkedCustomers(
        ((customers as any[]) || []).map((customer) => ({
          id: customer.id,
          name: customer.name,
          href: `/dashboard/customers/${customer.id}`,
          subtitle: customer.email,
        })),
      );

      setLinkedJobs(
        ((jobs as any[]) || []).map((job) => ({
          id: job.id,
          name: job.title,
          href: `/dashboard/jobs/${job.id}`,
          tag: job.status,
        })),
      );

      setLinkedOffers(
        ((offers as any[]) || []).map((offer) => ({
          id: offer.id,
          name: getOfferDisplayLabel(offer),
          href: `/dashboard/offers/${offer.id}`,
          tag: offer.status,
        })),
      );
    } catch (error) {
      console.error("Error fetching linked data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchLinkedData();
  }, [fetchLinkedData]);

  const unlinkCustomerFromOrganization = useCallback(
    async (customerToUnlinkId: string): Promise<UnlinkResult> => {
      if (!organizationId) {
        return { success: false, error: "Missing organization context" };
      }

      try {
        const { error } = await supabase
          .from("customers")
          .update({ organization_id: null })
          .eq("id", customerToUnlinkId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Failed to unlink customer:", error);
          return { success: false, error: error.message };
        }

        await fetchLinkedData();
        return { success: true };
      } catch (error) {
        console.error("Unexpected error unlinking customer:", error);
        return { success: false, error: "Unexpected error unlinking customer" };
      }
    },
    [organizationId, supabase, fetchLinkedData]
  );

  const unlinkJobFromOrganization = useCallback(
    async (jobToUnlinkId: string): Promise<UnlinkResult> => {
      if (!organizationId) {
        return { success: false, error: "Missing organization context" };
      }

      try {
        const { error } = await supabase
          .from("jobs")
          .update({ organization_id: null })
          .eq("id", jobToUnlinkId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Failed to unlink job:", error);
          return { success: false, error: error.message };
        }

        await fetchLinkedData();
        return { success: true };
      } catch (error) {
        console.error("Unexpected error unlinking job:", error);
        return { success: false, error: "Unexpected error unlinking job" };
      }
    },
    [organizationId, supabase, fetchLinkedData]
  );

  return {
    linkedCustomers,
    linkedJobs,
    linkedOffers,
    isLoading,
    refresh: fetchLinkedData,
    unlinkCustomerFromOrganization,
    unlinkJobFromOrganization,
  };
}
