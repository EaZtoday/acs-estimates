import React from "react";
import type { UnifiedFormField } from "@/components/forms/unified/unified-form";
import {
  customerCreateSchema,
  organizationCreateSchema,
  serviceCreateSchema,
  jobCreateSchema,
  offerCreateSchema,
} from '@/lib/validation/schemas';
import { organizationFormFields } from './organization-fields';

import {
  createService,
  updateService,
  deleteService,
} from '@/lib/actions/services';
import {
  createOffer,
  updateOffer,
  deleteOffer,
} from '@/lib/actions/offers';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/actions/organizations';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/lib/actions/customers';
import {
  createJob,
  updateJob,
  deleteJob,
} from '@/lib/actions/jobs';
import type { ActionResponse } from '@/lib/actions/utils';
import type { z } from 'zod';

// Type definition for form configuration entries
export interface FormConfigEntry {
  schema: z.ZodSchema<Record<string, unknown>>;
  fields: UnifiedFormField[];
  entityName: string;
  apiEndpoint: string;
  backLink: string;
  createAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
  updateAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
  deleteAction: (
    prevState: ActionResponse<unknown> | null,
    formData: FormData
  ) => Promise<ActionResponse<unknown>>;
}

// Hoisted lazy components to ensure stable identities
const LazyOrganizationField = React.lazy(
  () => import('@/components/forms/unified/organization-field')
);
const LazyCurrencyField = React.lazy(
  () => import('@/components/forms/unified/currency-field')
);
const LazyCorporateEntityField = React.lazy(
  () => import('@/components/forms/unified/corporate-entity-field')
);
const LazyPaymentTermsField = React.lazy(
  () => import('@/components/forms/unified/payment-terms-field')
);
const LazyDeliveryConditionsField = React.lazy(
  () => import('@/components/forms/unified/delivery-conditions-field')
);
const LazyOfferLinksField = React.lazy(
  () => import('@/components/forms/unified/offer-links-field')
);
const LazyCountryField = React.lazy(
  () => import('@/components/forms/unified/country-field')
);

// Customer form configuration
export const customerFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter first name',
    section: 'basic_info',
  },
  {
    name: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter last name',
    section: 'basic_info',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email address',
    section: 'basic_info',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: 'Enter phone number',
    section: 'basic_info',
  },
  {
    name: 'address_info',
    label: 'Address Information',
    type: 'section',
  },
  {
    name: 'address_line_1',
    label: 'Street Address',
    type: 'text',
    placeholder: 'Enter street address',
    section: 'address_info',
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    placeholder: 'Enter city',
    section: 'address_info',
  },
  {
    name: 'state',
    label: 'State',
    type: 'text',
    placeholder: 'Enter state',
    section: 'address_info',
  },
  {
    name: 'zip',
    label: 'Zip Code',
    type: 'text',
    placeholder: 'Enter zip code',
    section: 'address_info',
  },
];

// Service form configuration
export const serviceFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'name',
    label: 'Service Name',
    type: 'text',
    required: true,
    placeholder: 'Enter service name',
    section: 'basic_info',
  },
  {
    name: 'summary',
    label: 'Summary',
    type: 'text',
    required: true,
    placeholder: 'Brief summary of the service',
    section: 'basic_info',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    rows: 10,
    placeholder: 'Detailed description of the service',
    section: 'basic_info',
  },
  {
    name: 'group_type',
    label: 'Service Group',
    type: 'select',
    options: [
      { value: 'Base', label: 'Base' },
      { value: 'Research', label: 'Research' },
      { value: 'Optional', label: 'Optional' },
      { value: 'License', label: 'License' },
    ],
    section: 'basic_info',
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select category',
    options: [
      { value: 'none', label: 'No category' },
      { value: 'visualization', label: 'Visualization' },
      { value: 'architecture', label: 'Architecture' },
      { value: 'signals', label: 'Signals' },
    ],
    hidden: true,
    section: 'basic_info',
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'text',
    placeholder: 'e.g. Package, Briefcase',
    section: 'basic_info',
  },

  // Service Details Section
  {
    name: 'service_details',
    label: 'Service Details',
    type: 'section',
  },
  {
    name: 'price',
    label: 'Price',
    type: 'number',
    required: true,
    placeholder: '0',
    section: 'service_details',
  },
  {
    name: 'is_recurring',
    label: 'Billing Type',
    type: 'select',
    required: true,
    options: [
      { value: 'false', label: 'One-time' },
      { value: 'true', label: 'Recurring (Yearly)' },
    ],
    section: 'service_details',
  },
  {
    name: 'allow_multiple',
    label: 'Multiple Selection',
    type: 'select',
    required: true,
    options: [
      { value: 'false', label: 'Single selection only' },
      { value: 'true', label: 'Allow multiple selections' },
    ],
    section: 'service_details',
  },

  // Additional Information Section
  {
    name: 'additional_info',
    label: 'Additional Information',
    type: 'section',
  },
  {
    name: 'url',
    label: 'Service URL',
    type: 'text',
    placeholder: 'https://example.com/service',
    section: 'additional_info',
  },
];

// Job form configuration
export const jobFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'type',
    label: 'Record Type',
    type: 'select',
    required: true,
    options: [
      { value: 'estimate', label: 'Estimate' },
      { value: 'job', label: 'Job' },
    ],
    section: 'basic_info',
  },
  {
    name: 'customer_id',
    label: 'Customer ID',
    type: 'text',
    required: true,
    placeholder: 'Enter customer UUID',
    section: 'basic_info',
  },
  {
    name: 'service_type',
    label: 'Service Type',
    type: 'select',
    options: [
      { value: 'Exterior Windows', label: 'Exterior Windows' },
      { value: 'Interior + Exterior', label: 'Interior + Exterior' },
      { value: 'Gutters', label: 'Gutters' },
      { value: 'Pressure Washing', label: 'Pressure Washing' },
    ],
    section: 'basic_info',
  },

  // Property Details Section
  {
    name: 'property_details',
    label: 'Property Details',
    type: 'section',
  },
  {
    name: 'stories',
    label: 'Stories',
    type: 'number',
    section: 'property_details',
  },
  {
    name: 'panes_count',
    label: 'Approx. Pane Count',
    type: 'number',
    section: 'property_details',
  },
  {
    name: 'hard_water_stains',
    label: 'Has Hard Water Stains',
    type: 'toggle',
    section: 'property_details',
  },

  // Pricing Section
  {
    name: 'pricing',
    label: 'Pricing',
    type: 'section',
  },
  {
    name: 'price_estimate',
    label: 'Price Estimate',
    type: 'number',
    section: 'pricing',
  },
  {
    name: 'frequency',
    label: 'Frequency',
    type: 'select',
    options: [
      { value: 'one-time', label: 'One-time' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'annually', label: 'Annually' },
    ],
    section: 'pricing',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'estimate_requested', label: 'Estimate Requested' },
      { value: 'estimate_scheduled', label: 'Estimate Scheduled' },
      { value: 'estimate_sent', label: 'Estimate Sent' },
      { value: 'job_scheduled', label: 'Job Scheduled' },
      { value: 'job_completed', label: 'Job Completed' },
    ],
    section: 'pricing',
  },
  {
    name: 'notes',
    label: 'Internal Notes',
    type: 'textarea',
    rows: 4,
    section: 'pricing',
  },
];

// Offer form configuration
export const offerFormFields: UnifiedFormField[] = [
  {
    name: 'basic_info',
    label: 'Basic Information',
    type: 'section',
  },
  {
    name: 'title',
    label: 'Title',
    type: 'text',
    placeholder: 'Offer title (e.g. job or deal name)',
    hidden: true,
    section: 'basic_info',
    required: false,
  },
  {
    name: 'corporate_entity_id',
    label: 'Corporate Entity',
    type: 'custom',
    placeholder: 'Select corporate entity',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyCorporateEntityField, { form, disabled: isLocked })
      );
    },
    colSpan: 1,
    section: 'basic_info',
  },
  {
    name: 'organization_id',
    label: 'Organization',
    type: 'custom',
    placeholder: 'Select organization',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOrganizationField, { form, disabled: isLocked })
      );
    },
    colSpan: 1,
    section: 'basic_info',
  },
  { name: 'pricing', label: 'Pricing', type: 'section' },
  {
    name: 'currency',
    label: 'Currency',
    type: 'custom',
    colSpan: 1,
    section: 'pricing',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyCurrencyField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'global_discount_percentage',
    label: 'Global Discount %',
    type: 'number',
    placeholder: 'Enter discount percentage',
    colSpan: 1,
    section: 'pricing',
  },
  {
    name: 'discount_reason',
    label: 'Discount Reason',
    type: 'text',
    placeholder: 'Enter reason for discount (optional)',
    colSpan: 1,
    section: 'pricing',
    required: false,
  },
  { name: 'pricing_tax', label: 'Tax', type: 'section' },
  {
    name: 'tax_percentage',
    label: 'Tax %',
    type: 'number',
    placeholder: '0',
    section: 'pricing_tax',
    required: false,
  },
  {
    name: 'tax_reason',
    label: 'Tax explanation (optional)',
    type: 'text',
    placeholder: 'e.g., VAT, local tax, etc.',
    section: 'pricing_tax',
    required: false,
  },
  { name: 'offer_status', label: 'Offer Status', type: 'section' },
  {
    name: 'created_at',
    label: 'Created On',
    type: 'date',
    placeholder: 'Select created date',
    section: 'offer_status',
  },
  {
    name: 'valid_until',
    label: 'Valid Until',
    type: 'date',
    required: true,
    placeholder: 'Select validity date',
    section: 'offer_status',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
    ],
    hidden: true,
    section: 'offer_status',
  },
  {
    name: 'is_accepted',
    label: 'Offer Accepted',
    type: 'toggle',
    section: 'offer_status',
  },
  { name: 'terms', label: 'Terms', type: 'section' },
  {
    name: 'payment_term_id',
    label: 'Payment Terms',
    type: 'custom',
    section: 'terms',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyPaymentTermsField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'delivery_condition_id',
    label: 'Delivery Conditions',
    type: 'custom',
    section: 'terms',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyDeliveryConditionsField, { form, disabled: isLocked })
      );
    },
  },
  {
    name: 'offer_links_section',
    label: 'Offer Links',
    type: 'section',
    hidden: true,
  },
  {
    name: 'offer_selected_link_ids',
    label: 'Links',
    type: 'custom',
    colSpan: 2,
    hidden: true,
    section: 'offer_links_section',
    customRenderer: ({ form, isLocked }) => {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyOfferLinksField, { form, disabled: isLocked })
      );
    },
  },
];

// Form configurations for easy use
export const formConfigs = {
  organization: {
    schema: organizationCreateSchema,
    fields: organizationFormFields,
    entityName: 'Organization',
    apiEndpoint: '/api/organizations',
    backLink: '/dashboard/organizations',
    createAction: createOrganization,
    updateAction: updateOrganization,
    deleteAction: deleteOrganization,
  },
  service: {
    schema: serviceCreateSchema,
    fields: serviceFormFields,
    entityName: 'Service',
    apiEndpoint: '/api/services',
    backLink: '/dashboard/services',
    createAction: createService,
    updateAction: updateService,
    deleteAction: deleteService,
  },
  job: {
    schema: jobCreateSchema,
    fields: jobFormFields,
    entityName: 'Job',
    apiEndpoint: '/api/jobs',
    backLink: '/dashboard/jobs',
    createAction: createJob,
    updateAction: updateJob,
    deleteAction: deleteJob,
  },
  offer: {
    schema: offerCreateSchema,
    fields: offerFormFields,
    entityName: 'Offer',
    apiEndpoint: '/api/offers',
    backLink: '/dashboard/offers',
    createAction: createOffer,
    updateAction: updateOffer,
    deleteAction: deleteOffer,
  },
  customer: {
    schema: customerCreateSchema,
    fields: customerFormFields,
    entityName: 'Customer',
    apiEndpoint: '/api/customers',
    backLink: '/dashboard/customers',
    createAction: createCustomer,
    updateAction: updateCustomer,
    deleteAction: deleteCustomer,
  },
};
