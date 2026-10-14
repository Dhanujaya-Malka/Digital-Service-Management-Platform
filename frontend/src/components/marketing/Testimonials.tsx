import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Kamal Perera',
      role: 'Freelancer',
      content: 'V2Nexus has completely changed how I work. The speeds are incredible and the connection never drops.',
      rating: 5,
    },
    {
      name: 'Nimal Silva',
      role: 'Software Engineer',
      content: 'I have tried many VPNs, but this one is by far the most reliable. The V2Ray QR code feature is super convenient.',
      rating: 5,
    },
    {
      name: 'Ruwan Fernando',
      role: 'Content Creator',
      content: 'Great value for money. 4K streaming works flawlessly without any buffering. Highly recommended!',
      rating: 4,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by users worldwide</h2>
          <p className="text-lg text-muted-foreground">
            Don't just take our word for it. See what our customers have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <Card key={i} className="border-border/50 bg-muted/20">
              <CardContent className="pt-8 px-6 pb-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`h-5 w-5 ${idx < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} 
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">
                  "{review.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{review.name}</h4>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
