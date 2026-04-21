import { z } from "zod";

// Base schemas for common fields
const emailSchema = z.string().email("Invalid email address");
const nameSchema = z
	.string()
	.min(2, "Name must be at least 2 characters")
	.max(100, "Name cannot exceed 100 characters");
const urlSchema = z.string().url("Invalid URL");

// Schema for optional UUID fields that can handle placeholder values
const optionalUuidSchema = z
	.union([
		z
			.string()
			.refine(
				(val) =>
					val === "" ||
					val === "__placeholder__" ||
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
						val,
					),
				{
					message: "Invalid UUID format",
				},
			)
			.transform((val) =>
				val === "" || val === "__placeholder__" ? undefined : val,
			),
		z.null(),
	])
	.optional();

// Schema for optional email fields that can handle empty strings
const optionalEmailSchema = z
	.string()
	.refine((val) => val === "" || emailSchema.safeParse(val).success, {
		message: "Invalid email address",
	})
	.transform((val) => (val === "" ? null : val))
	.optional()
	.nullable();

// Schema for optional URL fields that can handle empty strings
const optionalUrlSchema = z
	.string()
	.refine((val) => val === "" || urlSchema.safeParse(val).success, {
		message: "Invalid URL",
	})
	.transform((val) => (val === "" ? null : val))
	.optional()
	.nullable();

// Schema for optional date fields that can handle empty strings
const optionalDateSchema = z
	.string()
	.refine((val) => val === "" || val === null || !Number.isNaN(Date.parse(val)), {
		message: "Invalid date format",
	})
	.transform((val) => (val === "" ? null : val))
	.optional()
	.nullable();

// Schema for optional boolean fields that can handle checkbox values
const optionalBooleanSchema = z
	.union([
		z.boolean(),
		z.string().transform((val) => val === "true" || val === "on"),
		z.undefined(),
	])
	.transform((val) => {
		if (typeof val === "boolean") return val;
		if (typeof val === "string") return val === "true" || val === "on";
		return false;
	})
	.optional()
	.default(false);

const serviceCategoryValues = [
	"visualization",
	"architecture",
	"signals",
] as const;
const serviceCategorySchema = z
	.union([
		z.enum(serviceCategoryValues),
		z.literal("none"),
		z.literal(""),
		z.null(),
		z.undefined(),
	])
	.transform((value) => {
		if (value === undefined) return undefined;
		if (value === "" || value === null || value === "none") return null;
		return value;
	});

// Customer schemas
export const customerCreateSchema = z.object({
	email: optionalEmailSchema,
	name: nameSchema.optional(),
	first_name: z.string().optional().nullable(),
	last_name: z.string().optional().nullable(),
	phone: z.string().optional().nullable(),
	address_line_1: z.string().optional().nullable(),
	city: z.string().optional().nullable(),
	state: z.string().optional().nullable(),
	zip: z.string().optional().nullable(),
	organization_id: optionalUuidSchema,
	linkedin_url: optionalUrlSchema,
	company_role: z
		.string()
		.max(200, "Role cannot exceed 200 characters")
		.optional()
		.nullable(),
	headline: z
		.string()
		.max(200, "Headline cannot exceed 200 characters")
		.optional()
		.nullable(),
	location: z
		.string()
		.max(200, "Location cannot exceed 200 characters")
		.optional()
		.nullable(),
	country: z
		.string()
		.max(100, "Country cannot exceed 100 characters")
		.optional()
		.nullable(),
	corporate_email: optionalEmailSchema,
	profile_image_url: optionalUrlSchema,
});

export const customerUpdateSchema = customerCreateSchema.partial();

// Organization schemas
export const organizationCreateSchema = z.object({
	name: nameSchema,
	legal_name: z
		.string()
		.max(200, "Legal name cannot exceed 200 characters")
		.optional()
		.nullable(),
	address: z
		.string()
		.max(500, "Address cannot exceed 500 characters")
		.optional()
		.nullable(),
	postcode: z
		.string()
		.max(20, "Postcode cannot exceed 20 characters")
		.optional()
		.nullable(),
	city: z
		.string()
		.max(100, "City cannot exceed 100 characters")
		.optional()
		.nullable(),
	country: z
		.string()
		.max(100, "Country cannot exceed 100 characters")
		.optional()
		.nullable(),
	website: optionalUrlSchema,
	industry: z
		.string()
		.max(100, "Industry cannot exceed 100 characters")
		.optional()
		.nullable(),
	size: z
		.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"])
		.optional()
		.nullable(),
	vat_id: z
		.string()
		.max(50, "VAT ID cannot exceed 50 characters")
		.optional()
		.nullable(),
	tax_id: z
		.string()
		.max(50, "Tax ID cannot exceed 50 characters")
		.optional()
		.nullable(),
	founded: z
		.string()
		.max(50, "Founded cannot exceed 50 characters")
		.optional()
		.nullable(),
	hq_location: z
		.string()
		.max(200, "HQ location cannot exceed 200 characters")
		.optional()
		.nullable(),
	company_type: z
		.string()
		.max(100, "Company type cannot exceed 100 characters")
		.optional()
		.nullable(),
	linkedin_url: optionalUrlSchema,
	logo_image_url: optionalUrlSchema,
	profile_image_url: optionalUrlSchema,
	is_agency: optionalBooleanSchema,
});

export const organizationUpdateSchema = organizationCreateSchema.partial();

// Service schemas
export const serviceCreateSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(200, "Name cannot exceed 200 characters"),
	summary: z
		.string()
		.min(1, "Summary is required")
		.max(200, "Summary cannot exceed 200 characters"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(2000, "Description cannot exceed 2000 characters"),
	price: z
		.coerce
		.number()
		.min(0, "Price cannot be negative"),
	is_recurring: optionalBooleanSchema,
	group_type: z
		.enum(["Base", "Research", "Optional", "License"])
		.optional()
		.nullable(),
	is_public: optionalBooleanSchema,
	allow_multiple: optionalBooleanSchema,
	is_default: optionalBooleanSchema,
	icon: z.string().optional().nullable(),
	category: serviceCategorySchema,
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

// Offer schemas
export const offerCreateSchema = z.object({
	title: z.string().max(200, "Title cannot exceed 200 characters").optional(),
	organization_id: optionalUuidSchema,
	corporate_entity_id: optionalUuidSchema,
	status: z.enum(["draft", "sent"]).default("draft"),
	is_accepted: z.boolean().default(false),
	currency: z
		.string()
		.regex(/^[A-Z]{3}$/i, "Invalid currency code")
		.transform((v) => v.toUpperCase())
		.default("EUR"),
	valid_until: z.string().min(1, "Valid until date is required"),
	global_discount_percentage: z.coerce.number().min(0).max(100).default(0),
	discount_reason: z.string().nullable().optional(),
	tax_percentage: z.coerce.number().min(0).max(100).default(0).optional(),
	tax_reason: z.string().nullable().optional(),
	total_amount: z.coerce.number().min(0).default(0),
	created_at: optionalDateSchema,
	payment_term_id: optionalUuidSchema,
	delivery_condition_id: optionalUuidSchema,
	offer_selected_link_ids: z
		.array(z.string().uuid())
		.optional()
		.or(
			z.string().transform((v) => {
				try {
					const parsed = JSON.parse(v);
					return Array.isArray(parsed) ? parsed : [];
				} catch {
					return [];
				}
			}),
		),
});

export const offerUpdateSchema = offerCreateSchema.partial();

// Job schemas
export const jobCreateSchema = z.object({
	customer_id: z.string().uuid("Invalid Customer ID"),
	type: z.enum(["estimate", "job"]).default("estimate"),
	service_type: z.string().default("Exterior Windows"),
	stories: z.coerce.number().int().min(1).default(1),
	panes_count: z.coerce.number().int().min(0).default(0),
	hard_water_stains: optionalBooleanSchema,
	frequency: z.string().default("one-time"),
	status: z.string().default("estimate_requested"),
	price_estimate: z.coerce.number().min(0).default(0),
	notes: z.string().optional().nullable(),
});

export const jobUpdateSchema = jobCreateSchema.partial();

// Appointment schemas
export const appointmentCreateSchema = z.object({
	job_id: z.string().uuid(),
	customer_id: z.string().uuid(),
	type: z.string(),
	start_time: z.string(),
	end_time: z.string(),
	tech_name: z.string().optional().nullable(),
	status: z.string().default("scheduled"),
});

// Scheduled Message schemas
export const scheduledMessageSchema = z.object({
	customer_id: z.string().uuid(),
	job_id: optionalUuidSchema,
	appointment_id: optionalUuidSchema,
	to_number: z.string(),
	body: z.string(),
	send_at: z.string(),
	status: z.string().default("pending"),
});

export const jobUpdateSchema = jobCreateSchema.partial();

// API response schemas
export const apiErrorSchema = z.object({
	error: z.string(),
	details: z.any().optional(),
});

export const apiSuccessSchema = z.object({
	data: z.any(),
	message: z.string().optional(),
});

// Type exports
export type CustomerCreateData = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateData = z.infer<typeof customerUpdateSchema>;
export type OrganizationCreateData = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateData = z.infer<typeof organizationUpdateSchema>;
export type ServiceCreateData = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateData = z.infer<typeof serviceUpdateSchema>;
export type OfferCreateData = z.infer<typeof offerCreateSchema>;
export type OfferUpdateData = z.infer<typeof offerUpdateSchema>;
export type JobCreateData = z.infer<typeof jobCreateSchema>;
export type JobUpdateData = z.infer<typeof jobUpdateSchema>;
