"use client";

import { useCallback } from 'react';
import useSWR, { SWRConfiguration } from "swr";
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from "swr";
import { Job } from '@/lib/api/jobs';
import { fetcher, postFetcher, putFetcher, deleteFetcher } from "@/lib/fetchers";
import { suspenseConfig } from "@/lib/swr-config";

// Define a type for job creation that makes non-required fields optional
type CreateJobData = {
  title: string;
  description?: string;
  url?: string;
  specs?: string;
  technical?: string;
  research?: string;
  design?: string;
  organization_id?: string;
  offer_id?: string;
  evid?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
};

// Base API URL for jobs
const PROJECTS_KEY = "/api/jobs";

// Create job mutation
async function createJobFetcher(url: string, { arg }: { arg: CreateJobData }) {
  return postFetcher(url, arg);
}

// Update job mutation
async function updateJobFetcher(url: string, { arg }: { arg: Partial<Job> }) {
  return putFetcher(url, arg);
}

// Delete job mutation
async function deleteJobFetcher(url: string) {
  return deleteFetcher(url);
}

interface UseJobsOptions {
  suspense?: boolean;
  enabled?: boolean; // Disable client fetching when server data is provided
}

export function useJobs(options: UseJobsOptions = {}) {
  const enabled = options.enabled ?? true;
  const { mutate } = useSWRConfig();
  
  // Determine which configuration to use based on the suspense option
  const config: SWRConfiguration = options.suspense 
    ? suspenseConfig
    : {};
  
  // Fetch all jobs with SWR
  const { data: jobs = [], error, isLoading } = useSWR<Job[]>(
    enabled ? PROJECTS_KEY : null,
    fetcher,
    config
  );
  
  // Create job with useSWRMutation
  const { trigger: createJob, isMutating: isCreating } = useSWRMutation(
    PROJECTS_KEY, 
    createJobFetcher, 
    {
      // Optimistically update the cache
      onSuccess: (newJob) => {
        mutate(PROJECTS_KEY, [...(jobs || []), newJob], false);
      }
    }
  );

  // Update job with useSWRMutation
  const { trigger: updateJobTrigger } = useSWRMutation(
    '', // We'll set the URL dynamically
    updateJobFetcher
  );

  // Delete job with useSWRMutation
  const { trigger: deleteJobTrigger } = useSWRMutation(
    '', // We'll set the URL dynamically
    deleteJobFetcher
  );
  
  // Fetch a single job by ID
  const fetchJob = useCallback(async (id: string) => {
    if (!enabled) return null;
    const jobUrl = `${PROJECTS_KEY}/${id}`;
    try {
      return await fetcher(jobUrl);
    } catch (err) {
      console.error(`Error fetching job ${id}:`, err);
      return null;
    }
  }, [enabled]);

  // Update a job
  const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
    try {
      const updatedJob = await updateJobTrigger(updates, { 
        populateCache: false,
        revalidate: false 
      });
      // Update cache after successful mutation
      if (enabled) {
        mutate(PROJECTS_KEY, jobs?.map(job => job.id === id ? updatedJob : job), false);
      }
      return updatedJob;
    } catch (err) {
      console.error(`Error updating job ${id}:`, err);
      return null;
    }
  }, [jobs, mutate, updateJobTrigger, enabled]);

  // Delete a job
  const deleteJob = useCallback(async (id: string) => {
    try {
      await deleteJobTrigger(undefined, { 
        populateCache: false,
        revalidate: false 
      });
      // Update cache after successful deletion
      if (enabled) {
        mutate(PROJECTS_KEY, jobs?.filter(job => job.id !== id), false);
      }
      return true;
    } catch (err) {
      console.error(`Error deleting job ${id}:`, err);
      return false;
    }
  }, [jobs, mutate, deleteJobTrigger, enabled]);

  return {
    jobs,
    isLoading,
    error: error?.message || null,
    isCreating,
    fetchJob,
    createJob,
    updateJob,
    deleteJob,
  };
} 