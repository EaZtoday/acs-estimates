import {
  LayoutDashboard,
  Gauge,
  Building2,
  FileText,
  Users,
  NotebookTabs,
  Package,
  Calendar,
  MessageSquare,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function getDashboardNavigation(): NavigationItem[] {
  return [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      name: "Estimates & Jobs",
      href: "/dashboard/jobs",
      icon: NotebookTabs,
    },
    {
      name: "Scheduled Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      name: "Offers",
      href: "/dashboard/offers",
      icon: FileText,
    },
    {
      name: "Services",
      href: "/dashboard/services",
      icon: Package,
    },
  ];
}
