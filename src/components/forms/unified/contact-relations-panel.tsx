"use client";

import { useEffect, useMemo, useState } from "react";
import LinkedItems, {
  type LinkedItem,
} from "@/components/ui/composite/linked-items";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Building2, FileText } from "lucide-react";
import { getOfferDisplayLabel } from "@/lib/utils";

interface CustomerRelationsPanelProps {
  customerId: string;
}

export default function CustomerRelationsPanel({
  customerId,
}: CustomerRelationsPanelProps) {
  const [organization, setOrganization] = useState<LinkedItem | null>(null);
  const [offers, setOffers] = useState<LinkedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the customer with its organization
        const { data: customer } = await supabase
          .from("customers")
          .select("id, organization_id, organization:organizations(id, name)")
          .eq("id", customerId)
          .single();

        const customerRow = customer as any;
        if (customerRow?.organization && typeof customerRow.organization === "object") {
          const org = customerRow.organization as { id: string; name: string };
          setOrganization({
            id: org.id,
            name: org.name,
            href: `/dashboard/organizations/${org.id}`,
          });
        } else {
          setOrganization(null);
        }

        // Fetch offers where this customer is the customer_id
        const { data: customerOffers } = await supabase
          .from("offers")
          .select("id, title, status, organization:organizations(id, name, legal_name), valid_until")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        setOffers(
          ((customerOffers || []) as any[]).map((offer) => ({
            id: offer.id,
            name: getOfferDisplayLabel(offer),
            href: `/dashboard/offers/${offer.id}`,
            tag: offer.status,
          })),
        );
      } catch (error) {
        console.error("Error loading customer relations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [customerId, supabase]);

  return (
    <div className="space-y-4">
      {organization && (
        <LinkedItems
          config={{
            title: "Organization",
            items: [organization],
            createNewHref: organization.href,
            createNewLabel: "View Organization",
            emptyMessage: "No organization",
            isLoading,
            icon: Building2,
          }}
        />
      )}

      <LinkedItems
        config={{
          title: "Offers",
          items: offers,
          createNewHref: `/dashboard/offers/new?customer_id=${customerId}`,
          createNewLabel: "Add Offer",
          emptyMessage: "No offers",
          isLoading,
          icon: FileText,
        }}
      />
    </div>
  );
}
