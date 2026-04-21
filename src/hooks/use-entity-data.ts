import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { instantConfig } from '@/lib/swr-config';

interface UseEntityDataOptions {
  entity: string;
  initialData?: unknown[];
  revalidateOnMount?: boolean;
  refreshInterval?: number;
}

export function useEntityData({
  entity,
  initialData,
  revalidateOnMount = false,
  refreshInterval = 0,
}: UseEntityDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    `entities/${entity}`,
    fetcher,
    {
      ...instantConfig,
      fallbackData: initialData,
      revalidateOnMount,
      refreshInterval,
    }
  );

  return {
    data: (data as unknown[]) || [],
    error,
    isLoading,
    mutate,
    isEmpty: !isLoading && (!data || data.length === 0),
  };
}

// Specific hooks for each entity type
export function useOrganizations(initialData?: any[]) {
  return useEntityData({ entity: 'organizations', initialData });
}

export function useCustomers(initialData?: any[]) {
  return useEntityData({ entity: 'customers', initialData });
}

export function useOffers(initialData?: any[]) {
  return useEntityData({ entity: 'offers', initialData });
}

export function useJobs(initialData?: any[]) {
  return useEntityData({ entity: 'jobs', initialData });
}

export function useServices(initialData?: any[]) {
  return useEntityData({ entity: 'services', initialData });
}
