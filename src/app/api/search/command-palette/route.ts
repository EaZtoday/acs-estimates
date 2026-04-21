import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOfferDisplayLabel } from "@/lib/utils";

interface ContentItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  fallback?: string;
}

interface CommandPaletteSearchResponse {
  organizations: ContentItem[];
  customers: ContentItem[];
  jobs: ContentItem[];
  offers: ContentItem[];
  services: ContentItem[];
}

function clampLimit(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(Math.max(Math.floor(parsed), 1), 20);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const limit = clampLimit(request.nextUrl.searchParams.get("limit"));

    if (q.length < 2) {
      const empty: CommandPaletteSearchResponse = {
        organizations: [],
        customers: [],
        jobs: [],
        offers: [],
        services: [],
      };
      return NextResponse.json(empty);
    }

    const pattern = `%${q}%`;
    const [organizationsResult, customersResult, jobsResult, offersResult, servicesResult] =
      await Promise.all([
        supabase
          .from("organizations")
          .select("id, name, legal_name, country, profile_image_url")
          .ilike("name", pattern)
          .order("name", { ascending: true })
          .limit(limit),
        supabase
          .from("customers")
          .select("id, name, email, company_role, profile_image_url")
          .ilike("name", pattern)
          .order("name", { ascending: true })
          .limit(limit),
        supabase
          .from("jobs")
          .select("id, title, status")
          .ilike("title", pattern)
          .order("title", { ascending: true })
          .limit(limit),
        supabase
          .from("offers")
          .select("id, title, status, created_at, valid_until")
          .or(`title.ilike.${pattern},status.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
          .from("services")
          .select("id, name, description")
          .ilike("name", pattern)
          .order("name", { ascending: true })
          .limit(limit),
      ]);

    const response: CommandPaletteSearchResponse = {
      organizations:
        organizationsResult.error || !Array.isArray(organizationsResult.data)
          ? []
          : organizationsResult.data.map((org: any) => ({
              id: String(org.id),
              name: String(org.name || org.legal_name || "Unnamed Organization"),
              href: `/dashboard/organizations/${org.id}`,
              description: org.legal_name || org.country || undefined,
              imageUrl: org.profile_image_url || undefined,
              fallback: String(org.name || org.legal_name || "?"),
            })),
      customers:
        customersResult.error || !Array.isArray(customersResult.data)
          ? []
          : customersResult.data.map((customer: any) => ({
              id: String(customer.id),
              name: String(customer.name || "Unnamed Customer"),
              href: `/dashboard/customers/${customer.id}`,
              description: customer.email || customer.company_role || undefined,
              imageUrl: customer.profile_image_url || undefined,
              fallback: String(customer.name || "?"),
            })),
      jobs:
        jobsResult.error || !Array.isArray(jobsResult.data)
          ? []
          : jobsResult.data.map((job: any) => ({
              id: String(job.id),
              name: String(job.title || "Untitled Job"),
              href: `/dashboard/jobs/${job.id}`,
              description: job.status || undefined,
              status: job.status || undefined,
            })),
      offers:
        offersResult.error || !Array.isArray(offersResult.data)
          ? []
          : offersResult.data.map((offer: any) => ({
              id: String(offer.id),
              name: getOfferDisplayLabel(offer),
              href: `/dashboard/offers/${offer.id}`,
              description: offer.status || undefined,
              status: offer.status || undefined,
            })),
      services:
        servicesResult.error || !Array.isArray(servicesResult.data)
          ? []
          : servicesResult.data.map((service: any) => ({
              id: String(service.id),
              name: String(service.name || "Unnamed Service"),
              href: `/dashboard/services/${service.id}`,
              description: service.description || undefined,
            })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/search/command-palette:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
