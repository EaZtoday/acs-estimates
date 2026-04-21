"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { jobService } from "@/lib/api/jobs";
import { jobCreateSchema, jobUpdateSchema } from "@/lib/validation/schemas";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  type ActionResponse,
} from "./utils";

// Create a new job
export async function createJob(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, jobCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Create the job (validation.data is already properly typed)
    const job = await jobService.create(validation.data);

    // Revalidate paths
    revalidatePath("/dashboard/jobs");
    revalidateTag("jobs", "max");
    revalidateTag("dashboard", "max");
    revalidateTag("settings", "max");

    // Return success response instead of redirecting
    return createActionResponse(job, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing job
export async function updateJob(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the job ID from form data
    const jobId = formData.get("id") as string;
    if (!jobId) {
      return handleFailedAction("Job ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, jobUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Update the job (validation.data is already properly typed)
    const updateData = {
      ...validation.data,
      // Convert null values to undefined for the service
      description: validation.data.description || undefined,
      url: validation.data.url || undefined,
      organization_id: validation.data.organization_id || undefined,
      start_date: validation.data.start_date || undefined,
      end_date: validation.data.end_date || undefined,
    };
    const job = await jobService.update(jobId, updateData);

    // Revalidate paths
    revalidatePath("/dashboard/jobs");
    revalidatePath(`/dashboard/jobs/${jobId}`);
    revalidateTag("jobs", "max");
    revalidateTag("dashboard", "max");
    revalidateTag("settings", "max");

    // Return success response instead of redirecting
    return createActionResponse(job, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Delete a job
export async function deleteJob(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<{ success: boolean } | null>> {
  try {
    const jobId = formData.get("id") as string;
    if (!jobId) {
      return handleFailedAction("Job ID is required");
    }

        await jobService.delete(jobId);
    
    // Revalidate paths
    revalidatePath("/dashboard/jobs");
    revalidateTag("jobs", "max");
    revalidateTag("dashboard", "max");
    revalidateTag("settings", "max");
    
    return createActionResponse({ success: true });
  } catch (error) {
    // Handle foreign key constraint errors specifically
    if (isForeignKeyConstraintError(error)) {
      return createActionResponse(null, 
        "Cannot delete this job because it has related data."
      );
    }
    
    return createActionResponse(null, handleActionError(error));
  }
}

// Get a job by ID (for edit forms)
export async function getJob(id: string): Promise<ActionResponse<unknown>> {
  try {
    const job = await jobService.getById(id);
    
    if (!job) {
      return handleFailedAction("Job not found");
    }
    
    return createActionResponse(job);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Get all jobs (for list pages)
export async function getJobs(filters?: Record<string, string>): Promise<ActionResponse<unknown[] | null>> {
  try {
    const jobs = await jobService.getAll(filters);
    return createActionResponse(jobs);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
} 
