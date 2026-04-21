import type { Metadata } from "next";
import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import EntityCreatePage from "@/components/features/entities/entity-create-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getEntitiesWithRelations } from "@/lib/server-data";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("New Customer", "/dashboard/customers/new"),
  };
}

interface NewCustomerPageProps {
  searchParams: Promise<{
    organization_id?: string;
    name?: string;
  }>;
}

export default async function NewCustomerPage({
  searchParams,
}: NewCustomerPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const organizations = await getEntitiesWithRelations(supabase, 'organizations', {}, {}, { column: 'name', ascending: true });

  let organizationOptions = organizations.map((o: any) => ({
    id: o.id,
    name: o.name,
  }));

  if (params.organization_id) {
    const organization = organizations.find((o: any) => o.id === params.organization_id);
    if (organization) {
      organizationOptions = [
        { id: (organization as any).id, name: (organization as any).name },
        ...organizationOptions.filter((o: any) => o.id !== params.organization_id)
      ];
    }
  }

  const defaultValues: Record<string, unknown> = {
    name: params.name || "",
    organization_id: params.organization_id || "",
    organization_options: organizationOptions,
  };

  return (
    <EntityErrorBoundary entityName="Customer">
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityCreatePage entity="customers" defaults={defaultValues} />
      </Suspense>
    </EntityErrorBoundary>
  );
}
