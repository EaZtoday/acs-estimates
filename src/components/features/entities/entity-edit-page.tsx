import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import UnifiedEditPage from "@/components/forms/unified/unified-edit-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type EntityType =
  | "organizations"
  | "customers"
  | "jobs"
  | "services"
  | "offers";

interface EntityEditPageProps {
  entity: EntityType;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any; // Optional prop for external Supabase client
}

export default async function EntityEditPage({
  entity,
  id,
  supabase: externalSupabase,
}: EntityEditPageProps) {
  // Use external Supabase client if provided, otherwise create one
  const supabase = externalSupabase || (await createServerSupabaseClient());

  const titleMap: Record<EntityType, string> = {
    organizations: "Organization Details",
    customers: "Customer Details",
    jobs: "Job Details",
    services: "Service Details",
    offers: "Offer Details",
  };

  const entityTypeMap: Record<
    EntityType,
    "organization" | "customer" | "job" | "service" | "offer"
  > = {
    organizations: "organization",
    customers: "customer",
    jobs: "job",
    services: "service",
    offers: "offer",
  };

  const title = titleMap[entity];
  const entityType = entityTypeMap[entity];

  return (
    <EntityErrorBoundary entityName={title.replace(" Details", "")}>
      <Suspense fallback={<PageContentSkeleton />}>
        <UnifiedEditPage entity={entityType} id={id} supabase={supabase as any} />
      </Suspense>
    </EntityErrorBoundary>
  );
}
