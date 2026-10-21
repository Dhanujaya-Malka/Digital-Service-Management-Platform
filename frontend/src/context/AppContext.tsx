'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, User, Subscription, Usage, VPNConfig, NetworkConfig, NetworkPackage, PromoCode, Order, OrderStatus } from '@/types';
import { defaultPackages } from '@/data/mock-packages';
import { supportedNetworks, defaultNetworkPackages, ensureStandardVlessUrl, buildVlessUrl } from '@/data/network-configs';
import { defaultPromoCodes } from '@/data/promo-codes';

interface AppContextType {
  packages: Package[];
  addPackage: (pkg: Package) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;
  refreshPackages: () => Promise<void>;
  
  user: User | null;
  isInitialized: boolean;
  login: (user: User) => void;
  logout: () => void;

  subscription: Subscription | null;
  subscribeToPackage: (packageId: string) => void;
  usage: Usage | null;
  vpnConfig: VPNConfig | null;
  orderUsageMap: Record<string, {
    upload: number;
    download: number;
    total: number;
    uploadBytes: number;
    downloadBytes: number;
    totalBytes: number;
    formattedUsed: string;
    formattedUp: string;
    formattedDown: string;
  }>;

  // Checkout & Multi-Step Flow State
  selectedPlan: Package | null;
  selectedNetwork: NetworkConfig | null;
  selectedNetworkPackage: NetworkPackage | null;
  selectPlan: (pkg: Package) => void;
  selectNetwork: (network: NetworkConfig) => void;
  selectNetworkPackage: (networkPkg: NetworkPackage) => void;
  clearCheckoutSelection: () => void;

  // Network Packages Manager
  networkPackages: NetworkPackage[];
  addNetworkPackage: (pkg: NetworkPackage) => void;
  updateNetworkPackage: (pkg: NetworkPackage) => void;
  deleteNetworkPackage: (id: string) => void;

  // Promo Codes & Gift Card Vouchers Manager
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  updatePromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  markPromoCodeUsed: (code: string, orderId: string, customerEmail: string) => void;

  // Orders Management
  orders: Order[];
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Server Capacity & Live Bandwidth Quota Management
  serverCapacityTb: number;
  setServerCapacityTb: (capacityTb: number) => void;
  getServerBandwidthStats: () => {
    totalCapacityGb: number;
    totalCapacityTb: number;
    usedBandwidthGb: number;
    usedBandwidthTb: number;
    remainingBandwidthGb: number;
    remainingBandwidthTb: number;
    usagePercent: number;
  };
  getEffectiveSlots: (pkg: Package) => number;
  lastQuotaResetDate: string | null;
  resetMonthlyQuota: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Mock data for dashboard
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [orderUsageMap, setOrderUsageMap] = useState<Record<string, {
    upload: number;
    download: number;
    total: number;
    uploadBytes: number;
    downloadBytes: number;
    totalBytes: number;
    formattedUsed: string;
    formattedUp: string;
    formattedDown: string;
  }>>({});
  const [vpnConfig, setVpnConfig] = useState<VPNConfig | null>(null);

  // Checkout Flow state
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig | null>(null);
  const [selectedNetworkPackage, setSelectedNetworkPackage] = useState<NetworkPackage | null>(null);
  const [networkPackages, setNetworkPackages] = useState<NetworkPackage[]>(defaultNetworkPackages);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(defaultPromoCodes);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serverCapacityTb, setServerCapacityTbState] = useState<number>(20);
  const [lastQuotaResetDate, setLastQuotaResetDate] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';

    // 1. Initial quick load from cache or defaults to prevent layout shift
    const packageVersion = localStorage.getItem('vpn_packages_ver');
    const storedPackages = localStorage.getItem('vpn_packages');
    if (storedPackages && packageVersion === 'v5') {
      try {
        const parsed = JSON.parse(storedPackages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPackages(parsed);
        } else {
          setPackages(defaultPackages);
        }
      } catch (e) {
        setPackages(defaultPackages);
      }
    } else {
      setPackages(defaultPackages);
    }

    // 2. Fetch latest live packages from PostgreSQL database
    const loadPackagesFromDb = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/packages`);
        if (res.ok) {
          const data = await res.json();
          const dbPackages: Package[] = Array.isArray(data) ? data : (data.packages || []);
          if (Array.isArray(dbPackages) && dbPackages.length > 0) {
            setPackages(dbPackages);
            localStorage.setItem('vpn_packages', JSON.stringify(dbPackages));
            localStorage.setItem('vpn_packages_ver', 'v5');
          }
        }
      } catch (err) {
        console.warn('Backend packages API unreachable, using cached packages:', err);
      }
    };
    loadPackagesFromDb();

    // Load User
    const storedUser = localStorage.getItem('vpn_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    // Load Subscription
    const storedSubscription = localStorage.getItem('vpn_subscription');
    if (storedSubscription) {
      try {
        const parsedSub = JSON.parse(storedSubscription);
        // Clean out legacy mock ID if present
        if (parsedSub?.id === 'asyfckrhgfxsy1oc50xt') {
          localStorage.removeItem('vpn_subscription');
          setSubscription(null);
        } else {
          setSubscription(parsedSub);
        }
      } catch (e) {
        setSubscription(null);
      }
    } else {
      setSubscription(null);
    }

    // Load Usage (Reset fake 777.7GB usage to 0 for clean accounts)
    const storedUsage = localStorage.getItem('vpn_usage');
    if (storedUsage) {
      try {
        const parsedUsage = JSON.parse(storedUsage);
        if (parsedUsage?.total === 777.7) {
          const cleanUsage = { upload: 0.0, download: 0.0, total: 0.0 };
          setUsage(cleanUsage);
          localStorage.setItem('vpn_usage', JSON.stringify(cleanUsage));
        } else {
          setUsage(parsedUsage);
        }
      } catch (e) {
        setUsage({ upload: 0.0, download: 0.0, total: 0.0 });
      }
    } else {
      setUsage({ upload: 0.0, download: 0.0, total: 0.0 });
    }

    // Load VPN Config
    const storedVpn = localStorage.getItem('vpn_config');
    if (storedVpn) {
      try {
        const parsedVpn = JSON.parse(storedVpn);
        if (parsedVpn?.qrCode === 'mock-qr-code' || parsedVpn?.configuration?.includes('asyfckrhgfxsy1oc50xt')) {
          localStorage.removeItem('vpn_config');
          setVpnConfig(null);
        } else {
          if (parsedVpn?.configuration) {
            parsedVpn.configuration = ensureStandardVlessUrl(parsedVpn.configuration);
            localStorage.setItem('vpn_config', JSON.stringify(parsedVpn));
          }
          setVpnConfig(parsedVpn);
        }
      } catch (e) {
        setVpnConfig(null);
      }
    } else {
      setVpnConfig(null);
    }

    // Load Selected Plan from localStorage
    const storedPlan = localStorage.getItem('vpn_selected_package');
    if (storedPlan) {
      try {
        setSelectedPlan(JSON.parse(storedPlan));
      } catch (e) {}
    }

    // Load Selected Network from localStorage
    const storedNetwork = localStorage.getItem('vpn_selected_network');
    if (storedNetwork) {
      try {
        setSelectedNetwork(JSON.parse(storedNetwork));
      } catch (e) {}
    }

    // Load Selected Network Package from localStorage
    const storedNetPkg = localStorage.getItem('vpn_selected_net_package');
    if (storedNetPkg) {
      try {
        setSelectedNetworkPackage(JSON.parse(storedNetPkg));
      } catch (e) {}
    }

    // Load Network Packages (with versioning)
    const netPkgVer = localStorage.getItem('vpn_net_packages_ver');
    const storedNetPackages = localStorage.getItem('vpn_net_packages');
    if (storedNetPackages && netPkgVer === 'v1') {
      try {
        setNetworkPackages(JSON.parse(storedNetPackages));
      } catch (e) {
        setNetworkPackages(defaultNetworkPackages);
      }
    } else {
      setNetworkPackages(defaultNetworkPackages);
      localStorage.setItem('vpn_net_packages', JSON.stringify(defaultNetworkPackages));
      localStorage.setItem('vpn_net_packages_ver', 'v1');
    }

    // Load Orders from localStorage with automatic ALPN upgrade
    const storedOrders = localStorage.getItem('vpn_orders');
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders)) {
          const upgradedOrders = parsedOrders.map((o: Order) => {
            if (o.vpnDetails?.configuration) {
              return {
                ...o,
                vpnDetails: {
                  ...o.vpnDetails,
                  configuration: ensureStandardVlessUrl(o.vpnDetails.configuration, o.sni || 'aka.ms'),
                },
              };
            }
            return o;
          });
          setOrders(upgradedOrders);
          localStorage.setItem('vpn_orders', JSON.stringify(upgradedOrders));
        }
      } catch (e) {}
    }

    // Load Promo Codes (with versioning)
    const promoVer = localStorage.getItem('vpn_promos_ver');
    const storedPromos = localStorage.getItem('vpn_promos');
    if (storedPromos && promoVer === 'v2') {
      try {
        setPromoCodes(JSON.parse(storedPromos));
      } catch (e) {
        setPromoCodes(defaultPromoCodes);
      }
    } else {
      setPromoCodes(defaultPromoCodes);
      localStorage.setItem('vpn_promos', JSON.stringify(defaultPromoCodes));
      localStorage.setItem('vpn_promos_ver', 'v2');
    }

    // Load Server Capacity (default 20 TB)
    const storedCapacity = localStorage.getItem('vpn_server_capacity_tb');
    if (storedCapacity) {
      const parsedCap = parseFloat(storedCapacity);
      if (!isNaN(parsedCap) && parsedCap > 0) {
        setServerCapacityTbState(parsedCap);
      }
    }

    // Load Last Quota Reset Date
    const storedResetDate = localStorage.getItem('vpn_last_quota_reset_date');
    if (storedResetDate) {
      setLastQuotaResetDate(storedResetDate);
    } else {
      const nowIso = new Date().toISOString();
      setLastQuotaResetDate(nowIso);
      localStorage.setItem('vpn_last_quota_reset_date', nowIso);
    }

    // Auto Monthly Reset Check: advance cycle if new calendar month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const storedMonthKey = localStorage.getItem('vpn_quota_cycle_month');
    if (storedMonthKey && storedMonthKey !== currentMonthKey) {
      console.log(`Auto Monthly Quota Reset: billing cycle advanced from ${storedMonthKey} to ${currentMonthKey}`);
      // Advance cycle and trigger monthly quota reset
      localStorage.setItem('vpn_quota_cycle_month', currentMonthKey);
      const nowIso = now.toISOString();
      setLastQuotaResetDate(nowIso);
      localStorage.setItem('vpn_last_quota_reset_date', nowIso);
      fetch(`${API_BASE}/api/admin/reset-monthly-quota`, { method: 'POST' }).catch((e) => console.warn('Auto reset error:', e));
    } else if (!storedMonthKey) {
      localStorage.setItem('vpn_quota_cycle_month', currentMonthKey);
    }

    setIsInitialized(true);
    refreshPackages();
    refreshNetworkPackages();
  }, []);

  // Live 3X-UI VPS Traffic Polling (Every 5 seconds for Real-Time Updates)
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';

    const formatBytes = (bytes: number): string => {
      if (!bytes || bytes <= 0) return '0.00 MB';
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const pollLiveTraffic = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/vpn/traffic-all`);
        if (!res.ok) return;
        const data = await res.json();
        const stats = data.stats || {};

        let cumulativeUp = 0;
        let cumulativeDown = 0;
        const newMap: Record<string, any> = {};

        // 1. Match active customer orders
        orders.forEach((order) => {
          const sanitizedEmail = (order.customerEmail || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
          const clientEmail = `${order.id}-${sanitizedEmail}`.toLowerCase();
          const uuid = (order.vpnDetails?.configuration?.split('@')?.[0]?.replace('vless://', '') || '').toLowerCase();

          const stat = stats[uuid] || stats[clientEmail] || stats[order.id.toLowerCase()];
          if (stat) {
            const upB = Number(stat.up) || 0;
            const downB = Number(stat.down) || 0;
            const totB = upB + downB;

            const upGb = Number((upB / (1024 * 1024 * 1024)).toFixed(3));
            const downGb = Number((downB / (1024 * 1024 * 1024)).toFixed(3));
            const totGb = Number((totB / (1024 * 1024 * 1024)).toFixed(3));

            const entry = {
              upload: upGb,
              download: downGb,
              total: totGb,
              uploadBytes: upB,
              downloadBytes: downB,
              totalBytes: totB,
              formattedUsed: formatBytes(totB),
              formattedUp: formatBytes(upB),
              formattedDown: formatBytes(downB),
            };

            newMap[order.id] = entry;
            if (uuid) newMap[uuid] = entry;

            // Accumulate traffic for the customer
            cumulativeUp += upB;
            cumulativeDown += downB;
          }
        });

        // 2. If single subscription exists and no orders matched
        if (subscription && cumulativeUp === 0 && cumulativeDown === 0) {
          const subUuid = (subscription.id || '').toLowerCase();
          const stat = stats[subUuid];
          if (stat) {
            cumulativeUp += (Number(stat.up) || 0);
            cumulativeDown += (Number(stat.down) || 0);
          }
        }

        const totalB = cumulativeUp + cumulativeDown;
        const totalGb = Number((totalB / (1024 * 1024 * 1024)).toFixed(3));
        const upGb = Number((cumulativeUp / (1024 * 1024 * 1024)).toFixed(3));
        const downGb = Number((cumulativeDown / (1024 * 1024 * 1024)).toFixed(3));

        setOrderUsageMap(newMap);

        const activeUsage: Usage = {
          upload: upGb,
          download: downGb,
          total: totalGb,
          uploadBytes: cumulativeUp,
          downloadBytes: cumulativeDown,
          totalBytes: totalB,
          formattedUsed: formatBytes(totalB),
          formattedUp: formatBytes(cumulativeUp),
          formattedDown: formatBytes(cumulativeDown),
        };

        setUsage(activeUsage);
        localStorage.setItem('vpn_usage', JSON.stringify(activeUsage));
      } catch (err) {
        // Keep cached stats if offline
      }
    };

    pollLiveTraffic();
    const interval = setInterval(pollLiveTraffic, 5000);
    return () => clearInterval(interval);
  }, [orders, subscription]);

  const refreshPackages = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    try {
      const res = await fetch(`${API_BASE}/api/packages`);
      if (res.ok) {
        const data = await res.json();
        const dbPackages: Package[] = Array.isArray(data) ? data : (data.packages || []);
        if (Array.isArray(dbPackages) && dbPackages.length > 0) {
          setPackages(dbPackages);
          localStorage.setItem('vpn_packages', JSON.stringify(dbPackages));
          localStorage.setItem('vpn_packages_ver', 'v5');
        }
      }
    } catch (err) {
      console.warn('Failed to refresh packages from backend:', err);
    }
  };

  const refreshNetworkPackages = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    try {
      const res = await fetch(`${API_BASE}/api/network-packages`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setNetworkPackages(data);
          localStorage.setItem('vpn_net_packages', JSON.stringify(data));
          localStorage.setItem('vpn_net_packages_ver', 'v2');
        }
      }
    } catch (err) {
      console.warn('Failed to refresh network packages from backend:', err);
    }
  };

  const addPackage = async (pkg: Package) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    // Optimistic UI update
    const updated = [...packages, pkg];
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));

    // Save to PostgreSQL database
    try {
      const res = await fetch(`${API_BASE}/api/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });
      if (res.ok) {
        const savedPkg = await res.json();
        if (savedPkg && savedPkg.id) {
          setPackages((prev) => prev.map((p) => (p.id === pkg.id ? savedPkg : p)));
        }
      } else {
        console.error('Failed to create package in database:', await res.text());
      }
    } catch (err) {
      console.error('Error saving package to database:', err);
    }
  };

  const updatePackage = async (updatedPkg: Package) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    // Optimistic UI update
    const updated = packages.map((p) => (p.id === updatedPkg.id ? updatedPkg : p));
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));

    // Update in PostgreSQL database
    try {
      const res = await fetch(`${API_BASE}/api/packages/${encodeURIComponent(updatedPkg.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPkg),
      });
      if (res.ok) {
        const savedPkg = await res.json();
        if (savedPkg && savedPkg.id) {
          setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? savedPkg : p)));
        }
      } else {
        console.error('Failed to update package in database:', await res.text());
      }
    } catch (err) {
      console.error('Error updating package in database:', err);
    }
  };

  const deletePackage = async (id: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    // Optimistic UI update
    const updated = packages.filter((p) => p.id !== id);
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));

    // Soft delete / deactivate in PostgreSQL database
    try {
      const res = await fetch(`${API_BASE}/api/packages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to deactivate package in database:', await res.text());
      }
    } catch (err) {
      console.error('Error deactivating package in database:', err);
    }
  };

  const subscribeToPackage = (packageId: string) => {
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      packageId: packageId,
      status: 'active',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSubscription(newSub);
    localStorage.setItem('vpn_subscription', JSON.stringify(newSub));
  };

  // Checkout actions
  const selectPlan = (pkg: Package) => {
    setSelectedPlan(pkg);
    localStorage.setItem('vpn_selected_package', JSON.stringify(pkg));
  };

  const selectNetwork = (network: NetworkConfig) => {
    setSelectedNetwork(network);
    localStorage.setItem('vpn_selected_network', JSON.stringify(network));
  };

  const selectNetworkPackage = (networkPkg: NetworkPackage) => {
    setSelectedNetworkPackage(networkPkg);
    localStorage.setItem('vpn_selected_net_package', JSON.stringify(networkPkg));
  };

  const addNetworkPackage = async (pkg: NetworkPackage) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    const updated = [...networkPackages, pkg];
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/network-packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });
    } catch (err) {
      console.warn('Failed to save network package to database:', err);
    }
  };

  const updateNetworkPackage = async (updatedPkg: NetworkPackage) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    const updated = networkPackages.map((p) => p.id === updatedPkg.id ? updatedPkg : p);
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/network-packages/${encodeURIComponent(updatedPkg.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPkg),
      });
    } catch (err) {
      console.warn('Failed to update network package in database:', err);
    }
  };

  const deleteNetworkPackage = async (id: string) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    const updated = networkPackages.filter((p) => p.id !== id);
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/network-packages/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to delete network package from database:', err);
    }
  };

  const clearCheckoutSelection = () => {
    setSelectedPlan(null);
    setSelectedNetwork(null);
    setSelectedNetworkPackage(null);
    localStorage.removeItem('vpn_selected_package');
    localStorage.removeItem('vpn_selected_network');
    localStorage.removeItem('vpn_selected_net_package');
  };

  // Promo code actions
  const addPromoCode = (promo: PromoCode) => {
    const updated = [promo, ...promoCodes];
    setPromoCodes(updated);
    localStorage.setItem('vpn_promos', JSON.stringify(updated));
  };

  const updatePromoCode = (updatedPromo: PromoCode) => {
    const updated = promoCodes.map((p) => (p.id === updatedPromo.id ? updatedPromo : p));
    setPromoCodes(updated);
    localStorage.setItem('vpn_promos', JSON.stringify(updated));
  };

  const deletePromoCode = (id: string) => {
    const updated = promoCodes.filter((p) => p.id !== id);
    setPromoCodes(updated);
    localStorage.setItem('vpn_promos', JSON.stringify(updated));
  };

  const markPromoCodeUsed = (code: string, orderId: string, customerEmail: string) => {
    const cleanCode = code.toUpperCase().trim();
    const updated = promoCodes.map((p) => {
      if (p.code.toUpperCase().trim() === cleanCode) {
        const newUsedCount = (p.usedCount || 0) + 1;
        const isNowUsed = newUsedCount >= (p.maxUses || 1);
        const existingUsers = p.usedBy || [];
        const userEntry = customerEmail ? `${customerEmail} (${orderId})` : orderId;
        return {
          ...p,
          usedCount: newUsedCount,
          isUsed: isNowUsed,
          isActive: !isNowUsed,
          usedBy: [...existingUsers, userEntry],
        };
      }
      return p;
    });
    setPromoCodes(updated);
    localStorage.setItem('vpn_promos', JSON.stringify(updated));
  };

  // Order actions
  const createOrder = (order: Order) => {
    const updated = [order, ...orders.filter((o) => o.id !== order.id)];
    setOrders(updated);
    localStorage.setItem('vpn_orders', JSON.stringify(updated));

    // If order has provisional or approved VPN details, activate VPN and subscription in AppContext
    if (order.vpnProvisioned && order.vpnDetails) {
      setVpnConfig(order.vpnDetails);
      localStorage.setItem('vpn_config', JSON.stringify(order.vpnDetails));

      const subId = order.vpnDetails.configuration?.split('@')?.[0]?.replace('vless://', '') || `sub-${Date.now()}`;
      const newSub: Subscription = {
        id: subId,
        packageId: order.packageId,
        status: 'active',
        startDate: order.createdAt || new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setSubscription(newSub);
      localStorage.setItem('vpn_subscription', JSON.stringify(newSub));
    }

    // Decrement available slots in the database and state
    const pkg = packages.find((p) => p.id === order.packageId);
    if (pkg && pkg.availableSlots !== undefined && pkg.availableSlots > 0) {
      const updatedPkg: Package = {
        ...pkg,
        availableSlots: Math.max(0, pkg.availableSlots - 1),
      };
      updatePackage(updatedPkg);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, adminNotes?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let updatedVpnDetails: VPNConfig | undefined = targetOrder.vpnDetails;
    let vpnProvisioned = targetOrder.vpnProvisioned || false;
    let isProvisional = targetOrder.isProvisional || false;

    // If order was rejected, restore slot and revoke VPN access immediately from 3X-UI VPS
    if (newStatus === 'rejected') {
      isProvisional = false;
      vpnProvisioned = false;
      updatedVpnDetails = undefined;

      // Revoke client immediately from live 3X-UI VPS panel
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
      const sanitizedEmail = (targetOrder.customerEmail || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
      const clientEmail = `${targetOrder.id}-${sanitizedEmail}`;
      const clientUuid = targetOrder.vpnDetails?.configuration?.split('@')?.[0]?.replace('vless://', '');

      fetch(`${API_BASE}/api/vpn/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clientEmail, uuid: clientUuid }),
      }).catch((err) => console.warn('Failed to revoke 3X-UI client:', err));

      if (targetOrder.status !== 'rejected') {
        const pkg = packages.find((p) => p.id === targetOrder.packageId);
        if (pkg) {
          updatePackage({
            ...pkg,
            availableSlots: (pkg.availableSlots !== undefined ? pkg.availableSlots : 0) + 1,
          });
        }
      }

      // If this order's vpn is currently the active one in localStorage, clear it
      const currentConfigStr = localStorage.getItem('vpn_config');
      if (currentConfigStr && targetOrder.vpnDetails?.configuration) {
        if (currentConfigStr.includes(targetOrder.id) || currentConfigStr === JSON.stringify(targetOrder.vpnDetails)) {
          setVpnConfig(null);
          localStorage.removeItem('vpn_config');
        }
      }
    }

    // If approving order, clear provisional flag, ensure VPN credentials and subscription are permanent
    if (newStatus === 'approved') {
      isProvisional = false;
      vpnProvisioned = true;

      if (!updatedVpnDetails) {
        const subId = `vpn-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
        const cleanNet = targetOrder.networkName.replace(/[^a-zA-Z0-9]/g, '');
        const cleanPkg = targetOrder.packageName.replace(/[^a-zA-Z0-9]/g, '-');
        const targetSni = (targetOrder.sni || 'aka.ms').trim();
        
        updatedVpnDetails = {
          server: `virtual-internet-access.duckdns.org:443 (Cyberx - VLESS gRPC TLS | SNI: ${targetSni} | ALPN: h2,http/1.1)`,
          status: 'connected',
          configuration: buildVlessUrl(subId, targetSni, `Cyberx-${cleanNet}-${cleanPkg}`),
          qrCode: 'active-v2ray-qr',
        };
      }

      // Activate subscription in AppContext
      const subId = updatedVpnDetails.configuration?.split('@')?.[0]?.replace('vless://', '') || `sub-${Date.now()}`;
      const newSub: Subscription = {
        id: subId,
        packageId: targetOrder.packageId,
        status: 'active',
        startDate: targetOrder.createdAt || new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setSubscription(newSub);
      localStorage.setItem('vpn_subscription', JSON.stringify(newSub));

      // Update VPN Config
      setVpnConfig(updatedVpnDetails);
      localStorage.setItem('vpn_config', JSON.stringify(updatedVpnDetails));
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          isProvisional,
          adminNotes: adminNotes !== undefined ? adminNotes : o.adminNotes,
          vpnProvisioned,
          vpnDetails: updatedVpnDetails,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem('vpn_orders', JSON.stringify(updatedOrders));
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  const setServerCapacityTb = (capacityTb: number) => {
    const valid = Math.max(0.1, Number(capacityTb) || 20);
    setServerCapacityTbState(valid);
    localStorage.setItem('vpn_server_capacity_tb', valid.toString());
  };

  const getServerBandwidthStats = () => {
    const totalCapacityGb = serverCapacityTb * 1024;
    const resetTime = lastQuotaResetDate ? new Date(lastQuotaResetDate).getTime() : 0;

    // Only count orders created within the current billing cycle
    const usedBandwidthGb = orders
      .filter((o) => {
        const isEligible = o.status === 'approved' || o.status === 'pending_approval';
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : Date.now();
        return isEligible && orderTime >= resetTime;
      })
      .reduce((sum, order) => {
        const found = packages.find((p) => p.id === order.packageId);
        // Assumption: unlimited package allocates default 500 GB
        const quota = (found && found.trafficLimit > 0) ? found.trafficLimit : 500;
        return sum + quota;
      }, 0);

    const remainingBandwidthGb = Math.max(0, totalCapacityGb - usedBandwidthGb);
    const totalCapacityTb = Number(serverCapacityTb.toFixed(2));
    const usedBandwidthTb = Number((usedBandwidthGb / 1024).toFixed(2));
    const remainingBandwidthTb = Number((remainingBandwidthGb / 1024).toFixed(2));
    const usagePercent = totalCapacityGb > 0 ? Math.min(100, Math.round((usedBandwidthGb / totalCapacityGb) * 100)) : 100;

    return {
      totalCapacityGb,
      totalCapacityTb,
      usedBandwidthGb,
      usedBandwidthTb,
      remainingBandwidthGb,
      remainingBandwidthTb,
      usagePercent,
    };
  };

  const resetMonthlyQuota = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://virtual-internet-access.duckdns.org:3001';
    const now = new Date();
    const nowIso = now.toISOString();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setLastQuotaResetDate(nowIso);
    localStorage.setItem('vpn_last_quota_reset_date', nowIso);
    localStorage.setItem('vpn_quota_cycle_month', currentMonthKey);

    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-monthly-quota`, {
        method: 'POST',
      });
      if (res.ok) {
        await refreshPackages();
      }
    } catch (err) {
      console.warn('Backend reset-monthly-quota unavailable, applying local reset fallback:', err);
      const defaultSlots: Record<string, number> = {
        'basic-50gb': 150,
        'basic-100gb': 120,
        'basic-200gb': 95,
        'standard-250gb': 90,
        'standard-300gb': 85,
        'standard-400gb': 75,
        'premium-500gb': 65,
        'premium-750gb': 50,
        'premium-1000gb': 40,
        'ultimate-1500gb': 35,
        'ultimate-2000gb': 25,
      };
      const restored = packages.map((p) => ({
        ...p,
        availableSlots: defaultSlots[p.id] !== undefined ? defaultSlots[p.id] : 100,
      }));
      setPackages(restored);
      localStorage.setItem('vpn_packages', JSON.stringify(restored));
    }
  };

  const getEffectiveSlots = (pkg: Package): number => {
    const stats = getServerBandwidthStats();
    // User rule: unlimited package assumes default 500GB
    const pkgQuota = (pkg.trafficLimit && pkg.trafficLimit > 0) ? pkg.trafficLimit : 500;
    const maxCapacitySlots = Math.floor(stats.remainingBandwidthGb / pkgQuota);

    const configuredSlots = pkg.availableSlots !== undefined ? pkg.availableSlots : 100;
    return Math.max(0, Math.min(configuredSlots, maxCapacitySlots));
  };

  
const login = (userData: User) => {
  setUser(userData);

  localStorage.setItem(
    'vpn_user',
    JSON.stringify(userData)
  );
};

const logout = () => {
  setUser(null);

  localStorage.removeItem('vpn_user');
  localStorage.removeItem('authToken');

  // Remove legacy demo authentication data if present.
  localStorage.removeItem('token');
};

  return (
    <AppContext.Provider
      value={{
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        refreshPackages,
        user,
        isInitialized,
        login,
        logout,
        subscription,
        subscribeToPackage,
        usage,
        orderUsageMap,
        vpnConfig,
        selectedPlan,
        selectedNetwork,
        selectedNetworkPackage,
        selectPlan,
        selectNetwork,
        selectNetworkPackage,
        clearCheckoutSelection,
        networkPackages,
        addNetworkPackage,
        updateNetworkPackage,
        deleteNetworkPackage,
        promoCodes,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        markPromoCodeUsed,
        orders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        serverCapacityTb,
        setServerCapacityTb,
        getServerBandwidthStats,
        getEffectiveSlots,
        lastQuotaResetDate,
        resetMonthlyQuota,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
