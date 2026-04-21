import { appointmentService } from "@/lib/api/appointments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Tool } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

export default async function SchedulePage() {
  const appointments = await appointmentService.getAll();
  
  // Group by day
  const grouped = appointments.reduce((acc, app) => {
    const day = format(parseISO(app.start_time), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(app);
    return acc;
  }, {} as Record<string, typeof appointments>);

  const sortedDays = Object.keys(grouped).sort();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Window Cleaning Schedule</h1>
      </div>

      <div className="space-y-8">
        {sortedDays.length === 0 && (
          <Card className="bg-slate-50 border-dashed">
            <CardContent className="h-40 flex items-center justify-center text-slate-500">
              No appointments scheduled yet.
            </CardContent>
          </Card>
        )}
        
        {sortedDays.map(day => (
          <div key={day} className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-700 border-b pb-2">
              <CalendarIcon className="h-5 w-5" />
              {format(parseISO(day), 'EEEE, MMMM do, yyyy')}
            </div>

            <div className="grid gap-4">
              {grouped[day].map(app => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center w-20 py-2 bg-slate-100 rounded-lg">
                        <span className="text-sm font-bold text-slate-900">
                          {format(parseISO(app.start_time), 'h:mm a')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(parseISO(app.end_time), 'h:mm a')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-none">
                          {app.customer?.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Tool className="h-3 w-3" /> {app.job?.service_type || 'Window Cleaning'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Badge variant={app.type === 'estimate' ? 'outline' : 'default'} className="capitalize">
                              {app.type}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {app.tech_name && (
                        <span className="flex items-center gap-1 text-sm text-slate-600">
                          <User className="h-4 w-4" /> {app.tech_name}
                        </span>
                      )}
                      <Badge className={
                        app.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
