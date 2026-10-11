export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  trafficLimit: number; // in GB, 0 or undefined for unlimited
  features: string[];
  popular: boolean;
  availableSlots: number; // For stock/availability
  category?: string; // e.g., 'dialog', 'slt', 'mobitel', 'airtel', 'hutch'
  serverLocation?: string; // e.g., 'SG SERVER', 'IN SERVER', 'DE SERVER'
  validity?: string; // e.g., '1 Month', '30 Days'
  p2pTorrent?: 'Allowed' | 'Restricted';
  speedLimit?: string; // e.g., 'No Speed Limit'
  badge?: string; // e.g., 'ACTIVE', 'POPULAR', 'HOT'
}

export interface Subscription {
  id: string;
  packageId: string;
  status: 'active' | 'expired' | 'pending';
  startDate: string; // ISO date string
  expiryDate: string; // ISO date string
}

export interface Usage {
  upload: number; // in GB
  download: number; // in GB
  total: number; // in GB
}

export interface VPNConfig {
  server: string;
  status: 'connected' | 'disconnected';
  configuration: string; // actual config string or URL
  qrCode: string; // base64 or URL
}
