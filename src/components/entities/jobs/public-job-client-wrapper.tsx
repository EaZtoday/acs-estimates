"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the public job layout with no SSR
const PublicJobLayout = dynamic(() => import("./public-job-layout"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-white dark:bg-neutral-900 text-foreground rounded-lg shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">
              Loading job...
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
});

interface PublicJobClientWrapperProps {
  job: any;
  offers: any[];
}

export default function PublicJobClientWrapper({
  job,
  offers,
}: PublicJobClientWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center p-4 sm:p-8">
          <div className="max-w-4xl w-full bg-white dark:bg-neutral-900 text-foreground rounded-lg shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Loading job...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PublicJobLayout
        job={job}
        offers={offers}
      />
    </Suspense>
  );
}
