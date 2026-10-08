'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Package, User, Subscription, Usage, VPNConfig } from '@/types';
import { defaultPackages } from '@/data/mock-packages';

interface AppContextType {
  packages: Package[];
  addPackage: (pkg: Package) => void;
  updatePackage: (pkg: Package) => void;
  deletePackage: (id: string) => void;
  
  user: User | null;
  login: (user: User) => void;
  logout: () => void;

  subscription: Subscription | null;
  usage: Usage | null;
  vpnConfig: VPNConfig | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Mock data for dashboard
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [vpnConfig, setVpnConfig] = useState<VPNConfig | null>(null);

  useEffect(() => {
    // Load from local storage or use defaults
    const storedPackages = localStorage.getItem('vpn_packages');
    if (storedPackages) {
      setPackages(JSON.parse(storedPackages));
    } else {
      setPackages(defaultPackages);
      localStorage.setItem('vpn_packages', JSON.stringify(defaultPackages));
    }

    const storedUser = localStorage.getItem('vpn_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Initialize mock dashboard data when logged in
      setSubscription({
        id: 'sub-1',
        packageId: 'premium-1',
        status: 'active',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setUsage({ upload: 1.2, download: 7.2, total: 8.4 });
      setVpnConfig({
        server: 'us-east-1.vpn.network',
        status: 'connected',
        configuration: 'vless://user@us-east-1.vpn.network:443?encryption=none&security=tls&type=tcp#VPN-US-East',
        qrCode: 'mock-qr-code',
      });
    }
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

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vpn_user', JSON.stringify(userData));
    // Set mock data
    setSubscription({
      id: 'sub-1',
      packageId: 'premium-1',
      status: 'active',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setUsage({ upload: 1.2, download: 7.2, total: 8.4 });
    setVpnConfig({
      server: 'us-east-1.vpn.network',
      status: 'connected',
      configuration: 'vless://user@us-east-1.vpn.network:443?encryption=none&security=tls&type=tcp#VPN-US-East',
      qrCode: 'mock-qr-code',
    });
  };

  const logout = () => {
    setUser(null);
    setSubscription(null);
    setUsage(null);
    setVpnConfig(null);
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
        login,
        logout,
        subscription,
        usage,
        vpnConfig,
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
