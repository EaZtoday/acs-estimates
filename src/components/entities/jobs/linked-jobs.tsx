"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Job } from "@/lib/api/jobs";
import LinkedData from "@/components/ui/composite/linked-data";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface LinkedJobsProps {
  organizationId?: string | null;
}

export default function LinkedJobs({
  organizationId,
}: LinkedJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("status", "Active")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setJobs(data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, [organizationId]);

  const handleAddNew = () => {
    const url = organizationId
      ? `/dashboard/jobs/new?organization_id=${organizationId}`
      : "/dashboard/jobs/new";
    window.location.href = url;
  };

  if (!organizationId) {
    return null;
  }

  return (
    <LinkedData
      title="Active Jobs"
      isLoading={isLoading}
      onAddNew={handleAddNew}
      addButtonText="Add Job"
    >
      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">
            No active jobs
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Get started by creating a new job for this organization.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              <div className="flex-1">
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="text-sm font-medium text-neutral-900 hover:text-blue-600"
                >
                  {(job as any).service_type || 'Window Cleaning'} - {(job as any).type === 'estimate' ? 'Estimate' : 'Job'}
                </Link>
                {(job as any).notes && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                    {(job as any).notes}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                  {job.created_at && (
                    <span>Created: {formatDate(job.created_at)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </LinkedData>
  );
}
