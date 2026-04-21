import { ApiService } from '../api-service';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  email: string | null;
  name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line_1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  organization_id: string | null;
  linkedin_url: string | null;
  company_role: string | null;
  headline: string | null;
  location: string | null;
  country: string | null;
  corporate_email: string | null;
  profile_image_url: string | null;
  organization?: {
    id: string;
    name: string;
    country?: string;
  };
  [key: string]: unknown;
}

export interface CreateCustomerInput {
  email?: string | null;
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address_line_1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  organization_id?: string | null;
  linkedin_url?: string | null;
  company_role?: string | null;
  headline?: string | null;
  location?: string | null;
  country?: string | null;
  corporate_email?: string | null;
  profile_image_url?: string | null;
  [key: string]: unknown;
}

export const customerService = new class CustomerService extends ApiService<Customer> {
  constructor() {
    super('customers');
  }

  async getAll(filters?: Record<string, string>): Promise<Customer[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('customers').select(`
      *,
      organization:organizations(
        id,
        name,
        country
      )
    `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching customers:`, error);
      throw error;
    }

    return data as Customer[];
  }

  async create(item: CreateCustomerInput): Promise<Customer> {
    const customerWithDefaults = {
      ...item,
      name: item.name || (item.email && typeof item.email === 'string' ? item.email.split("@")[0] : 'Unnamed Customer'),
    };

    const supabase = await createServerSupabaseClient();

    const { data, error } = await (supabase as any)
      .from('customers')
      .insert(customerWithDefaults)
      .select()
      .single();

    if (error) {
      console.error(`Error creating customer:`, error);
      throw error;
    }

    return data as Customer;
  }

  async getById(id: string): Promise<Customer | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        organization:organizations (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('CustomerService: Error fetching customer:', error);
      throw error;
    }

    return data as Customer;
  }

  async getByOrganizationId(organizationId: string): Promise<Customer[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          country
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching customers for organization ${organizationId}:`, error);
      throw error;
    }

    return data as Customer[];
  }
}();
