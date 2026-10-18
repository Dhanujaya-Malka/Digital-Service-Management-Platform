'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { NetworkPackage } from '@/types';
import { defaultNetworkPackages } from '@/data/network-configs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RotateCcw, 
  Check, 
  Activity, 
  CheckCircle2, 
  Server, 
  Lock, 
  Calendar,
  AlertTriangle,
  Radio,
  Sparkles
} from 'lucide-react';
import { getIspLogo } from '@/components/marketing/IspLogos';

export default function AdminNetworkPackagesPage() {
  const { 
    networkPackages, 
    addNetworkPackage, 
    updateNetworkPackage, 
    deleteNetworkPackage 
  } = useApp();

  const [filterIsp, setFilterIsp] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NetworkPackage>>({});

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<NetworkPackage>>({
    name: '',
    isp: 'slt',
    ispName: 'SLT',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    latency: '30ms - 40ms',
    features: ['No Speed Limit', 'Works with Zoom / Teams', 'Unlimited Device Login'],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    description: '',
  });

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const ispOptions = [
    { id: 'slt', name: 'SLT' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'hutch', name: 'Hutch' },
    { id: 'airtel', name: 'Airtel' },
    { id: 'mobitel', name: 'Mobitel' },
  ];

  const handleEditClick = (pkg: NetworkPackage) => {
    setIsEditing(pkg.id);
    setEditForm({
      ...pkg,
      features: [...pkg.features],
      supportedProtocols: [...pkg.supportedProtocols],
    });
  };

  const handleSaveEdit = () => {
    if (isEditing && editForm.id) {
      const selectedIspObj = ispOptions.find((i) => i.id === editForm.isp) || { id: 'slt', name: 'SLT' };
      const updated: NetworkPackage = {
        id: editForm.id,
        name: editForm.name || 'Custom Bypass Route',
        isp: (editForm.isp as any) || 'slt',
        ispName: selectedIspObj.name,
        status: (editForm.status as 'active' | 'maintenance' | 'offline') || 'active',
        serverLocation: editForm.serverLocation || 'SG SERVER',
        validity: editForm.validity || '1 Month',
        p2pTorrent: (editForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
        speedLimit: editForm.speedLimit || 'No Speed Limit',
        popular: Boolean(editForm.popular),
        latency: editForm.latency || '30ms - 40ms',
        features: editForm.features?.filter(f => f.trim() !== '') || [],
        supportedProtocols: editForm.supportedProtocols?.filter(p => p.trim() !== '') || ['VLESS + Reality', 'WebSocket TLS'],
        description: editForm.description || '',
      };

      updateNetworkPackage(updated);
      setIsEditing(null);
      showNotification(`Updated "${updated.name}" successfully.`);
    }
  };

  const handleToggleStatus = (pkg: NetworkPackage) => {
    const nextStatus = pkg.status === 'active' ? 'offline' : 'active';
    const updated: NetworkPackage = {
      ...pkg,
      status: nextStatus,
    };
    updateNetworkPackage(updated);
    showNotification(
      nextStatus === 'active'
        ? `"${pkg.name}" is now ACTIVE (Users can purchase).`
        : `"${pkg.name}" marked as NOT AVAILABLE (Checkout blocked).`
    );
  };

  const handleSaveAdd = () => {
    if (!addForm.name?.trim()) return;

    const selectedIspObj = ispOptions.find((i) => i.id === addForm.isp) || { id: 'slt', name: 'SLT' };
    const newPkg: NetworkPackage = {
      id: `${addForm.isp}-${Date.now().toString(36)}`,
      name: addForm.name.trim(),
      isp: (addForm.isp as any) || 'slt',
      ispName: selectedIspObj.name,
      status: (addForm.status as 'active' | 'maintenance' | 'offline') || 'active',
      serverLocation: addForm.serverLocation || 'SG SERVER',
      validity: addForm.validity || '1 Month',
      p2pTorrent: (addForm.p2pTorrent as 'Allowed' | 'Restricted') || 'Restricted',
      speedLimit: addForm.speedLimit || 'No Speed Limit',
      popular: Boolean(addForm.popular),
      latency: addForm.latency || '30ms - 40ms',
      features: addForm.features?.filter(f => f.trim() !== '') || ['No Speed Limit', 'Unlimited Device Login'],
      supportedProtocols: addForm.supportedProtocols?.filter(p => p.trim() !== '') || ['VLESS + Reality', 'WebSocket TLS'],
      description: addForm.description || '',
    };

    addNetworkPackage(newPkg);
    setIsAdding(false);
    setAddForm({
      name: '',
      isp: 'slt',
      ispName: 'SLT',
      status: 'active',
      serverLocation: 'SG SERVER',
      validity: '1 Month',
      p2pTorrent: 'Restricted',
      speedLimit: 'No Speed Limit',
      popular: false,
      latency: '30ms - 40ms',
      features: ['No Speed Limit', 'Works with Zoom / Teams', 'Unlimited Device Login'],
      supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
      description: '',
    });
    showNotification(`Added new bypass package "${newPkg.name}".`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? Customers will no longer be able to select this route.`)) {
      deleteNetworkPackage(id);
      showNotification(`Deleted "${name}".`);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all network packages to verified factory defaults? Custom added packages will be replaced.')) {
      localStorage.setItem('vpn_net_packages', JSON.stringify(defaultNetworkPackages));
      localStorage.setItem('vpn_net_packages_ver', 'v1');
      window.location.reload();
    }
  };

  // Filter packages
  const filteredPackages = networkPackages.filter((p) => {
    if (filterIsp === 'all') return true;
    return p.isp.toLowerCase() === filterIsp.toLowerCase();
  });

  const ispTabs = [
    { id: 'all', label: 'All Routes', count: networkPackages.length },
    { id: 'slt', label: 'SLT', count: networkPackages.filter((p) => p.isp === 'slt').length },
    { id: 'dialog', label: 'Dialog', count: networkPackages.filter((p) => p.isp === 'dialog').length },
    { id: 'hutch', label: 'Hutch', count: networkPackages.filter((p) => p.isp === 'hutch').length },
    { id: 'airtel', label: 'Airtel', count: networkPackages.filter((p) => p.isp === 'airtel').length },
    { id: 'mobitel', label: 'Mobitel', count: networkPackages.filter((p) => p.isp === 'mobitel').length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-destructive" />
            <span>Network Selection Packages</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure ISP-specific bypass routes (SLT, Dialog, Hutch, Airtel, Mobitel) used in the checkout network selection step.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs h-9 gap-1.5 border-border/80 hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs h-9 gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Network Package</span>
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Routes</div>
            <div className="text-2xl font-black text-foreground mt-1 font-mono">
              {networkPackages.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Configured bypass options</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active Routes</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {networkPackages.filter((p) => p.status === 'active').length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Deployable to customers</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Supported ISPs</div>
            <div className="text-2xl font-black text-primary mt-1 font-mono">
              5 Carriers
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">SLT, Dialog, Hutch, Airtel, Mobitel</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/60 bg-card/90">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Popular Routes</div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {networkPackages.filter((p) => p.popular).length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Flagged as recommended</div>
          </CardContent>
        </Card>
      </div>

      {/* ISP Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
        {ispTabs.map((tab) => {
          const isActive = filterIsp === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterIsp(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-destructive text-destructive-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {tab.id === 'all' ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <span className="shrink-0">{getIspLogo(tab.id, 16)}</span>
              )}
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-destructive-foreground/20 text-destructive-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add New Network Package Modal / Form Box */}
      {isAdding && (
        <Card className="rounded-2xl border-destructive/40 bg-card shadow-2xl animate-in fade-in zoom-in-95">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Add Network Selection Package</CardTitle>
                  <CardDescription className="text-xs">
                    Create a new carrier bypass configuration for customers to select during checkout.
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Carrier / ISP</Label>
                <select
                  value={addForm.isp}
                  onChange={(e) => {
                    const selIsp = e.target.value;
                    const opt = ispOptions.find(o => o.id === selIsp);
                    setAddForm({ ...addForm, isp: selIsp as any, ispName: opt?.name || 'SLT' });
                  }}
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium"
                >
                  {ispOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">Package Title</Label>
                <Input
                  placeholder="e.g. Dialog (Sim) ZOOM 724 Unlimited"
                  value={addForm.name || ''}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="mt-1 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs font-semibold">Speed Limit Specification</Label>
                <Input
                  placeholder="No Speed Limit / Speed Limited"
                  value={addForm.speedLimit || 'No Speed Limit'}
                  onChange={(e) => setAddForm({ ...addForm, speedLimit: e.target.value })}
                  className="mt-1 h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Server Location</Label>
                <Input
                  value={addForm.serverLocation || 'SG SERVER'}
                  onChange={(e) => setAddForm({ ...addForm, serverLocation: e.target.value })}
                  className="mt-1 h-10 text-xs rounded-xl font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Validity</Label>
                <Input
                  value={addForm.validity || '1 Month'}
                  onChange={(e) => setAddForm({ ...addForm, validity: e.target.value })}
                  className="mt-1 h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Latency Estimate</Label>
                <Input
                  placeholder="30ms - 40ms"
                  value={addForm.latency || '30ms - 40ms'}
                  onChange={(e) => setAddForm({ ...addForm, latency: e.target.value })}
                  className="mt-1 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">
                Feature Badges (comma separated)
              </Label>
              <Input
                placeholder="No Speed Limit, Works with Meet Lite/Max, Unlimited Device Login"
                value={addForm.features?.join(', ') || ''}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setAddForm({ ...addForm, features: arr });
                }}
                className="mt-1 h-10 text-xs rounded-xl"
              />
            </div>

            {/* Availability Option */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">Route Availability Status</Label>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  addForm.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-destructive/15 text-destructive border border-destructive/30'
                }`}>
                  {addForm.status === 'active' ? '● AVAILABLE FOR USERS' : '● NOT AVAILABLE (BLOCKED)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, status: 'active' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addForm.status === 'active'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Available (Active)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, status: 'offline' })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    addForm.status !== 'active'
                      ? 'bg-destructive/15 border-destructive text-destructive shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Not Available (Offline)</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {addForm.status === 'active'
                  ? '✓ Customers can select this network bypass route during checkout.'
                  : '⛔ Customers cannot select or continue payment for this route.'}
              </p>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={addForm.popular || false}
                  onChange={(e) => setAddForm({ ...addForm, popular: e.target.checked })}
                  className="rounded border-border"
                />
                <span>Highlight as Popular</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAdd}
                disabled={!addForm.name?.trim()}
                className="text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>Save Package</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => {
          const isCurrentlyEditing = isEditing === pkg.id;

          if (isCurrentlyEditing) {
            return (
              <Card key={pkg.id} className="rounded-2xl border-destructive shadow-xl p-5 space-y-3.5 bg-card/95">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{getIspLogo(editForm.isp || pkg.isp, 22)}</span>
                    <span className="text-xs font-bold text-destructive">Edit Route</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(null)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold">Title</Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] font-semibold">Carrier</Label>
                    <select
                      value={editForm.isp}
                      onChange={(e) => {
                        const selIsp = e.target.value;
                        const opt = ispOptions.find(o => o.id === selIsp);
                        setEditForm({ ...editForm, isp: selIsp as any, ispName: opt?.name || 'SLT' });
                      }}
                      className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                    >
                      {ispOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold">Speed Limit</Label>
                    <Input
                      value={editForm.speedLimit || ''}
                      onChange={(e) => setEditForm({ ...editForm, speedLimit: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Feature Tags (comma separated)</Label>
                  <Input
                    value={editForm.features?.join(', ') || ''}
                    onChange={(e) => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setEditForm({ ...editForm, features: arr });
                    }}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                {/* Route Availability Status */}
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-foreground">Route Availability Status</Label>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      editForm.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-destructive/15 text-destructive border border-destructive/30'
                    }`}>
                      {editForm.status === 'active' ? '● AVAILABLE' : '● NOT AVAILABLE (BLOCKED)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: 'active' })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        editForm.status === 'active'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-card border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Available</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, status: 'offline' })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        editForm.status !== 'active'
                          ? 'bg-destructive/15 border-destructive text-destructive shadow-sm'
                          : 'bg-card border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Not Available</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {editForm.status === 'active'
                      ? '✓ Customers can select this route during checkout.'
                      : '⛔ Customers are blocked from selecting this route & cannot pay.'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.popular || false}
                      onChange={(e) => setEditForm({ ...editForm, popular: e.target.checked })}
                      className="rounded border-border"
                    />
                    <span>Highlight as Popular</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(null)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold gap-1"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </Button>
                </div>
              </Card>
            );
          }

          return (
            <Card
              key={pkg.id}
              className="rounded-2xl border-border/70 bg-card/90 shadow-md p-5 flex flex-col justify-between hover:border-destructive/40 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-background border border-border/60 shrink-0 shadow-sm">
                      {getIspLogo(pkg.isp, 24)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {pkg.ispName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {pkg.popular && (
                      <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                        Popular
                      </Badge>
                    )}

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      pkg.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-destructive/15 text-destructive border border-destructive/30'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pkg.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-destructive'}`} />
                      {pkg.status === 'active' ? 'ACTIVE' : 'NOT AVAILABLE'}
                    </span>
                  </div>
                </div>

                {/* Package Name */}
                <h3 className="font-extrabold text-base text-foreground mb-3 leading-snug">
                  {pkg.name}
                </h3>

                {/* Specs */}
                <div className="space-y-1.5 text-xs text-muted-foreground mb-3.5 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                  <div className="flex justify-between">
                    <span>Server Node:</span>
                    <span className="font-mono text-foreground font-medium">{pkg.serverLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed Policy:</span>
                    <span className="font-medium text-foreground">{pkg.speedLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Ping:</span>
                    <span className="font-medium text-emerald-400">{pkg.latency || '32ms'}</span>
                  </div>
                </div>

                {/* Feature Tags */}
                <div className="space-y-1.5 mb-2">
                  {pkg.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-2 bg-muted/40 p-1.5 px-2.5 rounded-lg border border-border/40 text-[11px]"
                    >
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span className="text-foreground/90 font-medium truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(pkg)}
                    className="h-8 text-xs gap-1.5 rounded-lg border-border/80 hover:bg-muted"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(pkg)}
                    className={`h-8 text-[11px] gap-1 rounded-lg font-semibold ${
                      pkg.status === 'active'
                        ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                    title={pkg.status === 'active' ? 'Click to make Not Available (Block checkout)' : 'Click to make Available (Active)'}
                  >
                    {pkg.status === 'active' ? (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        <span>Set Offline</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Set Active</span>
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pkg.id, pkg.name)}
                  className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </Card>
          );
        })}

        {filteredPackages.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
            <Radio className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="font-medium text-sm">No network packages found in this category.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="mt-3 text-xs"
            >
              Add First Route
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
