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
    .from("jobs")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.title || "Job";
  return {
    title: generatePageTitle(pageName, "/dashboard/jobs"),
  };
}

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="jobs"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
