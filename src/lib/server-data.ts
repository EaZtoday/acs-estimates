import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Customer } from '@/lib/api/customers';
import { Organization } from '@/lib/api/organizations';
import { Service } from '@/lib/api/services';
import { Offer } from '@/lib/api/offers';
import { Job } from '@/lib/api/jobs';
import { unstable_cache } from 'next/cache';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = any;

export interface EntityFilterOptions {
  currencies: Array<{ value: string; label: string }>;
  organizations: Array<{ value: string; label: string }>;
  customers: Array<{ value: string; label: string }>;
  jobs: Array<{ value: string; label: string }>;
}

export interface DashboardStats {
  customers: number;
  jobs: number;
  appointments: number;
  messages: number;
}

export interface DashboardHomeData {
  stats: DashboardStats;
  activeJobs: any[];
  offersForHistory: Array<{
    id: string;
    total_amount: number | null;
    is_accepted: boolean | null;
    created_at: string | null;
    valid_until: string | null;
    currency: string | null;
  }>;
}

// Generic server data fetcher
async function fetchFromTable<T>(
  table: string,
  select: string = '*',
  filters?: Record<string, unknown>
): Promise<T[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from(table).select(select);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    throw new Error(`Failed to fetch ${table}`);
  }

  return (data as T[]) || [];
}

// Customer data fetching with caching
export const getCustomersServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Customer[]> => {
    let query = supabase
      .from('customers')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }

    return (data as Customer[]) || [];
  },
  ['customers'],
  {
    revalidate: 60,
    tags: ['customers']
  }
);

export const getCustomerServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Customer | null> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch customer');
    }

    return data;
  },
  ['customer'],
  {
    revalidate: 60,
    tags: ['customers']
  }
);

// Organization data fetching with caching
export const getOrganizationsServer = unstable_cache(
  async (supabase: DbClient): Promise<Organization[]> => {
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        customers!inner(count)
      `)
      .order('name');

    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      throw new Error('Failed to fetch organizations');
    }

    const organizationsWithCustomerCounts = (organizations || []).map((org: any) => ({
      ...org,
      customer_count: Array.isArray(org.customers) ? org.customers.length : 0
    }));

    return organizationsWithCustomerCounts;
  },
  ['organizations'],
  {
    revalidate: 60,
    tags: ['organizations']
  }
);

export const getOrganizationServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Organization | null> => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch organization');
    }

    return data;
  },
  ['organization'],
  {
    revalidate: 60,
    tags: ['organizations']
  }
);

// Service data fetching with caching
export const getServicesServer = unstable_cache(
  async (supabase: DbClient): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }

    return (data as Service[]) || [];
  },
  ['services'],
  {
    revalidate: 300,
    tags: ['services']
  }
);

export const getServiceServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Service | null> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch service');
    }

    return data;
  },
  ['service'],
  {
    revalidate: 300,
    tags: ['services']
  }
);

// Offer data fetching with caching
export const getOffersServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Offer[]> => {
    let query = supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(name, legal_name, country),
        offer_services(count)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching offers:', error);
      throw new Error('Failed to fetch offers');
    }

    const offersWithServicesCount = (data as Record<string, unknown>[])?.map(offer => ({
      ...offer,
      services_count: ((offer as Record<string, unknown>).offer_services as Record<string, unknown>[])?.[0]?.count || 0,
    })) || [];

    return offersWithServicesCount as unknown as Offer[];
  },
  ['offers'],
  {
    revalidate: 60,
    tags: ['offers']
  }
);

export const getOfferServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Offer | null> => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch offer');
    }

    return data;
  },
  ['offer'],
  {
    revalidate: 60,
    tags: ['offers']
  }
);

// Job data fetching with caching
export const getJobsServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Job[]> => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }

    return (data as Job[]) || [];
  },
  ['jobs'],
  {
    revalidate: 60,
    tags: ['jobs']
  }
);

export const getJobServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Job | null> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch job');
    }

    return data;
  },
  ['job'],
  {
    revalidate: 60,
    tags: ['jobs']
  }
);

// Parallel data fetching for dashboard pages
export const getDashboardData = unstable_cache(
  async (supabase: DbClient) => {
    const [
      organizationsResult,
      customersResult,
      offersResult,
      servicesResult,
      jobsResult,
    ] = await Promise.all([
      supabase
        .from('organizations')
        .select('*, customers!inner(count)')
        .order('name'),
      supabase
        .from('customers')
        .select('*, organization:organizations(name, legal_name, country)'),
      supabase
        .from('offers')
        .select('*, organization:organizations(name, legal_name, country), offer_services(count)'),
      supabase
        .from('services')
        .select('*')
        .order('name'),
      supabase
        .from('jobs')
        .select('*, customer:customers(name)'),
      supabase
        .from('appointments')
        .select('count', { count: 'exact', head: true }),
      supabase
        .from('scheduled_messages')
        .select('count', { count: 'exact', head: true }),
    ]);

    if (organizationsResult.error) throw new Error('Failed to fetch organizations');
    if (customersResult.error) throw new Error('Failed to fetch customers');
    if (offersResult.error) throw new Error('Failed to fetch offers');
    if (servicesResult.error) throw new Error('Failed to fetch services');
    if (jobsResult.error) throw new Error('Failed to fetch jobs');

    const organizations = (organizationsResult.data || []).map((org: any) => ({
      ...org,
      customer_count: Array.isArray(org.customers) ? org.customers.length : 0
    }));

    const offers = (offersResult.data || []).map((offer: any) => ({
      ...offer,
      services_count: ((offer as Record<string, unknown>).offer_services as Record<string, unknown>[])?.[0]?.count || 0
    }));

    return {
      customers: customersResult.data || [],
      jobs: jobsResult.data || [],
      appointments_count: (appointmentsResult as any).count || 0,
      messages_count: (messagesResult as any).count || 0,
    };
  },
  ['dashboard-data'],
  {
    revalidate: 30,
    tags: ['organizations', 'customers', 'offers', 'services', 'jobs']
  }
);

export async function getEntityFilterOptions(
  supabase: DbClient,
): Promise<EntityFilterOptions> {
  const fallbackCurrencies = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  const [currenciesResult, organizationsResult, customersResult, jobsResult] =
    await Promise.all([
      supabase
        .from("currencies")
        .select("code, symbol, is_enabled")
        .eq("is_enabled", true),
      supabase
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true }),
      supabase.from("customers").select("id, name").order("name", { ascending: true }),
      supabase
        .from("jobs")
        .select("id, title")
        .order("title", { ascending: true }),
    ]);

  const currencies =
    !currenciesResult.error && Array.isArray(currenciesResult.data)
      ? currenciesResult.data.map((currency: any) => ({
          value: String(currency.code),
          label: `${String(currency.code)} (${String(currency.symbol || "")})`,
        }))
      : fallbackCurrencies;

  return {
    currencies: currencies.length > 0 ? currencies : fallbackCurrencies,
    organizations:
      organizationsResult.error || !Array.isArray(organizationsResult.data)
        ? []
        : organizationsResult.data.map((org: any) => ({
            value: String(org.id),
            label: String(org.name || "Unnamed Organization"),
          })),
    customers:
      customersResult.error || !Array.isArray(customersResult.data)
        ? []
        : customersResult.data.map((customer: any) => ({
            value: String(customer.id),
            label: String(customer.name || "Unnamed Customer"),
          })),
    jobs:
      jobsResult.error || !Array.isArray(jobsResult.data)
        ? []
        : jobsResult.data.map((job: any) => ({
            value: String(job.id),
            label: String(job.title || "Untitled Job"),
          })),
  };
}

export async function getEntityFilterOptionsCached(
  supabase: DbClient,
): Promise<EntityFilterOptions> {
  return getEntityFilterOptions(supabase);
}

export async function getOrganizationsIndexCached(supabase: DbClient) {
  const { data: organizations, error } = await supabase
      .from("organizations")
      .select(
        `
        *,
        customers!inner(count)
      `,
      )
      .order("name", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch organizations");
  }

  return (organizations || []).map((org: any) => ({
    ...org,
    customer_count: Array.isArray(org.customers) ? org.customers.length : 0,
  }));
}

export async function getCustomersIndexCached(supabase: DbClient) {
  const { data: customers, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        organization:organizations(name, legal_name, country)
      `,
      )
      .order("name", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch customers");
  }

  return customers || [];
}

export async function getJobsIndexCached(supabase: DbClient) {
  const { data: jobs, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        organization:organizations(name, legal_name, country)
      `,
      )
      .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch jobs");
  }

  return jobs || [];
}

export async function getServicesIndexCached(supabase: DbClient) {
  const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch services");
  }

  return services || [];
}

export async function getOffersIndexCached(supabase: DbClient) {
  const { data: offers, error } = await supabase
      .from("offers")
      .select(
        `
        *,
        organization:organizations(name, legal_name, country),
        offer_services:offer_services(
          id,
          is_custom,
          custom_title,
          quantity,
          services:service_id(
            name,
            icon
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch offers");
  }

  const offerIds = (offers || []).map((offer: any) => offer.id);
  let visitCounts: { offer_id: string; accessed_email?: string }[] = [];

  if (offerIds.length > 0) {
    const { data } = await supabase
      .from("offer_access_logs")
      .select("offer_id, accessed_email")
      .in("offer_id", offerIds);

    visitCounts = ((data as any[]) || []).filter(
      (log: any) =>
        !log.accessed_email ||
        (!log.accessed_email.endsWith("@envisioning.com") &&
          !log.accessed_email.endsWith("@envisioning.io")),
    );
  }

  const visitCountMap = new Map<string, number>();
  visitCounts.forEach((log) => {
    const count = visitCountMap.get(log.offer_id) || 0;
    visitCountMap.set(log.offer_id, count + 1);
  });

  return (offers || []).map((offer: any) => {
    const offerServices = offer.offer_services || [];
    return {
      ...offer,
      services_count: Array.isArray(offerServices) ? offerServices.length : 0,
      client_visits: visitCountMap.get(offer.id) || 0,
    };
  });
}

export async function getDashboardHomeDataCached(
  supabase: DbClient,
): Promise<DashboardHomeData> {
  const [customers, jobs, appointments, messages] = await Promise.all([
      supabase.from("customers").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("scheduled_messages").select("*", { count: "exact", head: true }),
  ]);

  const [{ data: activeJobs }] = await Promise.all([
    supabase
      .from("jobs")
      .select(`
          *,
          customer:customers(id, name)
        `)
      .eq("status", "job_scheduled")
      .order("created_at", { ascending: false }),
  ]);

  return {
    stats: {
      customers: customers.count ?? 0,
      jobs: jobs.count ?? 0,
      appointments: appointments.count ?? 0,
      messages: messages.count ?? 0,
    },
    activeJobs: activeJobs || [],
    offersForHistory: [], // Not used for now in this version
  };
}

export async function getScheduledMessagesIndexCached(supabase: DbClient) {
  const { data, error } = await supabase
      .from("scheduled_messages")
      .select(`
        *,
        customer:customers(name)
      `)
      .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch scheduled messages");
  }

  return data || [];
}

// Cache tags for invalidation
export const CACHE_TAGS = {
  ORGANIZATIONS: 'organizations',
  CONTACTS: 'customers',
  OFFERS: 'offers',
  PROJECTS: 'jobs',
  SERVICES: 'services',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  MESSAGES: 'scheduled_messages'
} as const;

// Generic entity query functions
export async function getEntityWithRelations(
  supabase: DbClient,
  entityType: string,
  id: string,
  relations: Record<string, any> = {}
) {
  const selectFields = Object.keys(relations).join(', ');
  const query = selectFields
    ? supabase.from(entityType).select(`*, ${selectFields}`).eq('id', id)
    : supabase.from(entityType).select('*').eq('id', id);

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw new Error(`Failed to fetch ${entityType}`);
  }

  return data;
}

export async function getEntitiesWithRelations(
  supabase: DbClient,
  entityType: string,
  relations: Record<string, any> = {},
  filters: Record<string, any> = {},
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
  const selectFields = Object.keys(relations).join(', ');
  let query = selectFields
    ? supabase.from(entityType).select(`*, ${selectFields}`)
    : supabase.from(entityType).select('*');

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw new Error(`Failed to fetch ${entityType}`);
  }

  return data || [];
}

// Predefined relation patterns for entities
export const entityRelations = {
  customers: {
    'organization:organizations(name)': true
  },
  organizations: {
    'customers!inner(count)': true
  },
  jobs: {
    'customer:customers(name, email, phone)': true,
  },
  offers: {
    'organization:organizations(name, legal_name, country)': true,
    'offer_services(count)': true
  },
  services: {},
};

// Wrapper functions
export async function getCustomersServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Customer[]> {
  return getCustomersServer(supabase, filters);
}

export async function getCustomerServerWrapper(supabase: DbClient, id: string): Promise<Customer | null> {
  return getCustomerServer(supabase, id);
}

export async function getOrganizationsServerWrapper(supabase: DbClient): Promise<Organization[]> {
  return getOrganizationsServer(supabase);
}

export async function getOrganizationServerWrapper(supabase: DbClient, id: string): Promise<Organization | null> {
  return getOrganizationServer(supabase, id);
}

export async function getServicesServerWrapper(supabase: DbClient): Promise<Service[]> {
  return getServicesServer(supabase);
}

export async function getServiceServerWrapper(supabase: DbClient, id: string): Promise<Service | null> {
  return getServiceServer(supabase, id);
}

export async function getOffersServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Offer[]> {
  return getOffersServer(supabase, filters);
}

export async function getOfferServerWrapper(supabase: DbClient, id: string): Promise<Offer | null> {
  return getOfferServer(supabase, id);
}

export async function getJobsServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Job[]> {
  return getJobsServer(supabase, filters);
}

export async function getJobServerWrapper(supabase: DbClient, id: string): Promise<Job | null> {
  return getJobServer(supabase, id);
}

export async function getDashboardDataWrapper(supabase: DbClient) {
  return getDashboardData(supabase);
}

// Wrapper for offer selected links query
export async function getOfferSelectedLinksWrapper(supabase: DbClient, offerId: string): Promise<string[]> {
  const { data: linkRows } = await supabase
    .from("offer_selected_links")
    .select("link_id")
    .eq("offer_id", offerId);
  return (linkRows || []).map((r: { link_id: string }) => r.link_id);
}

// Wrapper for corporate entity service
export async function getCorporateEntitiesWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("corporate_entities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching corporate entities:", error);
    return [];
  }

  return data || [];
}

// Wrapper for default corporate entity
export async function getDefaultCorporateEntityWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("corporate_entities")
    .select("*")
    .eq("is_default", true)
    .single();

  if (error) {
    console.error("Error fetching default corporate entity:", error);
    return null;
  }

  return data;
}

// Wrapper for payment terms
export async function getPaymentTermsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_payment_terms")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching payment terms:", error);
    return [];
  }

  return data || [];
}

// Wrapper for delivery conditions
export async function getDeliveryConditionsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_delivery_conditions")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching delivery conditions:", error);
    return [];
  }

  return data || [];
}

// Wrapper for offer link presets
export async function getOfferLinkPresetsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_offer_links")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching offer link presets:", error);
    return [];
  }

  return data || [];
}
