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
    // Versioned load to ensure new V2Ray fields appear automatically
    const packageVersion = localStorage.getItem('vpn_packages_ver');
    const storedPackages = localStorage.getItem('vpn_packages');
    if (storedPackages && packageVersion === 'v3') {
      setPackages(JSON.parse(storedPackages));
    } else {
      setPackages(defaultPackages);
      localStorage.setItem('vpn_packages', JSON.stringify(defaultPackages));
      localStorage.setItem('vpn_packages_ver', 'v3');
    }

    const storedUser = localStorage.getItem('vpn_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Initialize mock dashboard data matching the screenshot
      setSubscription({
        id: 'asyfckrhgfxsy1oc50xt',
        packageId: 'slt-zoom-fiber',
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 396 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setUsage({ upload: 101.0, download: 676.7, total: 777.7 });
      setVpnConfig({
        server: 'sg-node-01.v2ray.network (Singapore)',
        status: 'connected',
        configuration: 'vless://asyfckrhgfxsy1oc50xt@sg-node-01.v2ray.network:443?encryption=none&security=reality&type=grpc#SLT-Zoom-SG-01',
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
    // Set mock data matching screenshot
    setSubscription({
      id: 'asyfckrhgfxsy1oc50xt',
      packageId: 'slt-zoom-fiber',
      status: 'active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 396 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setUsage({ upload: 101.0, download: 676.7, total: 777.7 });
    setVpnConfig({
      server: 'sg-node-01.v2ray.network (Singapore)',
      status: 'connected',
      configuration: 'vless://asyfckrhgfxsy1oc50xt@sg-node-01.v2ray.network:443?encryption=none&security=reality&type=grpc#SLT-Zoom-SG-01',
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
