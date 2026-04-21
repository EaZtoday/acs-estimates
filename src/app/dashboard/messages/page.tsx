import type { Metadata } from "next";
import StaticEntityIndexPage from "@/components/features/entities/static-entity-index-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getScheduledMessagesIndexCached,
  getEntityFilterOptionsCached,
} from "@/lib/server-data";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Scheduled Messages", "/dashboard/messages"),
  };
}

export default async function MessagesPage({
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
      f_status: parseAsString.withDefault(""),
      f_customer: parseAsString.withDefault(""),
    });

    initial = await search.parse(searchParams ?? Promise.resolve({}));
  } catch (error) {
    console.error("Error parsing search params:", error);
    initial = {};
  }

  const [items, filterOptions] = await Promise.all([
    getScheduledMessagesIndexCached(supabase),
    getEntityFilterOptionsCached(supabase),
  ]);

  return (
    <StaticEntityIndexPage
      entity="scheduled_messages"
      supabase={supabase as any}
      initial={initial}
      items={items}
      filterOptions={filterOptions}
    />
  );
}
