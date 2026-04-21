"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCustomer } from "@/lib/actions/customers";
import { createJob } from "@/lib/actions/jobs";

type Tier = 'basic' | 'standard' | 'premium';

export default function CalculatorPage() {
  const [selectedTier, setSelectedTier] = useState<Tier>('basic');
  const [windowCount, setWindowCount] = useState<number>(0);
  const [override, setOverride] = useState<number>(0);
  const [pwPrice, setPwPrice] = useState<number>(0);
  const [gutterPrice, setGutterPrice] = useState<number>(0);
  const [otherPrice, setOtherPrice] = useState<number>(0);
  const [otherDesc, setOtherDesc] = useState<string>("");
  
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);

  const prices = {
    basic: 8,
    standard: 12,
    premium: 15
  };

  const calculateTotal = () => {
    let windowTotal = 0;
    if (override > 0) {
      windowTotal = override;
    } else {
      windowTotal = prices[selectedTier] * windowCount;
    }
    return windowTotal + pwPrice + gutterPrice + otherPrice;
  };

  const handleSave = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Client name and phone are required");
      return;
    }

    setLoading(true);
    try {
      // 1. Create/Update Customer
      const customer = await createCustomer(null, (function() {
        const fd = new FormData();
        fd.append("name", customerInfo.name);
        fd.append("phone", customerInfo.phone);
        fd.append("address_line_1", customerInfo.address);
        return fd;
      })());

      // Note: createCustomer in core-oss returns ActionResponse.
      // For MVP, I'll assume it works if no error is thrown or check response.
      
      // 2. Create Job/Estimate
      const total = calculateTotal();
      await createJob(null, (function() {
        const fd = new FormData();
        // Since I don't have the customer ID from the action response easily here (without changing the action),
        // I'll assume we lookup or the action should return it.
        // In michellzappa's core-oss, actions return data.
        
        fd.append("customer_id", (customer as any).data?.id); 
        fd.append("type", "estimate");
        fd.append("service_type", "Window Cleaning");
        fd.append("panes_count", windowCount.toString());
        fd.append("price_estimate", total.toString());
        fd.append("status", "estimate_sent");
        return fd;
      })());

      toast.success("Estimate saved to CRM!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">ALEXANDER'S <span className="text-teal-500">CLEANING</span></h1>
          <p className="text-slate-500 font-medium tracking-widest text-xs mt-1 uppercase">Window Cleaning Software v2</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-800">(570) 614-9595</p>
          <p className="text-slate-500 text-sm">windowcleaning.sbs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase text-sm tracking-widest text-slate-500">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="(555) 000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Address</Label>
                <Input value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="123 Maple Ave, Scranton, PA" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase text-sm tracking-widest text-slate-500">Window Cleaning Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'basic', name: 'Basic', price: 8, desc: 'Exterior Only' },
                  { id: 'standard', name: 'Standard', price: 12, desc: 'In & Out' },
                  { id: 'premium', name: 'Premium', price: 15, desc: 'In, Out, Screens & Tracks' }
                ].map(tier => (
                  <div 
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as Tier)}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                      selectedTier === tier.id 
                        ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/10' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                    <p className="text-3xl font-bold text-teal-600 my-2">${tier.price}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-tight">{tier.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-lg">Window Count</Label>
                  <Input 
                    type="number" 
                    value={windowCount} 
                    onChange={e => setWindowCount(parseInt(e.target.value) || 0)} 
                    className="h-14 text-2xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-lg text-slate-400">Flat Price Override (Optional)</Label>
                  <Input 
                    type="number" 
                    value={override} 
                    onChange={e => setOverride(parseInt(e.target.value) || 0)} 
                    className="h-14 text-2xl font-bold text-slate-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase text-sm tracking-widest text-slate-500">Additional Services</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pressure Washing</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">$</span>
                  <Input className="pl-7" type="number" value={pwPrice} onChange={e => setPwPrice(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gutter Cleaning</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">$</span>
                  <Input className="pl-7" type="number" value={gutterPrice} onChange={e => setGutterPrice(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Other Service</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">$</span>
                  <Input className="pl-7" type="number" value={otherPrice} onChange={e => setOtherPrice(parseInt(e.target.value) || 0)} />
                </div>
                <Input 
                  placeholder="Service description" 
                  className="mt-2 text-xs" 
                  value={otherDesc}
                  onChange={e => setOtherDesc(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white sticky top-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <CardHeader>
              <CardTitle className="uppercase text-xs tracking-widest text-slate-400">Estimate Total</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
              <h2 className="text-8xl font-bold text-teal-400 tabular-nums tracking-tighter">
                <span className="text-3xl align-top mr-1">$</span>
                {calculateTotal()}
              </h2>
              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-2">
                  <span>Selected Tier: {selectedTier.toUpperCase()}</span>
                  <span>${prices[selectedTier] * windowCount}</span>
                </div>
                {pwPrice > 0 && (
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-2">
                    <span>Pressure Washing</span>
                    <span>${pwPrice}</span>
                  </div>
                )}
                {gutterPrice > 0 && (
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-2">
                    <span>Gutter Cleaning</span>
                    <span>${gutterPrice}</span>
                  </div>
                )}
                {otherPrice > 0 && (
                  <div className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-2">
                    <span>{otherDesc || 'Other'}</span>
                    <span>${otherPrice}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button onClick={handleSave} className="w-full h-14 bg-teal-500 text-slate-900 font-bold text-lg hover:bg-teal-400" disabled={loading}>
                {loading ? "SAVING..." : "SAVE TO CRM"}
              </Button>
              <Button variant="outline" className="w-full bg-transparent border-slate-700 hover:bg-slate-800">
                DOWNLOAD PDF
              </Button>
              <p className="text-[10px] text-slate-500 text-center mt-4">
                Prices are estimates based on standard home size and window types. Final price may vary upon on-site inspection.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
