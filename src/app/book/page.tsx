"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Star, Calendar, ShieldCheck, MapPin, Phone } from "lucide-react";
import { createCustomer } from "@/lib/actions/customers";
import { createJob } from "@/lib/actions/jobs";

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const serviceType = formData.get("serviceType") as string;
    const stories = formData.get("stories") as string;
    const preferredTime = formData.get("preferredTime") as string;

    try {
      // 1. Create Customer
      const customerFormData = new FormData();
      customerFormData.append("first_name", firstName);
      customerFormData.append("last_name", lastName);
      customerFormData.append("email", email);
      customerFormData.append("phone", phone);
      customerFormData.append("address_line_1", address);
      
      const customerResponse = await createCustomer(null, customerFormData);
      
      if (!customerResponse.data) {
        throw new Error("Failed to create customer");
      }

      const customerId = (customerResponse.data as any).id;

      // 2. Create Estimate Job
      const jobFormData = new FormData();
      jobFormData.append("customer_id", customerId);
      jobFormData.append("type", "estimate");
      jobFormData.append("service_type", serviceType);
      jobFormData.append("stories", stories);
      jobFormData.append("status", "estimate_requested");
      jobFormData.append("notes", `Preferred Appointment Time: ${preferredTime}`);
      
      await createJob(null, jobFormData);

      setSubmitted(true);
      toast.success("Request successfully sent!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please check your info and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="bg-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <CheckCircle2 className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">You're Booked!</h1>
          <p className="text-xl text-slate-600">
            Thanks for trusting <span className="font-bold text-teal-600">Alexander's Cleaning</span>. Kyle or Pamella will be in touch shortly to confirm your visit.
          </p>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-2">Next Steps</p>
            <ul className="text-left space-y-4">
              <li className="flex gap-3">
                <div className="bg-teal-100 w-6 h-6 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">1</div>
                <p className="text-slate-700">We'll review your property details.</p>
              </li>
              <li className="flex gap-3">
                <div className="bg-teal-100 w-6 h-6 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">2</div>
                <p className="text-slate-700">You'll receive a confirmation SMS.</p>
              </li>
              <li className="flex gap-3">
                <div className="bg-teal-100 w-6 h-6 rounded-full flex items-center justify-center text-teal-700 font-bold shrink-0">3</div>
                <p className="text-slate-700">We arrive and make your windows shine!</p>
              </li>
            </ul>
          </div>
          <Button variant="ghost" onClick={() => setSubmitted(false)} className="text-teal-600 hover:text-teal-700 font-bold">
            Book another property
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <header className="bg-slate-900 py-6 px-10 flex justify-between items-center text-white">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">ALEXANDER'S <span className="text-teal-400">CLEANING</span></h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Professional Window Cleaning</p>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400" /> (570) 614-9595</span>
          <span className="flex items-center gap-2 cursor-pointer hover:text-teal-400 transition-colors">Pricing</span>
          <span className="flex items-center gap-2 cursor-pointer hover:text-teal-400 transition-colors">FAQ</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-5 gap-16">
        {/* Left Side: Brand & Trust */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <Badge className="bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 border-teal-200 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Limited Availability - Spring 2026
            </Badge>
            <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Spotless windows, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">zero stress.</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Kyle and Pamella are ready to make your home look its absolute best. Local, family-owned, and obsessed with quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="bg-teal-500/10 p-3 rounded-xl"><ShieldCheck className="w-6 h-6 text-teal-600" /></div>
              <div>
                <h4 className="font-bold text-slate-900">Fully Insured</h4>
                <p className="text-sm text-slate-500">Peace of mind for your property.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="bg-blue-500/10 p-3 rounded-xl"><Star className="w-6 h-6 text-blue-600" /></div>
              <div>
                <h4 className="font-bold text-slate-900">5-Star Quality</h4>
                <p className="text-sm text-slate-500">Every pane handled with care.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400 opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative space-y-6">
              <p className="text-lg italic text-slate-300">
                "Alexander’s Cleaning transformed our home. Kyle was professional, on time, and our windows have never looked better. Highly recommend!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold">JD</div>
                <div>
                  <h4 className="font-bold">John D.</h4>
                  <p className="text-xs text-slate-500">Scranton Resident</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="lg:col-span-3">
          <Card className="border-none shadow-2xl shadow-teal-900/5 rounded-[2rem] overflow-hidden">
            <div className="bg-teal-600 py-4 px-8 flex items-center justify-between">
              <p className="text-teal-50 font-bold uppercase tracking-widest text-xs">Estimate Request</p>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-teal-400 border-2 border-teal-600 text-[10px] flex items-center justify-center text-teal-900 font-black">K</div>
                <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-teal-600 text-[10px] flex items-center justify-center text-pink-900 font-black">P</div>
              </div>
            </div>
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">First Name</Label>
                      <Input name="firstName" required border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Last Name</Label>
                      <Input name="lastName" required border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Email Address</Label>
                      <Input name="email" type="email" required border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Phone Number</Label>
                      <Input name="phone" type="tel" required border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="(555) 000-0000" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
                    Service Details
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Service Address</Label>
                    <Input name="address" required border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="123 Main St, Scranton, PA" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Service Type</Label>
                      <Select name="serviceType" defaultValue="Exterior Windows">
                        <SelectTrigger className="border-none bg-slate-50 h-14 text-lg font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Exterior Windows">Exterior Windows</SelectItem>
                          <SelectItem value="Interior + Exterior">Interior + Exterior</SelectItem>
                          <SelectItem value="Gutters">Gutters</SelectItem>
                          <SelectItem value="Pressure Washing">Pressure Washing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Approx. stories</Label>
                      <Select name="stories" defaultValue="1">
                        <SelectTrigger className="border-none bg-slate-50 h-14 text-lg font-bold px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Story</SelectItem>
                          <SelectItem value="2">2 Stories</SelectItem>
                          <SelectItem value="3">3+ Stories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 uppercase text-[10px] font-black tracking-widest flex items-center gap-2"><Calendar className="w-3 h-3" /> Preferred Schedule Window</Label>
                    <Input name="preferredTime" border-none bg-slate-50 h-14 text-lg font-bold px-6 placeholder="e.g. Next week, Tuesday mornings, etc." />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-20 text-xl font-black bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl shadow-teal-500/20 group transition-all">
                  {loading ? "SENDING REQUEST..." : "SECURE YOUR ESTIMATE"}
                  <span className="block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">No payment required today. We'll contact you with a firm price.</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="py-10 bg-slate-50 border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500">
            © 2026 Alexander's Cleaning Service. Family Owned & Operated.
          </div>
          <div className="flex gap-10">
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <CheckCircle2 className="text-teal-500 w-5 h-5" />
              Bonded & Insured
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <CheckCircle2 className="text-teal-500 w-5 h-5" />
              Satisfaction Guaranteed
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
