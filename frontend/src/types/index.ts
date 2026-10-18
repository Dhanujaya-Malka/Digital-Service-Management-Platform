export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified?: boolean;
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
  category?: string; // e.g., 'basic', 'standard', 'premium', 'ultimate', 'dialog', 'slt', etc.
  deviceLimit?: string; // e.g., '1 Device', '2 Devices', 'Unlimited Devices'
  serverLocation?: string; // e.g., 'SG SERVER', 'IN SERVER', 'DE SERVER'
  validity?: string; // e.g., '1 Month', '30 Days'
  p2pTorrent?: 'Allowed' | 'Restricted';
  speedLimit?: string; // e.g., 'No Speed Limit'
  badge?: string; // e.g., 'ACTIVE', 'POPULAR', 'HOT'
  status?: 'active' | 'inactive';
  isActive?: boolean;
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

export interface NetworkConfig {
  id: string; // 'dialog' | 'hutch' | 'mobitel' | 'airtel' | 'slt'
  name: string;
  category: string;
  shortDescription: string;
  carrierBadge: string;
  supportedProtocols: string[];
  recommendedFor: string;
  pingEstimate: string;
  status: 'active' | 'maintenance' | 'coming_soon';
  verified: boolean;
}

export interface NetworkPackage {
  id: string;
  name: string;
  isp: 'slt' | 'dialog' | 'hutch' | 'airtel' | 'mobitel';
  ispName: string;
  status: 'active' | 'maintenance' | 'offline';
  serverLocation: string; // e.g. 'SG SERVER'
  validity: string; // e.g. '1 Month'
  p2pTorrent: 'Allowed' | 'Restricted';
  speedLimit: string; // e.g. 'No Speed Limit' or 'Speed Limited'
  popular?: boolean;
  features: string[];
  supportedProtocols: string[];
  latency?: string;
  description?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'gift_100' | 'percentage' | 'fixed';
  value: number; // 100 for gift_100, percentage (e.g. 20%) or fixed Rs. (e.g. 50)
  description: string;
  durationDays?: number; // e.g. 7 days trial
  createdAt: string;
  expiryDate?: string; // ISO date string until which code can be used
  maxUses: number; // default 1 for single-use gift cards
  usedCount: number; // number of times used
  isUsed: boolean; // true once usedCount >= maxUses
  usedBy?: string[]; // emails / order IDs that redeemed it
  minSpend?: number;
  maxDiscount?: number;
  isActive: boolean;
}

export type OrderStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Order {
  id: string; // e.g. ORD-2026-0812
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  telegramUsername?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  dataQuota: string;
  deviceLimit: string;
  networkId: string;
  networkName: string;
  networkPackageId?: string;
  networkPackageName?: string;
  promoCode?: string;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'bank_transfer' | 'online_gateway';
  slipFileName?: string;
  slipFileSize?: number;
  slipFileData?: string; // base64 data url for preview
  bankReference?: string;
  status: OrderStatus;
  adminNotes?: string;
  vpnProvisioned?: boolean;
  vpnDetails?: VPNConfig;
  isProvisional?: boolean; // Temporary instant access while admin verification is pending
  aiPreCheckPassed?: boolean; // AI pre-check passed for payment slip
  aiVerificationDetails?: string; // AI check details/note
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  instructions: string[];
}
