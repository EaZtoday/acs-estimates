"use client";

import Link from "next/link";
import { NotebookTabs, Plus, ArrowRight } from "lucide-react";

interface Job {
  id: string;
  service_type?: string;
  status?: string;
  customer?: {
    id: string;
    name: string;
  };
}

interface MyJobsSidebarProps {
  jobs: Job[];
}

export default function MyJobsSidebar({
  jobs,
}: MyJobsSidebarProps) {
  const activeJobs = jobs.filter(
    (job) => job.status === "job_scheduled",
  );

  return (
    <div className="relative group bg-[var(--card)] rounded-md sm:rounded-lg minimal-shadow minimal-border p-3 sm:p-4">
      {/* Clickable overlay covering the whole tile */}
      <Link
        href="/dashboard/jobs"
        aria-label="Jobs overview"
        className="absolute inset-0 z-0"
      />

      {/* Content with pointer-events disabled so overlay captures clicks */}
      <div className="pointer-events-none">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[var(--text-primary)] text-[var(--background)] flex items-center justify-center">
            <NotebookTabs className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="pointer-events-auto relative z-10 p-1.5 sm:p-2 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
            title="Create new job"
            aria-label="Create job"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        <h2 className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          Upcoming Scheduled Jobs
        </h2>

        <div className="mt-2 sm:mt-3 space-y-2">
          {activeJobs.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] py-1">
              No scheduled jobs
            </p>
          ) : (
            activeJobs.slice(0, 5).map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="pointer-events-auto relative z-10 block py-1 rounded hover:bg-[var(--accent)] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-medium text-sm text-[var(--text-primary)]">
                  {job.service_type || "No service type"}
                </div>
                {job.customer?.name && (
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {job.customer.name}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {activeJobs.length > 0 && (
          <div className="mt-2 sm:mt-3 flex items-center text-xs sm:text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            View all jobs
            <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
