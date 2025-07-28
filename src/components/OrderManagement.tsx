import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Package, BarChart3, Archive, RotateCcw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentView, setCurrentView] = useState<'create' | 'view' | 'warehouse' | 'devices'>('create');
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  
  // Form states
  const [orderType, setOrderType] = useState<'Inward' | 'Outward'>('Inward');
  const [product, setProduct] = useState<'Tablet' | 'TV'>('Tablet');
  const [model, setModel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [warehouse, setWarehouse] = useState<string>('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);

  const tabletModels = ['TB301FU', 'TB301XU', 'TB-8505F', 'TB-7306F', 'TB-7306X', 'TB-7305X'];
  const tvModels = ['Hyundai TV - 39"', 'Hyundai TV - 43"', 'Hyundai TV - 50"', 'Hyundai TV - 55"', 'Hyundai TV - 65"', 'Xentec TV - 39"', 'Xentec TV - 43"'];
  const warehouses = ['Trichy', 'Bangalore', 'Hyderabad', 'Kolkata', 'Bhiwandi', 'Ghaziabad', 'Zirakpur', 'Indore', 'Jaipur'];
  const warehouseOptions = ['All', ...warehouses];
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

  useEffect(() => {
    // Initialize serial numbers array when quantity changes
    if (quantity > 0) {
      setSerialNumbers(Array(quantity).fill(''));
    }
  }, [quantity]);

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
      toast.error('Failed to load orders');
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
      toast.error('Failed to load devices');
    }
  };

  const createOrder = async () => {
    if (!orderType || !product || !model || !warehouse || quantity <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    if (serialNumbers.some(sn => !sn.trim())) {
      toast.error('Please enter all serial numbers');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_type: orderType,
          product,
          model,
          quantity,
          warehouse,
          serial_numbers: serialNumbers.filter(sn => sn.trim()),
          order_date: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create individual device records
      const devicePromises = serialNumbers
        .filter(sn => sn.trim())
        .map(serial_number => 
          supabase.from('devices').insert({
            product,
            model,
            serial_number: serial_number.trim(),
            warehouse,
            status: orderType === 'Inward' ? 'Available' : 'Assigned',
            order_id: orderData.id
          })
        );

      await Promise.all(devicePromises);

      // Reset form
      setOrderType('Inward');
      setProduct('Tablet');
      setModel('');
      setQuantity(1);
      setWarehouse('');
      setSerialNumbers([]);

      await loadOrders();
      await loadDevices();
      
      toast.success('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
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
      toast.success('Order moved to archive');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
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
      toast.success('Order restored successfully');
    } catch (error) {
      console.error('Error restoring order:', error);
      toast.error('Failed to restore order');
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
    
    toast.success('Summary CSV downloaded successfully!');
  };

  const updateSerialNumber = (index: number, value: string) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const renderCreateOrderForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
        <CardDescription>Enter order details and serial numbers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderType">Order Type</Label>
            <Select value={orderType} onValueChange={(value: 'Inward' | 'Outward') => setOrderType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inward">Inward</SelectItem>
                <SelectItem value="Outward">Outward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="product">Product</Label>
            <Select value={product} onValueChange={(value: 'Tablet' | 'TV') => {
              setProduct(value);
              setModel('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tablet">Tablet</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProduct(product).map(modelOption => (
                  <SelectItem key={modelOption} value={modelOption}>
                    {modelOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="warehouse">Warehouse</Label>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>
        </div>

        {quantity > 0 && (
          <div>
            <Label>Serial Numbers</Label>
            <div className="space-y-2 mt-2">
              {Array.from({ length: quantity }, (_, index) => (
                <Input
                  key={index}
                  placeholder={`Serial number ${index + 1}`}
                  value={serialNumbers[index] || ''}
                  onChange={(e) => updateSerialNumber(index, e.target.value)}
                />
              ))}
            </div>
          </div>
        )}

        <Button onClick={createOrder} disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Order'}
        </Button>
      </CardContent>
    </Card>
  );

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