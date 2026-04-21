import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/api/customers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/customers
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    
    // Get customers based on filters
    let customers;
    if (organizationId) {
      customers = await customerService.getByOrganizationId(organizationId);
    } else {
      customers = await customerService.getAll();
    }
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error in GET /api/customers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 