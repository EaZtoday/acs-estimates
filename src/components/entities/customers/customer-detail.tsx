"use client";

import { Customer } from "@/lib/api/customers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card";
import { ProfileImage } from "@/components/ui/data-display/profile-image";
import {
  Mail,
  MapPin,
  Calendar,
  Phone,
  Home,
  Clock,
  Briefcase
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives/badge";

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const formatLocal = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const displayName = customer.first_name 
    ? `${customer.first_name} ${customer.last_name || ""}` 
    : customer.name;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-24 bg-gradient-to-r from-teal-500 to-blue-600" />
        <CardContent className="pt-0 -mt-12">
          <div className="flex flex-col md:flex-row items-end gap-6 px-4">
            <ProfileImage
              src={customer.profile_image_url}
              alt={displayName}
              size="xl"
              fallback={displayName}
              className="border-4 border-white shadow-lg"
            />
            <div className="pb-2 flex-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{displayName}</h1>
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {customer.city ? `${customer.city}, ${customer.state || ""}` : "No location set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Address */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.phone && (
                <div className="flex items-center gap-4">
                  <div className="bg-teal-50 p-2 rounded-lg text-teal-600"><Phone className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Phone</p>
                    <p className="font-bold text-slate-900">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Mail className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Email</p>
                    <p className="font-bold text-slate-900 truncate">{customer.email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-600"><Home className="h-4 w-4 mt-1" /></div>
                <div>
                  <p className="font-bold text-slate-900">
                    {customer.address_line_1 || "No address provided"}
                  </p>
                  {(customer.city || customer.zip) && (
                    <p className="text-slate-500">
                      {customer.city}{customer.state ? `, ${customer.state}` : ""} {customer.zip}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Activity Overview</CardTitle>
              <Badge variant="outline" className="text-xs font-bold text-teal-600 border-teal-100 bg-teal-50">
                Created {formatLocal(customer.created_at)}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Jobs</p>
                  <p className="text-2xl font-black text-slate-900">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimates</p>
                  <p className="text-2xl font-black text-slate-900">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                  <p className="text-2xl font-black text-blue-600">0</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                  <p className="text-2xl font-black text-teal-600">$0</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Recent Timeline
                </h4>
                <div className="border-l-2 border-slate-100 ml-2 pl-6 space-y-6">
                   <p className="text-sm text-slate-400 italic">No recent activity found. Once a job or estimate is created, it will appear here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
