'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, User, Subscription, Usage, VPNConfig, NetworkConfig, NetworkPackage, PromoCode, Order, OrderStatus } from '@/types';
import { defaultPackages } from '@/data/mock-packages';
import { supportedNetworks, defaultNetworkPackages } from '@/data/network-configs';
import { defaultPromoCodes } from '@/data/promo-codes';

interface AppContextType {
  packages: Package[];
  addPackage: (pkg: Package) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;
  
  user: User | null;
  isInitialized: boolean;
  login: (user: User) => void;
  logout: () => void;

  subscription: Subscription | null;
  subscribeToPackage: (packageId: string) => void;
  usage: Usage | null;
  vpnConfig: VPNConfig | null;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<Package[]>(defaultPackages);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Mock data for dashboard
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [vpnConfig, setVpnConfig] = useState<VPNConfig | null>(null);

  // Checkout Flow state
  const [selectedPlan, setSelectedPlan] = useState<Package | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig | null>(null);
  const [selectedNetworkPackage, setSelectedNetworkPackage] = useState<NetworkPackage | null>(null);
  const [networkPackages, setNetworkPackages] = useState<NetworkPackage[]>(defaultNetworkPackages);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(defaultPromoCodes);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Versioned load to ensure new V2Ray fields appear automatically
    const packageVersion = localStorage.getItem('vpn_packages_ver');
    const storedPackages = localStorage.getItem('vpn_packages');
    if (storedPackages && packageVersion === 'v4') {
      try {
        setPackages(JSON.parse(storedPackages));
      } catch (e) {
        setPackages(defaultPackages);
      }
    } else {
      setPackages(defaultPackages);
      localStorage.setItem('vpn_packages', JSON.stringify(defaultPackages));
      localStorage.setItem('vpn_packages_ver', 'v4');
    }

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

    // Load Orders from localStorage
    const storedOrders = localStorage.getItem('vpn_orders');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
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

    setIsInitialized(true);
  }, []);

  const addPackage = (pkg: Package) => {
    const updated = [...packages, pkg];
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));
  };

  const updatePackage = (updatedPkg: Package) => {
    const updated = packages.map((p) => p.id === updatedPkg.id ? updatedPkg : p);
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));
  };

  const deletePackage = (id: string) => {
    const updated = packages.filter((p) => p.id !== id);
    setPackages(updated);
    localStorage.setItem('vpn_packages', JSON.stringify(updated));
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

  const addNetworkPackage = (pkg: NetworkPackage) => {
    const updated = [...networkPackages, pkg];
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));
  };

  const updateNetworkPackage = (updatedPkg: NetworkPackage) => {
    const updated = networkPackages.map((p) => p.id === updatedPkg.id ? updatedPkg : p);
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));
  };

  const deleteNetworkPackage = (id: string) => {
    const updated = networkPackages.filter((p) => p.id !== id);
    setNetworkPackages(updated);
    localStorage.setItem('vpn_net_packages', JSON.stringify(updated));
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
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, adminNotes?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let updatedVpnDetails: VPNConfig | undefined = targetOrder.vpnDetails;
    let vpnProvisioned = targetOrder.vpnProvisioned || false;

    // If approving order, provision VPN credentials and activate subscription if not yet provisioned
    if (newStatus === 'approved' && !vpnProvisioned) {
      vpnProvisioned = true;
      const subId = `vpn-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      const cleanNet = targetOrder.networkName.replace(/[^a-zA-Z0-9]/g, '');
      const cleanPkg = targetOrder.packageName.replace(/[^a-zA-Z0-9]/g, '-');
      
      updatedVpnDetails = {
        server: 'sg-node-01.v2ray.network (Singapore High-Speed)',
        status: 'connected',
        configuration: `vless://${subId}@sg-node-01.v2ray.network:443?encryption=none&security=reality&type=grpc#${cleanNet}-${cleanPkg}`,
        qrCode: 'active-v2ray-qr',
      };

      // Activate subscription in AppContext
      const newSub: Subscription = {
        id: subId,
        packageId: targetOrder.packageId,
        status: 'active',
        startDate: new Date().toISOString(),
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

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vpn_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vpn_user');
  };

  return (
    <AppContext.Provider
      value={{
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        user,
        isInitialized,
        login,
        logout,
        subscription,
        subscribeToPackage,
        usage,
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
