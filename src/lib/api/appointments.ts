import { ApiService } from '../api-service';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface Appointment {
  id: string;
  created_at: string;
  job_id: string;
  customer_id: string;
  type: string;
  start_time: string;
  end_time: string;
  tech_name: string | null;
  status: string;
  customer?: {
    name: string;
  };
  job?: {
    service_type: string;
  };
}

export const appointmentService = new class AppointmentService extends ApiService<Appointment> {
  constructor() {
    super('appointments');
  }

  async getAll(): Promise<Appointment[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(name),
        job:jobs(service_type)
      `)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data as any[];
  }
}();
