"use client";

interface JobTimelineProps {
  jobId: string;
}

export function JobTimeline({ jobId }: JobTimelineProps) {
  // Timeline not available in core-oss (requires tasks, milestones, interactions entities)
  return null;
}
