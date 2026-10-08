import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageCircle, FileText } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Our support team is available 24/7 to help you with any issues or questions you might have.
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input placeholder="Search for answers..." className="h-12" />
            <Button className="h-12 px-8">Search</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Knowledge Base</h3>
            <p className="text-muted-foreground mb-6">
              Browse our comprehensive guides and tutorials for setting up and troubleshooting.
            </p>
            <Button variant="outline" className="w-full">View Guides</Button>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Live Chat</h3>
            <p className="text-muted-foreground mb-6">
              Get immediate assistance from our customer support representatives.
            </p>
            <Button variant="default" className="w-full">Start Chat</Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Email Support</h3>
            <p className="text-muted-foreground mb-6">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Us Directly</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input placeholder="How can we help?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>
            <Button className="w-full h-12 text-base">Send Message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
