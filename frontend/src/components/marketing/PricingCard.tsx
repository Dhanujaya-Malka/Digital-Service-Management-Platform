import { useRouter } from 'next/navigation';
import { Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { useApp } from '@/context/AppContext';

interface PricingCardProps {
  pkg: Package;
}

export default function PricingCard({ pkg }: PricingCardProps) {
  const router = useRouter();
  const { user } = useApp();

  const handleChoosePlan = () => {
    // If logged in, go to dashboard/subscription (or checkout)
    // If not, go to register
    if (user) {
      router.push('/dashboard/subscription');
    } else {
      router.push('/register');
    }
  };

  return (
    <Card className={`relative flex flex-col h-full ${pkg.popular ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02] md:scale-105 z-10' : 'border-border'}`}>
      {pkg.popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <Badge className="bg-primary hover:bg-primary text-primary-foreground font-semibold px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-8 pt-8">
        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
        <CardDescription className="mt-2">For individuals and families</CardDescription>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs bg-muted/50">
            Only {pkg.availableSlots} slots available
          </Badge>
        </div>
        <div className="mt-6 flex items-baseline justify-center">
          <span className="text-3xl font-extrabold mr-1">Rs.</span>
          <span className="text-5xl font-extrabold">{pkg.price}</span>
          <span className="text-muted-foreground ml-2 font-medium">/ month</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Check className="h-5 w-5 text-blue-500 font-bold flex-shrink-0" />
            <span className="text-base text-foreground">{pkg.duration} Days</span>
          </div>
          <div className="flex items-center gap-4">
            <Check className="h-5 w-5 text-blue-500 font-bold flex-shrink-0" />
            <span className="text-base text-foreground">
              {pkg.trafficLimit === 0 ? 'Unlimited Data' : `${pkg.trafficLimit} GB Data`}
            </span>
          </div>
          {pkg.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4">
              <Check className="h-5 w-5 text-blue-500 font-bold flex-shrink-0" />
              <span className="text-base text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-6 pb-8 flex gap-2">
        <Button 
          className="flex-1 h-12 text-base font-semibold" 
          variant={pkg.popular ? 'default' : 'outline'}
          onClick={handleChoosePlan}
        >
          Choose Plan
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="h-12 w-12 p-0 flex-shrink-0" title="More Info">
              <Info className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{pkg.name} - Detailed Info</DialogTitle>
              <DialogDescription>
                Full specifications and bypass instructions for this package.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How to use this package:</h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                  <li>Ensure you have activated the base data package from your ISP (e.g., Zoom/Teams pack).</li>
                  <li>Download our recommended app (NetMod for Android/Windows, v2box for iOS).</li>
                  <li>After purchasing, you will receive a configuration code in your Dashboard.</li>
                  <li>Import the code into the app and connect. All your traffic will be completely bypassed!</li>
                </ul>
              </div>
              <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground border border-border">
                <strong>Note:</strong> Speeds may depend on your local network coverage and the specific ISP package limitations (if any). Our servers guarantee 99.9% uptime and unlimited bandwidth.
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
