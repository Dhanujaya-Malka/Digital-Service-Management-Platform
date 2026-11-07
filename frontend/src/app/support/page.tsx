'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  MessageCircle, 
  FileText, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Send,
  HelpCircle
} from 'lucide-react';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const WHATSAPP_NUMBER = '+94761597020';
  const WHATSAPP_DISPLAY = '+94 76 159 7020';
  const SUPPORT_EMAIL = 'v2nexus.team@gmail.com';
  const WHATSAPP_LINK = `https://wa.me/94761597020?text=${encodeURIComponent('Hello V2Nexus Support, I need assistance with my service.')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please enter your email and message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
      const response = await fetch(`${API_URL}/api/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setStatusMessage(`Thank you! Your message has been sent directly to ${SUPPORT_EMAIL}. We will reply within 24 hours.`);
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        // Fallback: Open mailto directly
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject || 'Support Inquiry')}&body=${encodeURIComponent(
          `From: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\n${formData.message}`
        )}`;
        setSubmitStatus('success');
        setStatusMessage(`Your email client has been opened to send your inquiry directly to ${SUPPORT_EMAIL}.`);
      }
    } catch (err) {
      // Fallback: Open mailto directly
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(formData.subject || 'Support Inquiry')}&body=${encodeURIComponent(
        `From: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\n\n${formData.message}`
      )}`;
      setSubmitStatus('success');
      setStatusMessage(`Your message was prepared. Please send it through your email client to ${SUPPORT_EMAIL}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Clock className="h-3.5 w-3.5" />
            <span>24/7 Dedicated Customer Care</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            How can we help you today?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            Our support team is available around the clock via WhatsApp and Email to assist you with configurations, connections, or billing.
          </p>
          
          {/* Quick Search */}
          <div className="max-w-md mx-auto flex gap-2">
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers or ISP setup..." 
              className="h-11 text-sm bg-muted/20" 
            />
            <Link href="/how-it-works">
              <Button className="h-11 px-6 font-semibold gap-1.5">
                <span>Guides</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Core Support Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          
          {/* Card 1: Knowledge Base */}
          <div className="bg-card border border-border/70 rounded-2xl p-7 text-center hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Browse our step-by-step setup guides for NetMod, v2box, and SLT/Dialog ISP packages.
              </p>
            </div>
            <Link href="/how-it-works" className="w-full">
              <Button variant="outline" className="w-full h-11 text-xs sm:text-sm font-semibold">
                View Setup Guides
              </Button>
            </Link>
          </div>
          
          {/* Card 2: Live Chat / WhatsApp (With Number +94761597020) */}
          <div className="bg-card border-2 border-emerald-500/40 rounded-2xl p-7 text-center hover:border-emerald-500 transition-all shadow-md shadow-emerald-500/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Fastest (24/7)
            </div>
            <div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-1">WhatsApp Live Chat</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs mb-3 border border-emerald-500/25">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{WHATSAPP_DISPLAY}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Get immediate real-time assistance directly from our support engineers on WhatsApp.
              </p>
            </div>
            <a 
              href={WHATSAPP_LINK}
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full"
            >
              <Button className="w-full h-11 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </Button>
            </a>
          </div>

          {/* Card 3: Email Support (v2nexus.team@gmail.com) */}
          <div className="bg-card border border-border/70 rounded-2xl p-7 text-center hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-1">Email Support</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-foreground font-mono text-xs mb-3 border border-border/60">
                <span>{SUPPORT_EMAIL}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Send us an email anytime and our dedicated team will get back to you within 24 hours.
              </p>
            </div>
            <a 
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('V2Nexus Support Inquiry')}`}
              className="w-full"
            >
              <Button variant="outline" className="w-full h-11 text-xs sm:text-sm font-semibold gap-2">
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </Button>
            </a>
          </div>

        </div>

        {/* Direct Contact Form Section */}
        <div className="max-w-2xl mx-auto bg-card border border-border/80 rounded-3xl p-6 sm:p-10 shadow-xl relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Send Us a Direct Message</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              Messages submitted here are routed directly to <strong className="text-foreground">{SUPPORT_EMAIL}</strong>.
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{statusMessage}</div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-xs sm:text-sm text-destructive flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{statusMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">First Name</label>
                <Input 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Kasun" 
                  className="h-10 text-sm bg-muted/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Last Name</label>
                <Input 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Perera" 
                  className="h-10 text-sm bg-muted/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Your Email Address *</label>
              <Input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. yourname@gmail.com" 
                className="h-10 text-sm bg-muted/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject</label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g. Configuration issue or package question" 
                className="h-10 text-sm bg-muted/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Message *</label>
              <textarea 
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="flex w-full rounded-xl border border-input bg-muted/20 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Describe what you need help with in detail..."
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-11 text-sm font-bold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 gap-2 mt-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message to Support'}</span>
            </Button>
          </form>

          {/* Quick WhatsApp Reminder */}
          <div className="mt-6 pt-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              <span>Need immediate setup help?</span>
            </span>
            <a 
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Chat directly on WhatsApp ({WHATSAPP_DISPLAY})</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
