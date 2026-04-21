import type { Metadata } from "next";
import EntityEditPage from "@/components/features/entities/entity-edit-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("customers")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.name || "Customer";
  return {
    title: generatePageTitle(pageName, "/dashboard/customers"),
  };
}

interface CustomerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="customers"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
