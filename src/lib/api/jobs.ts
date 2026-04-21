import { ApiService } from '../api-service';
import { createServerSupabaseClient } from '../supabase-server';
import type { Organization } from './organizations';

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  type: 'estimate' | 'job';
  service_type: string;
  stories: number;
  panes_count: number;
  hard_water_stains: boolean;
  frequency: string;
  status: string;
  price_estimate: number;
  notes?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  [key: string]: unknown;
}

export interface CreateJobInput {
  customer_id: string;
  type: 'estimate' | 'job';
  service_type?: string;
  stories?: number;
  panes_count?: number;
  hard_water_stains?: boolean;
  frequency?: string;
  status?: string;
  price_estimate?: number;
  notes?: string;
}

class JobService extends ApiService<Job> {
  constructor() {
    super('jobs');
  }

  async getById(id: string): Promise<Job | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Job;
  }

  async update(id: string, updates: Partial<Job>): Promise<Job> {
    const safeUpdates = { ...updates };
    if ('updated_at' in safeUpdates) delete safeUpdates.updated_at;
    if ('created_at' in safeUpdates) delete safeUpdates.created_at;
    if ('id' in safeUpdates) delete safeUpdates.id;

    try {
      return await super.update(id, safeUpdates);
    } catch (error) {
      console.error(`Error updating job with ID: ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await super.delete(id);
    } catch (error) {
      console.error(`Error deleting job with ID: ${id}`, error);
      throw error;
    }
  }

  async create(data: CreateJobInput): Promise<Job> {
    try {
      const jobData = {
        ...data,
        status: data.status || 'estimate_requested',
        type: data.type || 'estimate'
      };

      const supabase = await createServerSupabaseClient();
      const { data: job, error } = await (supabase as any)
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return job as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();
