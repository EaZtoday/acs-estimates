"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import LinkedData, {
  LinkedDataEmptyState,
} from "@/components/ui/composite/linked-data";
import { Button } from "@/components/ui/primitives/button";
import { Edit, ExternalLink, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  company_role?: string;
  created_at: string;
  country?: string;
}

interface LinkedCustomersProps {
  organizationId: string;
}

export default function LinkedCustomers({
  organizationId,
}: LinkedCustomersProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("organization_id", organizationId)
          .order("name");

        if (error) {
          console.error("Error fetching customers:", error);
          setError("Failed to load customers");
        } else {
          setCustomers(data || []);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Failed to load customers");
      } finally {
        setIsLoading(false);
      }
    }

    if (organizationId) {
      fetchCustomers();
    }
  }, [organizationId]);

  const handleCreateCustomer = () => {
    router.push(`/dashboard/customers/new?organization_id=${organizationId}`);
  };

  const handleEditCustomer = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  const handleViewCustomer = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`);
  };

  const formatLocal = (dateString: string) => formatDate(dateString);

  if (error) {
    return (
      <LinkedData title="Linked Customers">
        <div className="text-center py-8">
          <p className="text-red-600">Error loading customers: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Retry
          </Button>
        </div>
      </LinkedData>
    );
  }

  return (
    <LinkedData
      title="Linked Customers"
      subtitle={`${customers.length} customer${
        customers.length !== 1 ? "s" : ""
      } associated with this organization`}
      onAddNew={handleCreateCustomer}
      addButtonText="Add Customer"
      isLoading={isLoading}
    >
      {customers.length === 0 ? (
        <LinkedDataEmptyState
          title="No customers yet"
          description="Add customers to this organization to get started."
          actionText="Add Customer"
          onAction={handleCreateCustomer}
        />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium text-neutral-900 truncate">
                      {customer.name}
                    </h4>
                    {customer.company_role && (
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                        {customer.company_role}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-neutral-500">
                    <span className="truncate">{customer.email}</span>
                    {customer.country && <span>{customer.country}</span>}
                    <span>Joined: {formatLocal(customer.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCustomer(customer.id)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCustomer(customer.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </LinkedData>
  );
}
