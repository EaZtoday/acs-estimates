import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getCustomersIndexCached,
  getDashboardHomeDataCached,
  getEntityFilterOptionsCached,
  getOffersIndexCached,
  getOrganizationsIndexCached,
  getJobsIndexCached,
  getServicesIndexCached,
} from "@/lib/server-data";

interface ProbeMetric {
  name: string;
  durationMs: number;
}

interface ProbePass {
  pass: number;
  metrics: ProbeMetric[];
  totalMs: number;
}

async function measure(name: string, fn: () => Promise<unknown>): Promise<ProbeMetric> {
  const startedAt = performance.now();
  await fn();
  return {
    name,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
  };
}

function getPassCount(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return 2;
  return Math.min(Math.max(Math.floor(parsed), 1), 5);
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

    const passes = getPassCount(request.nextUrl.searchParams.get("passes"));
    const results: ProbePass[] = [];

    for (let pass = 1; pass <= passes; pass += 1) {
      const passStart = performance.now();
      const metrics = await Promise.all([
        measure("dashboard_home", () => getDashboardHomeDataCached(supabase)),
        measure("organizations_index", () => getOrganizationsIndexCached(supabase)),
        measure("customers_index", () => getCustomersIndexCached(supabase)),
        measure("jobs_index", () => getJobsIndexCached(supabase)),
        measure("offers_index", () => getOffersIndexCached(supabase)),
        measure("services_index", () => getServicesIndexCached(supabase)),
        measure("entity_filter_options", () => getEntityFilterOptionsCached(supabase)),
      ]);

      results.push({
        pass,
        metrics,
        totalMs: Number((performance.now() - passStart).toFixed(2)),
      });
    }

    const response = NextResponse.json({
      generatedAt: new Date().toISOString(),
      userId: user.id,
      passes,
      results,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error in GET /api/perf/dashboard:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
