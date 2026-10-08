'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Package } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus, Trash2, Save, X } from 'lucide-react';

export default function AdminPackagesPage() {
  const { packages, addPackage, updatePackage, deletePackage } = useApp();
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Package>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<Package>>({
    name: '',
    price: 0,
    duration: 30,
    trafficLimit: 0,
    features: [''],
    popular: false,
    availableSlots: 100
  });

  const handleEditClick = (pkg: Package) => {
    setIsEditing(pkg.id);
    setEditForm({ ...pkg });
  };

  const handleSaveEdit = () => {
    if (isEditing && editForm.id) {
      updatePackage(editForm as Package);
      setIsEditing(null);
    }
  };

  const handleSaveAdd = () => {
    if (addForm.name && addForm.price !== undefined) {
      const newPkg: Package = {
        id: `pkg-${Date.now()}`,
        name: addForm.name,
        price: addForm.price,
        duration: addForm.duration || 30,
        trafficLimit: addForm.trafficLimit || 0,
        features: addForm.features?.filter(f => f.trim() !== '') || [],
        popular: addForm.popular || false,
        availableSlots: addForm.availableSlots || 0,
        category: addForm.category || 'dialog',
      };
      addPackage(newPkg);
      setIsAdding(false);
      setAddForm({ name: '', price: 0, duration: 30, trafficLimit: 0, features: [''], popular: false, availableSlots: 100, category: '' });
    }
  };

  const handleFeatureChange = (index: number, value: string, isAdd: boolean) => {
    if (isAdd) {
      const newFeatures = [...(addForm.features || [])];
      newFeatures[index] = value;
      setAddForm({ ...addForm, features: newFeatures });
    } else {
      const newFeatures = [...(editForm.features || [])];
      newFeatures[index] = value;
      setEditForm({ ...editForm, features: newFeatures });
    }
  };

  const addFeatureField = (isAdd: boolean) => {
    if (isAdd) {
      setAddForm({ ...addForm, features: [...(addForm.features || []), ''] });
    } else {
      setEditForm({ ...editForm, features: [...(editForm.features || []), ''] });
    }
  };

  const removeFeatureField = (index: number, isAdd: boolean) => {
    if (isAdd) {
      const newFeatures = [...(addForm.features || [])];
      newFeatures.splice(index, 1);
      setAddForm({ ...addForm, features: newFeatures });
    } else {
      const newFeatures = [...(editForm.features || [])];
      newFeatures.splice(index, 1);
      setEditForm({ ...editForm, features: newFeatures });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Packages</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove VPN subscription plans.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle>Add New Package</CardTitle>
            <CardDescription>Fill out the details for the new plan. It will appear on the pricing page immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm({...addForm, name: e.target.value})} placeholder="e.g. Ultra Pro" />
              </div>
              <div className="space-y-2">
                <Label>Price (LKR)</Label>
                <Input type="number" step="0.01" value={addForm.price} onChange={(e) => setAddForm({...addForm, price: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input type="number" value={addForm.duration} onChange={(e) => setAddForm({...addForm, duration: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Traffic Limit (GB, 0 = Unlimited)</Label>
                <Input type="number" value={addForm.trafficLimit} onChange={(e) => setAddForm({...addForm, trafficLimit: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Available Slots (Stock)</Label>
                <Input type="number" value={addForm.availableSlots} onChange={(e) => setAddForm({...addForm, availableSlots: parseInt(e.target.value)})} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="add-popular" checked={addForm.popular} onChange={(e) => setAddForm({...addForm, popular: e.target.checked})} className="rounded border-gray-300" />
                <Label htmlFor="add-popular">Mark as "Most Popular"</Label>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Category / Network</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={addForm.category || ''}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                >
                  <option value="">General</option>
                  <option value="dialog">Dialog Packages</option>
                  <option value="slt">SLT Packages</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Features</Label>
              {addForm.features?.map((feat, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={feat} onChange={(e) => handleFeatureChange(idx, e.target.value, true)} placeholder="e.g. 5 Devices" />
                  <Button variant="destructive" size="icon" onClick={() => removeFeatureField(idx, true)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addFeatureField(true)} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Feature
              </Button>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveAdd}><Save className="h-4 w-4 mr-2" /> Save Package</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          isEditing === pkg.id ? (
            <Card key={pkg.id} className="border-primary">
              <CardHeader className="pb-4">
                <CardTitle>Edit Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Limit (GB)</Label>
                    <Input type="number" value={editForm.trafficLimit} onChange={(e) => setEditForm({...editForm, trafficLimit: parseInt(e.target.value)})} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Slots</Label>
                    <Input type="number" value={editForm.availableSlots} onChange={(e) => setEditForm({...editForm, availableSlots: parseInt(e.target.value)})} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id={`edit-pop-${pkg.id}`} checked={editForm.popular} onChange={(e) => setEditForm({...editForm, popular: e.target.checked})} />
                  <Label htmlFor={`edit-pop-${pkg.id}`} className="text-xs">Most Popular</Label>
                </div>
                
                <div className="pt-2 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={handleSaveEdit}><Save className="h-3 w-3 mr-1" /> Save</Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setIsEditing(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={pkg.id} className={pkg.popular ? 'border-primary/50 relative' : ''}>
              {pkg.popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-bl-lg font-bold">POPULAR</div>}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{pkg.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deletePackage(pkg.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-2xl font-bold text-foreground">Rs. {pkg.price}<span className="text-sm font-normal text-muted-foreground">/{pkg.duration}d</span></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1 mt-2 text-muted-foreground">
                  <p>Limit: <span className="font-medium text-foreground">{pkg.trafficLimit === 0 ? 'Unlimited' : `${pkg.trafficLimit} GB`}</span></p>
                  <p>Supported Devices: <span className="font-medium text-foreground">{pkg.features.length} devices</span></p>
                  <p>Available Slots: <span className="font-medium text-foreground">{pkg.availableSlots}</span></p>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
