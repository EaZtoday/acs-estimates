import { NextRequest, NextResponse } from "next/server";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/api/idempotency";
import { jobService } from "@/lib/api/jobs";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { jobCreateSchema } from "@/lib/validation/schemas";

// GET /api/jobs
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await jobService.getAll();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error in GET /api/jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cachedResponse = await getIdempotentResponse(
      request,
      "crm:jobs:post",
    );
    if (cachedResponse) {
      return cachedResponse;
    }

    const data = await request.json();
    console.log('Received job data:', data);

    // Validate data with Zod schema
    const validationResult = jobCreateSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create job
    const job = await jobService.create(validatedData);

    console.log('Job created:', job);
    await storeIdempotentResponse(request, "crm:jobs:post", job, 200);
    return NextResponse.json(job);
  } catch (error) {
    console.error("Error in POST /api/jobs:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { error: "Invalid organization or lead reference" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Removed unused function 
