import StaticEntityIndexWithToggle from "./static-entity-index-with-toggle";
import type { EntityFilterOptions } from "@/lib/server-data";
interface StaticEntityIndexPageProps {
  entity:
    | "organizations"
    | "customers"
    | "offers"
    | "jobs"
    | "services"
    | "scheduled_messages";
  initial?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  items?: any[];
  filterOptions: EntityFilterOptions;
}

const entityConfig = {
  organizations: {
    title: "Organizations",
    createLink: "/dashboard/organizations/new",
    createButtonText: "Add Organization",
  },
  customers: {
    title: "Customers",
    createLink: "/dashboard/customers/new",
    createButtonText: "Add Customer",
  },
  offers: {
    title: "Offers",
    createLink: "/dashboard/offers/new",
    createButtonText: "Add Offer",
  },
  jobs: {
    title: "Jobs",
    createLink: "/dashboard/jobs/new",
    createButtonText: "Add Job",
  },
  services: {
    title: "Services",
    createLink: "/dashboard/services/new",
    createButtonText: "Add Service",
  },
  scheduled_messages: {
    title: "Scheduled Messages",
    createLink: "",
    createButtonText: "",
  },
};

export default async function StaticEntityIndexPage({
  entity,
  initial,
  supabase,
  items,
  filterOptions,
}: StaticEntityIndexPageProps) {
  const config = entityConfig[entity];

  return (
    <StaticEntityIndexWithToggle
      entity={entity}
      items={items || []}
      initial={initial}
      title={config.title}
      createLink={config.createLink}
      createButtonText={config.createButtonText}
      filterOptions={filterOptions}
    />
  );
}
