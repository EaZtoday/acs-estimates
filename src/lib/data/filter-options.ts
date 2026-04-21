// Centralized filter options data source
// This file contains all the status options, priorities, and other filter data
// that can be dynamically updated and shared across the application

// Job status options
export const PROJECT_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
];

// Offer status options
export const OFFER_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
];

// Service group options
export const SERVICE_GROUP_OPTIONS = [
  { value: "Base", label: "Base" },
  { value: "Research", label: "Research" },
  { value: "Optional", label: "Optional" },
  { value: "License", label: "License" },
];

// Type definitions for better type safety
export type JobStatus = (typeof PROJECT_STATUS_OPTIONS)[number]["value"];
export type OfferStatus = (typeof OFFER_STATUS_OPTIONS)[number]["value"];
export type ServiceGroup = (typeof SERVICE_GROUP_OPTIONS)[number]["value"];
