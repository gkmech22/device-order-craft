import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Package, BarChart3, Archive, RotateCcw, Plus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TabletItem {
  id: string;
  nucleusId?: string;
  schoolName: string;
  model: string;
  sdCardSize: string;
  profileId: string;
  quantity: number;
  location: string;
  serialNumbers?: string[];
}

interface TVItem {
  id: string;
  nucleusId?: string;
  schoolName: string;
  model: string;
  quantity: number;
  location: string;
  serialNumbers?: string[];
}

interface OrderForm {
  id: number;
  orderType: string;
  salesOrder: string;
  dealId: string;
  tablets: TabletItem[];
  tvs: TVItem[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'serial-entry' | 'completed';
}

interface Device {
  id: string;
  product: 'Tablet' | 'TV';
  model: string;
  serial_number: string;
  warehouse: string;
  status: 'Available' | 'Assigned' | 'Maintenance';
  order_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;
}

interface Order {
  id: string;
  order_type: 'Inward' | 'Outward';
  product: 'Tablet' | 'TV';
  model: string;
  quantity: number;
  warehouse: string;
  serial_numbers: string[];
  order_date: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_deleted: boolean;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [localOrders, setLocalOrders] = useState<OrderForm[]>([]);
  const [currentView, setCurrentView] = useState<'create' | 'view' | 'serial-entry' | 'edit' | 'warehouse' | 'devices'>('create');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderForm | null>(null);
  const { toast } = useToast();
  
  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  
  // Form states
  const [orderType, setOrderType] = useState('');
  const [salesOrder, setSalesOrder] = useState('');
  const [dealId, setDealId] = useState('');
  const [tablets, setTablets] = useState<TabletItem[]>([]);
  const [tvs, setTVs] = useState<TVItem[]>([]);

  const orderTypes = [
    'Hardware',
    'Additional hardware',
    'Exp Hub',
    'Stock movement',
    'Return',
    'Employee',
    'Stock',
    'Other'
  ];

  const tabletModels = ['TB301FU', 'TB301XU', 'TB-8505F', 'TB-7306F', 'TB-7306X', 'TB-7305X'];
  const tvModels = ['Hyundai TV - 39"', 'Hyundai TV - 43"', 'Hyundai TV - 50"', 'Hyundai TV - 55"', 'Hyundai TV - 65"', 'Xentec TV - 39"', 'Xentec TV - 43"'];
  const sdCardSizes = ['64 GB', '128 GB'];
  const locations = ['Trichy', 'Bangalore', 'Hyderabad', 'Kolkata', 'Bhiwandi', 'Ghaziabad', 'Zirakpur', 'Indore', 'Jaipur'];
  const warehouseOptions = ['All', ...locations];
  const productOptions = ['All', 'Tablet', 'TV'];

  const getModelsForProduct = (productType: string) => {
    if (productType === 'Tablet') return tabletModels;
    if (productType === 'TV') return tvModels;
    return [...tabletModels, ...tvModels];
  };

  const getAllModels = () => [...tabletModels, ...tvModels];
  const modelOptions = ['All', ...getAllModels()];

  useEffect(() => {
    loadOrders();
    loadDevices();
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const generateDummyId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  };

  const loadDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDevices((data as Device[]) || []);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast({
        title: "Error",
        description: "Failed to load devices",
        variant: "destructive"
      });
    }
  };

  const addTablet = () => {
    const newTablet: TabletItem = {
      id: generateId(),
      nucleusId: '',
      schoolName: '',
      model: '',
      sdCardSize: '',
      profileId: '',
      quantity: 1,
      location: ''
    };
    setTablets([...tablets, newTablet]);
  };

  const addTV = () => {
    const newTV: TVItem = {
      id: generateId(),
      nucleusId: '',
      schoolName: '',
      model: '',
      quantity: 1,
      location: ''
    };
    setTVs([...tvs, newTV]);
  };

  const updateTablet = (id: string, field: keyof TabletItem, value: string | number) => {
    setTablets(tablets.map(tablet => 
      tablet.id === id ? { ...tablet, [field]: value } : tablet
    ));
  };

  const updateTV = (id: string, field: keyof TVItem, value: string | number) => {
    setTVs(tvs.map(tv => 
      tv.id === id ? { ...tv, [field]: value } : tv
    ));
  };

  const removeTablet = (id: string) => {
    setTablets(tablets.filter(tablet => tablet.id !== id));
  };

  const removeTV = (id: string) => {
    setTVs(tvs.filter(tv => tv.id !== id));
  };

  const createOrder = () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: "Please select an order type",
        variant: "destructive"
      });
      return;
    }

    const hasValidTablets = tablets.some(t => t.schoolName.trim());
    const hasValidTVs = tvs.some(t => t.schoolName.trim());

    if (!hasValidTablets && !hasValidTVs) {
      toast({
        title: "Error", 
        description: "Please add at least one tablet or TV with a school name",
        variant: "destructive"
      });
      return;
    }

    const newOrder: OrderForm = {
      id: localOrders.length + 1,
      orderType,
      salesOrder: salesOrder || generateDummyId('SO'),
      dealId: dealId || '',
      tablets: tablets.filter(t => t.schoolName.trim()),
      tvs: tvs.filter(t => t.schoolName.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };

    setLocalOrders([...localOrders, newOrder]);
    setSelectedOrder(newOrder);
    setCurrentView('serial-entry');
    
    // Reset form
    setOrderType('');
    setSalesOrder('');
    setDealId('');
    setTablets([]);
    setTVs([]);
    
    toast({
      title: "Success",
      description: "Order created! Now enter serial numbers.",
    });
  };

  const updateSerialNumber = (itemId: string, index: number, value: string, type: 'tablet' | 'tv') => {
    if (!selectedOrder) return;

    // Check for duplicate serial number in the same sales order
    const allSerialNumbers: string[] = [];
    selectedOrder.tablets.forEach(tablet => {
      if (tablet.serialNumbers) {
        allSerialNumbers.push(...tablet.serialNumbers.filter(sn => sn.trim()));
      }
    });
    selectedOrder.tvs.forEach(tv => {
      if (tv.serialNumbers) {
        allSerialNumbers.push(...tv.serialNumbers.filter(sn => sn.trim()));
      }
    });

    if (value.trim() && allSerialNumbers.includes(value.trim())) {
      toast({
        title: "Duplicate Serial Number",
        description: "This serial number already exists in this order",
        variant: "destructive"
      });
      return;
    }

    const updatedOrder = { ...selectedOrder };
    
    if (type === 'tablet') {
      const item = updatedOrder.tablets.find(t => t.id === itemId);
      if (item) {
        if (!item.serialNumbers) item.serialNumbers = [];
        item.serialNumbers[index] = value;
      }
    } else {
      const item = updatedOrder.tvs.find(t => t.id === itemId);
      if (item) {
        if (!item.serialNumbers) item.serialNumbers = [];
        item.serialNumbers[index] = value;
      }
    }

    setSelectedOrder(updatedOrder);
  };

  const saveSerialNumbers = async () => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      // Save tablets to database
      for (const tablet of selectedOrder.tablets) {
        if (tablet.serialNumbers && tablet.serialNumbers.length > 0) {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_type: selectedOrder.orderType === 'Stock' || selectedOrder.orderType === 'Return' ? 'Inward' : 'Outward',
              product: 'Tablet',
              model: tablet.model,
              quantity: tablet.quantity,
              warehouse: tablet.location,
              serial_numbers: tablet.serialNumbers.filter(sn => sn.trim()),
              order_date: new Date().toISOString()
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Create individual device records
          for (const serialNumber of tablet.serialNumbers.filter(sn => sn.trim())) {
            await supabase.from('devices').insert({
              product: 'Tablet',
              model: tablet.model,
              serial_number: serialNumber.trim(),
              warehouse: tablet.location,
              status: selectedOrder.orderType === 'Stock' || selectedOrder.orderType === 'Return' ? 'Available' : 'Assigned',
              order_id: orderData.id
            });
          }
        }
      }

      // Save TVs to database
      for (const tv of selectedOrder.tvs) {
        if (tv.serialNumbers && tv.serialNumbers.length > 0) {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_type: selectedOrder.orderType === 'Stock' || selectedOrder.orderType === 'Return' ? 'Inward' : 'Outward',
              product: 'TV',
              model: tv.model,
              quantity: tv.quantity,
              warehouse: tv.location,
              serial_numbers: tv.serialNumbers.filter(sn => sn.trim()),
              order_date: new Date().toISOString()
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Create individual device records
          for (const serialNumber of tv.serialNumbers.filter(sn => sn.trim())) {
            await supabase.from('devices').insert({
              product: 'TV',
              model: tv.model,
              serial_number: serialNumber.trim(),
              warehouse: tv.location,
              status: selectedOrder.orderType === 'Stock' || selectedOrder.orderType === 'Return' ? 'Available' : 'Assigned',
              order_id: orderData.id
            });
          }
        }
      }

      const updatedOrder = {
        ...selectedOrder,
        status: 'completed' as const,
        updatedAt: new Date()
      };

      setLocalOrders(localOrders.map(order => 
        order.id === selectedOrder.id ? updatedOrder : order
      ));

      setSelectedOrder(null);
      setCurrentView('view');

      await loadOrders();
      await loadDevices();

      toast({
        title: "Success",
        description: "Serial numbers saved successfully!",
      });
    } catch (error) {
      console.error('Error saving serial numbers:', error);
      toast({
        title: "Error",
        description: "Failed to save serial numbers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const softDeleteOrder = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      await supabase
        .from('devices')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('order_id', orderId);

      await loadOrders();
      await loadDevices();
      
      toast({
        title: "Success",
        description: "Order moved to archive",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive"
      });
    }
  };

  const restoreOrder = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ 
          is_deleted: false, 
          deleted_at: null 
        })
        .eq('id', orderId);

      await supabase
        .from('devices')
        .update({ 
          is_deleted: false, 
          deleted_at: null 
        })
        .eq('order_id', orderId);

      await loadOrders();
      await loadDevices();
      
      toast({
        title: "Success",
        description: "Order restored successfully",
      });
    } catch (error) {
      console.error('Error restoring order:', error);
      toast({
        title: "Error",
        description: "Failed to restore order",
        variant: "destructive"
      });
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (!showDeleted && order.is_deleted) return false;
      if (showDeleted && !order.is_deleted) return false;
      
      if (selectedWarehouse !== 'All' && order.warehouse !== selectedWarehouse) return false;
      if (selectedProduct !== 'All' && order.product !== selectedProduct) return false;
      if (selectedModel !== 'All' && order.model !== selectedModel) return false;
      
      if (fromDate && new Date(order.order_date) < new Date(fromDate)) return false;
      if (toDate && new Date(order.order_date) > new Date(toDate)) return false;
      
      return true;
    });
  };

  const getFilteredDevices = () => {
    return devices.filter(device => {
      if (!showDeleted && device.is_deleted) return false;
      if (showDeleted && !device.is_deleted) return false;
      
      if (selectedWarehouse !== 'All' && device.warehouse !== selectedWarehouse) return false;
      if (selectedProduct !== 'All' && device.product !== selectedProduct) return false;
      if (selectedModel !== 'All' && device.model !== selectedModel) return false;
      
      if (fromDate && new Date(device.created_at) < new Date(fromDate)) return false;
      if (toDate && new Date(device.created_at) > new Date(toDate)) return false;
      
      return true;
    });
  };

  const calculateSummary = () => {
    const summary = { 
      overall: { inward: 0, outward: 0, available: 0 },
      byProduct: {} as Record<string, Record<string, { inward: number, outward: number, available: number }>>,
      updatedAt: new Date() 
    };
    
    const filteredOrders = getFilteredOrders().filter(order => !order.is_deleted);
    
    filteredOrders.forEach(order => {
      const product = order.product;
      const model = order.model;
      const count = order.serial_numbers.length;
      
      // Initialize product tracking
      if (!summary.byProduct[product]) summary.byProduct[product] = {};
      if (!summary.byProduct[product][model]) {
        summary.byProduct[product][model] = { inward: 0, outward: 0, available: 0 };
      }
      
      if (order.order_type === 'Inward') {
        summary.overall.inward += count;
        summary.byProduct[product][model].inward += count;
      } else {
        summary.overall.outward += count;
        summary.byProduct[product][model].outward += count;
      }
    });
    
    // Calculate available counts
    summary.overall.available = summary.overall.inward - summary.overall.outward;
    
    Object.keys(summary.byProduct).forEach(productType => {
      Object.keys(summary.byProduct[productType]).forEach(modelName => {
        const productData = summary.byProduct[productType][modelName];
        productData.available = productData.inward - productData.outward;
      });
    });
    
    return summary;
  };

  const downloadSummaryCSV = () => {
    const summary = calculateSummary();
    const csvContent = [
      ['Product', 'Model', 'Inward', 'Outward', 'Available'],
      ...Object.entries(summary.byProduct).flatMap(([product, models]) =>
        Object.entries(models).map(([model, data]) => [
          product,
          model,
          data.inward.toString(),
          data.outward.toString(),
          data.available.toString()
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Summary CSV downloaded successfully!",
    });
  };

  const renderCreateOrderForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="orderType">Order Type *</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  {orderTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="salesOrder">Sales Order</Label>
              <Input
                value={salesOrder}
                onChange={(e) => setSalesOrder(e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div>
              <Label htmlFor="dealId">Deal ID</Label>
              <Input
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tablets</CardTitle>
          <Button onClick={addTablet} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Tablet
          </Button>
        </CardHeader>
        <CardContent>
          {tablets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tablets added</p>
          ) : (
            <div className="space-y-4">
              {tablets.map((tablet) => (
                <Card key={tablet.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Tablet {tablets.indexOf(tablet) + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTablet(tablet.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Nucleus ID</Label>
                      <Input
                        value={tablet.nucleusId || ''}
                        onChange={(e) => updateTablet(tablet.id, 'nucleusId', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>School Name *</Label>
                      <Input
                        value={tablet.schoolName}
                        onChange={(e) => updateTablet(tablet.id, 'schoolName', e.target.value)}
                        placeholder="Required"
                      />
                    </div>
                    <div>
                      <Label>Model *</Label>
                      <Select
                        value={tablet.model}
                        onValueChange={(value) => updateTablet(tablet.id, 'model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {tabletModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>SD Card Size</Label>
                      <Select
                        value={tablet.sdCardSize}
                        onValueChange={(value) => updateTablet(tablet.id, 'sdCardSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sdCardSizes.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Profile ID</Label>
                      <Input
                        value={tablet.profileId}
                        onChange={(e) => updateTablet(tablet.id, 'profileId', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={tablet.quantity}
                        onChange={(e) => updateTablet(tablet.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Select
                        value={tablet.location}
                        onValueChange={(value) => updateTablet(tablet.id, 'location', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>TVs</CardTitle>
          <Button onClick={addTV} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add TV
          </Button>
        </CardHeader>
        <CardContent>
          {tvs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No TVs added</p>
          ) : (
            <div className="space-y-4">
              {tvs.map((tv) => (
                <Card key={tv.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">TV {tvs.indexOf(tv) + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTV(tv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Nucleus ID</Label>
                      <Input
                        value={tv.nucleusId || ''}
                        onChange={(e) => updateTV(tv.id, 'nucleusId', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>School Name *</Label>
                      <Input
                        value={tv.schoolName}
                        onChange={(e) => updateTV(tv.id, 'schoolName', e.target.value)}
                        placeholder="Required"
                      />
                    </div>
                    <div>
                      <Label>Model *</Label>
                      <Select
                        value={tv.model}
                        onValueChange={(value) => updateTV(tv.id, 'model', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {tvModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        value={tv.quantity}
                        onChange={(e) => updateTV(tv.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Select
                        value={tv.location}
                        onValueChange={(value) => updateTV(tv.id, 'location', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={createOrder} className="w-full" size="lg">
        Create Order
      </Button>
    </div>
  );

  const renderSerialEntryForm = () => {
    if (!selectedOrder) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Serial Numbers</CardTitle>
          <CardDescription>
            Order Type: {selectedOrder.orderType} | Sales Order: {selectedOrder.salesOrder}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedOrder.tablets.map((tablet) => (
            <Card key={tablet.id} className="p-4">
              <h4 className="font-medium mb-4">
                Tablet - {tablet.model} at {tablet.location} (Quantity: {tablet.quantity})
              </h4>
              <p className="text-sm text-muted-foreground mb-4">School: {tablet.schoolName}</p>
              <div className="space-y-2">
                {Array.from({ length: tablet.quantity }, (_, index) => (
                  <Input
                    key={index}
                    placeholder={`Serial number ${index + 1}`}
                    value={tablet.serialNumbers?.[index] || ''}
                    onChange={(e) => updateSerialNumber(tablet.id, index, e.target.value, 'tablet')}
                  />
                ))}
              </div>
            </Card>
          ))}

          {selectedOrder.tvs.map((tv) => (
            <Card key={tv.id} className="p-4">
              <h4 className="font-medium mb-4">
                TV - {tv.model} at {tv.location} (Quantity: {tv.quantity})
              </h4>
              <p className="text-sm text-muted-foreground mb-4">School: {tv.schoolName}</p>
              <div className="space-y-2">
                {Array.from({ length: tv.quantity }, (_, index) => (
                  <Input
                    key={index}
                    placeholder={`Serial number ${index + 1}`}
                    value={tv.serialNumbers?.[index] || ''}
                    onChange={(e) => updateSerialNumber(tv.id, index, e.target.value, 'tv')}
                  />
                ))}
              </div>
            </Card>
          ))}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('create')}
              className="flex-1"
            >
              Back to Create
            </Button>
            <Button
              onClick={saveSerialNumbers}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Serial Numbers'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label>Warehouse</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {warehouseOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product</Label>
            <Select value={selectedProduct} onValueChange={(value) => {
              setSelectedProduct(value);
              setSelectedModel('All');
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(selectedProduct === 'All' ? modelOptions : 
                  ['All', ...getModelsForProduct(selectedProduct)]
                ).map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <Label>To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleted(!showDeleted)}
              className="w-full"
            >
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWarehouseSummary = () => {
    const summary = calculateSummary();
    
    return (
      <div className="space-y-6">
        {renderFilters()}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Warehouse Summary</CardTitle>
              <CardDescription>
                Updated: {summary.updatedAt.toLocaleString()}
              </CardDescription>
            </div>
            <Button onClick={downloadSummaryCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.overall.inward}</div>
                    <div className="text-sm text-muted-foreground">Total Inward</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.overall.outward}</div>
                    <div className="text-sm text-muted-foreground">Total Outward</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{summary.overall.available}</div>
                    <div className="text-sm text-muted-foreground">Available</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-center">Inward</TableHead>
                  <TableHead className="text-center">Outward</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(summary.byProduct).flatMap(([product, models]) =>
                  Object.entries(models).map(([model, data]) => (
                    <TableRow key={`${product}-${model}`}>
                      <TableCell>{product}</TableCell>
                      <TableCell>{model}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {data.inward}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {data.outward}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {data.available}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {Object.keys(summary.byProduct).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No data available for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOrdersView = () => {
    const filteredOrders = getFilteredOrders();
    
    return (
      <div className="space-y-6">
        {renderFilters()}
        
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {filteredOrders.length} orders found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Badge variant={order.order_type === 'Inward' ? 'default' : 'secondary'}>
                        {order.order_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.model}</TableCell>
                    <TableCell>{order.warehouse}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={order.is_deleted ? 'destructive' : 'default'}>
                        {order.is_deleted ? 'Deleted' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.is_deleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreOrder(order.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => softDeleteOrder(order.id)}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDevicesView = () => {
    const filteredDevices = getFilteredDevices();
    
    return (
      <div className="space-y-6">
        {renderFilters()}
        
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>
              {filteredDevices.length} devices found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Order Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map(device => (
                  <TableRow key={device.id}>
                    <TableCell>{device.product}</TableCell>
                    <TableCell>{device.model}</TableCell>
                    <TableCell className="font-mono">{device.serial_number}</TableCell>
                    <TableCell>{device.warehouse}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          device.status === 'Available' ? 'default' :
                          device.status === 'Assigned' ? 'secondary' : 'destructive'
                        }
                      >
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(device.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={device.is_deleted ? 'destructive' : 'default'}>
                        {device.is_deleted ? 'Deleted' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDevices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No devices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Management System</h1>
        <p className="text-muted-foreground">Manage tablet and TV orders with warehouse tracking</p>
      </div>

      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">
            <Package className="w-4 h-4 mr-2" />
            Create Order
          </TabsTrigger>
          <TabsTrigger value="view">
            <Archive className="w-4 h-4 mr-2" />
            View Orders
          </TabsTrigger>
          <TabsTrigger value="warehouse">
            <BarChart3 className="w-4 h-4 mr-2" />
            Warehouse Summary
          </TabsTrigger>
          <TabsTrigger value="devices">
            <Archive className="w-4 h-4 mr-2" />
            Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          {renderCreateOrderForm()}
        </TabsContent>

        <TabsContent value="serial-entry" className="mt-6">
          {renderSerialEntryForm()}
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {renderOrdersView()}
        </TabsContent>

        <TabsContent value="warehouse" className="mt-6">
          {renderWarehouseSummary()}
        </TabsContent>

        <TabsContent value="devices" className="mt-6">
          {renderDevicesView()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;