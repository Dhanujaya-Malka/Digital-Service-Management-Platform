'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Activity } from 'lucide-react';

export default function UsagePage() {
  const { usage, subscription, packages } = useApp();
  
  const activePackage = packages.find(p => p.id === subscription?.packageId);
  const usageLimit = activePackage?.trafficLimit || 0;
  
  // Mock data for the chart (if we were using recharts)
  // Since we aren't adding heavy charting libs right now, we'll build a simple CSS bar chart

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Traffic Usage</h1>
        <p className="text-muted-foreground mt-1">Monitor your bandwidth consumption for the current billing cycle.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Used</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usage?.total.toFixed(2) || 0} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              {usageLimit === 0 ? 'No limit' : `of ${usageLimit} GB total limit`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloaded</CardTitle>
            <ArrowDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usage?.download.toFixed(2) || 0} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total incoming traffic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploaded</CardTitle>
            <ArrowUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{usage?.upload.toFixed(2) || 0} GB</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total outgoing traffic
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage (Last 7 Days)</CardTitle>
          <CardDescription>Estimated bandwidth usage per day</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Simple CSS-based bar chart */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {[1.2, 0.8, 2.1, 1.5, 0.4, 0.9, 1.5].map((val, i) => {
              // Calculate height percentage based on max value (2.1)
              const height = (val / 2.5) * 100;
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                  <div className="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}GB
                  </div>
                  <div className="w-full bg-secondary rounded-t-sm relative flex justify-center h-full">
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500 hover:bg-primary/80" 
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">{days[i]}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
