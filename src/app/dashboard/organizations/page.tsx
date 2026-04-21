import type { Metadata } from "next";
import StaticEntityIndexPage from "@/components/features/entities/static-entity-index-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getEntityFilterOptionsCached,
  getOrganizationsIndexCached,
} from "@/lib/server-data";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Organizations", "/dashboard/organizations"),
  };
}

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams?: Promise<unknown>;
}) {
  const supabase = await createServerSupabaseClient();

  // Parse search params at the page level
  let initial: Record<string, string> = {};
  try {
    const search = createSearchParamsCache({
      q: parseAsString.withDefault(""),
      view: parseAsString.withDefault(""),
      f_status: parseAsString.withDefault(""),
      f_org: parseAsString.withDefault(""),
      f_customer: parseAsString.withDefault(""),

      f_currency: parseAsString.withDefault(""),
      f_country: parseAsString.withDefault(""),
      f_priority: parseAsString.withDefault(""),
      f_job: parseAsString.withDefault(""),
      f_is_overdue: parseAsString.withDefault(""),
      f_type: parseAsString.withDefault(""),
      f_group: parseAsString.withDefault(""),
      f_public: parseAsString.withDefault(""),
    });

    initial = await search.parse(searchParams ?? Promise.resolve({}));
  } catch (error) {
    console.error("Error parsing search params:", error);
    initial = {};
  }

  const [items, filterOptions] = await Promise.all([
    getOrganizationsIndexCached(supabase),
    getEntityFilterOptionsCached(supabase),
  ]);

  return (
    <StaticEntityIndexPage
      entity="organizations"
      supabase={supabase as any}
      initial={initial}
      items={items}
      filterOptions={filterOptions}
    />
  );
}
