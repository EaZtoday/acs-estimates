"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetcher } from '@/lib/fetchers';

// Customer interface
export interface Customer {
  id: string;
  name: string;
  email?: string;
  company_role?: string;
  organization_id?: string;
  notes?: string;
  linkedin_url?: string;
  last_customer_date?: string;
  phone?: string;
  headline?: string;
  location?: string;
  country?: string;
  connection_count?: number;
  profile_image_url?: string;
  corporate_email?: string;
  created_at: string;
  updated_at?: string;
}

interface UseCustomersOptions {
  suspense?: boolean;
  organizationId?: string; // Filter customers by organization
  enabled?: boolean; // Disable client fetching when server data is provided
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const enabled = options.enabled ?? true;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch customers using API route
  const fetchCustomers = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsValidating(true);
      setError(null);
      
      const url = options.organizationId 
        ? `/api/customers?organization_id=${options.organizationId}`
        : '/api/customers';
      
      const result = await fetcher(url);
      setCustomers(result);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [options.organizationId, enabled]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    fetchCustomers();
  }, [fetchCustomers, enabled]);

  // Refresh function
  const refreshCustomers = () => {
    if (!enabled) return;
    fetchCustomers();
  };

  // Create customer function (placeholder - would need to be implemented with Server Action)
  const createCustomer = async () => {
    // This would need to be implemented with the createCustomer Server Action
    // For now, just refresh the list
    await refreshCustomers();
  };

  // Fetch single customer
  const fetchCustomer = async (id: string) => {
    // This would need to be implemented with the getCustomerServer Server Action
    // For now, return from the cached list
    return customers.find(customer => customer.id === id) || null;
  };

  // Update customer function (placeholder)
  const updateCustomer = async () => {
    // This would need to be implemented with the updateCustomer Server Action
    // For now, just refresh the list
    await refreshCustomers();
  };

  // Delete customer function (placeholder)
  const deleteCustomer = async () => {
    // This would need to be implemented with the deleteCustomer Server Action
    // For now, just refresh the list
    await refreshCustomers();
  };

  return {
    customers,
    isLoading,
    error,
    isValidating,
    createCustomer,
    fetchCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
  };
} 