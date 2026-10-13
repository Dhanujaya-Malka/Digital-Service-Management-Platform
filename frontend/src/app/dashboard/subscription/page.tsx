'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, CheckCircle2, AlertTriangle, Smartphone, HardDrive } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { subscription, packages } = useApp();
  
  const activePackage = packages.find(p => p.id === subscription?.packageId);
  const startDate = subscription ? new Date(subscription.startDate).toLocaleDateString() : 'N/A';
  const expiryDate = subscription ? new Date(subscription.expiryDate).toLocaleDateString() : 'N/A';
  
  const isActive = subscription?.status === 'active';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your billing and plan details.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active VPN subscription details.</CardDescription>
          </CardHeader>
          <CardContent>
            {activePackage ? (
              <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center p-6 border border-border rounded-xl bg-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">{activePackage.name}</h3>
                    <Badge variant={isActive ? 'default' : 'destructive'} className="capitalize">
                      {subscription?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Rs. {activePackage.price} / {activePackage.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      <span>{activePackage.trafficLimit > 0 ? `${activePackage.trafficLimit} GB Data` : 'Unlimited Data'}</span>
                    </div>
                    {activePackage.deviceLimit && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>{activePackage.deviceLimit}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Started: {startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Expires: {expiryDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button size="lg">Renew Subscription</Button>
                  <Button variant="outline">Change Plan</Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-xl">
                <p className="text-muted-foreground mb-4">You do not have an active subscription.</p>
                <Link href="/pricing">
                  <Button>Browse Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {activePackage && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activePackage.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>{activePackage.trafficLimit === 0 ? 'Unlimited Bandwidth' : `${activePackage.trafficLimit} GB Bandwidth`}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent invoices for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">Invoice #INV-202{i+3}-{10+i}</p>
                        <p className="text-xs text-muted-foreground">Paid via Credit Card •••• 4242</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs. {activePackage.price}</p>
                        <p className="text-xs text-primary cursor-pointer hover:underline">Download PDF</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
