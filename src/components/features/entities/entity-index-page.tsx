import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import EntityIndexClient from "./entity-index-client";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { getEntityFilterOptionsCached } from "@/lib/server-data";

type EntityType =
  | "organizations"
  | "customers"
  | "jobs"
  | "services"
  | "offers";

interface EntityIndexPageProps {
  entity: EntityType;
  // Next.js passes a promise-like searchParams for RSC; we keep it typed to unknown
  searchParams?: Promise<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; // Required prop for external Supabase client
}

export default async function EntityIndexPage({
  entity,
  searchParams,
  supabase,
}: EntityIndexPageProps) {
  const search = createSearchParamsCache({
    q: parseAsString.withDefault(""),
    view: parseAsString.withDefault(""),
    f_status: parseAsString.withDefault(""),
    f_org: parseAsString.withDefault(""),
    f_customer: parseAsString.withDefault(""),
    f_currency: parseAsString.withDefault(""),
    f_country: parseAsString.withDefault(""),
    f_job: parseAsString.withDefault(""),
    f_is_overdue: parseAsString.withDefault(""),
    f_type: parseAsString.withDefault(""),
    f_group: parseAsString.withDefault(""),
    f_public: parseAsString.withDefault(""),
  });
  const initial = await search.parse(searchParams ?? Promise.resolve({}));
  return (
    <EntityErrorBoundary
      entityName={entity === "organizations" ? "Organizations" : entity.charAt(0).toUpperCase() + entity.slice(1)}
    >
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityIndexContent
          entity={entity}
          initial={initial}
          supabase={supabase}
        />
      </Suspense>
    </EntityErrorBoundary>
  );
}

async function EntityIndexContent({
  entity,
  initial,
  supabase,
}: {
  entity: EntityIndexPageProps["entity"];
  initial?: Record<string, string>;
  supabase: any;
}) {
  const filterOptions = await getEntityFilterOptionsCached(supabase);
  if (entity === "organizations") {
    const { data: organizations } = await supabase
      .from("organizations")
      .select(
        `
        *,
        customers!inner(count)
      `
      )
      .order("name", { ascending: true });
    return (
      <EntityIndexClient
        entity={entity}
        items={organizations || []}
        initial={initial}
        filterOptions={filterOptions}
      />
    );
  }
  if (entity === "customers") {
    const { data: customers } = await supabase
      .from("customers")
      .select(
        `
        *,
        organization:organizations(name)
      `
      )
      .order("name", { ascending: true });
    return (
      <EntityIndexClient
        entity={entity}
        items={customers || []}
        initial={initial}
        filterOptions={filterOptions}
      />
    );
  }
  if (entity === "jobs") {
    const { data: jobs } = await supabase
      .from("jobs")
      .select(
        `
        *,
        organization:organizations(name, legal_name, country)
      `
      )
      .order("created_at", { ascending: false });
    return (
      <EntityIndexClient
        entity={entity}
        items={jobs || []}
        initial={initial}
        filterOptions={filterOptions}
      />
    );
  }
  if (entity === "services") {
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });
    return (
      <EntityIndexClient
        entity={entity}
        items={services || []}
        initial={initial}
        filterOptions={filterOptions}
      />
    );
  }
  if (entity === "offers") {
    const { data: offers } = await supabase
      .from("offers")
      .select(
        `
        *,
        organization:organizations(name, legal_name, country),
        offer_services(count)
      `
      )
      .order("created_at", { ascending: false });

    // Fetch visit counts excluding @envisioning emails
    const offerIds = (offers || []).map((offer: any) => offer.id);
    let visitCounts: { offer_id: string; accessed_email?: string }[] = [];

    if (offerIds.length > 0) {
      const { data } = await supabase
        .from("offer_access_logs")
        .select("offer_id, accessed_email")
        .in("offer_id", offerIds);

      // Filter out @envisioning.com and @envisioning.io emails
      visitCounts = ((data as any[]) || []).filter(
        (log: any) =>
          !log.accessed_email ||
          (!log.accessed_email.endsWith("@envisioning.com") &&
            !log.accessed_email.endsWith("@envisioning.io"))
      );
    }

    // Create a map of offer_id to visit count
    const visitCountMap = new Map<string, number>();
    visitCounts.forEach((log) => {
      const count = visitCountMap.get(log.offer_id) || 0;
      visitCountMap.set(log.offer_id, count + 1);
    });

    // Transform the data to include services count and visit count
    const offersWithServicesCount = (offers || []).map((offer: any) => ({
      ...offer,
      services_count: offer.offer_services?.[0]?.count || 0,
      client_visits: visitCountMap.get(offer.id) || 0,
    }));

    return (
      <EntityIndexClient
        entity={entity}
        items={offersWithServicesCount}
        initial={initial}
        filterOptions={filterOptions}
      />
    );
  }
  return null;
}
