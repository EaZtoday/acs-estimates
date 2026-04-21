import { unstable_cache } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

const STATIC_CACHE_CONFIG = {
  revalidate: 300,
  tags: ['static-data']
};

export const getStaticCustomers = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('customers')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `)
      .order('name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch customers');
    return data || [];
  },
  ['static-customers'],
  STATIC_CACHE_CONFIG
);

export const getStaticOrganizations = unstable_cache(
  async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        customers!inner(count)
      `)
      .order('name', { ascending: true });

    if (error) throw new Error('Failed to fetch organizations');

    return (data || []).map(org => ({
      ...org,
      customer_count: Array.isArray(org.customers) ? org.customers.length : 0
    }));
  },
  ['static-organizations'],
  STATIC_CACHE_CONFIG
);

export const getStaticOffers = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(name, legal_name, country),
        offer_services(count)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch offers');

    return (data || []).map(offer => ({
      ...offer,
      services_count: (offer as any).offer_services?.[0]?.count || 0
    }));
  },
  ['static-offers'],
  STATIC_CACHE_CONFIG
);

export const getStaticJobs = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch jobs');
    return data || [];
  },
  ['static-jobs'],
  STATIC_CACHE_CONFIG
);

export const getStaticServices = unstable_cache(
  async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error('Failed to fetch services');
    return data || [];
  },
  ['static-services'],
  {
    ...STATIC_CACHE_CONFIG,
    revalidate: 3600
  }
);

export async function invalidateStaticCache(entityType: string) {
  console.log(`Invalidating static cache for ${entityType}`);
}

export async function refreshStaticData(entityType: string, supabase: SupabaseClient) {
  try {
    switch (entityType) {
      case 'customers':
        await getStaticCustomers(supabase);
        break;
      case 'organizations':
        await getStaticOrganizations(supabase);
        break;
      case 'offers':
        await getStaticOffers(supabase);
        break;
      case 'jobs':
        await getStaticJobs(supabase);
        break;
      case 'services':
        await getStaticServices(supabase);
        break;
    }
  } catch (error) {
    console.error(`Background refresh failed for ${entityType}:`, error);
  }
}
