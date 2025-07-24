import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, Download, Menu, ShoppingCart, Eye, Edit, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

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

interface Order {
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

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<'create' | 'view' | 'serial-entry' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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
    'Other'
  ];

  const tabletModels = ['TB301FU', 'TB301XU'];
  const sdCardSizes = ['64 GB', '128 GB'];
  const locations = ['Trichy', 'Bangalore', 'Hyderabad'];

  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  const generateDummyId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

    const newOrder: Order = {
      id: orders.length + 1,
      orderType,
      salesOrder: salesOrder || generateDummyId('SO'),
      dealId: dealId || '',
      tablets: tablets.filter(t => t.schoolName.trim()),
      tvs: tvs.filter(t => t.schoolName.trim()),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };

    setOrders([...orders, newOrder]);
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
      variant: "default"
    });
  };

  const openOrderForSerialEntry = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('serial-entry');
  };

  const editOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderType(order.orderType);
    setSalesOrder(order.salesOrder);
    setDealId(order.dealId);
    setTablets(order.tablets);
    setTVs(order.tvs);
    setCurrentView('edit');
  };

  const updateOrder = () => {
    if (!selectedOrder) return;

    const updatedOrder = {
      ...selectedOrder,
      orderType,
      salesOrder: salesOrder || generateDummyId('SO'),
      dealId: dealId || '',
      tablets: tablets.filter(t => t.schoolName.trim()),
      tvs: tvs.filter(t => t.schoolName.trim()),
      updatedAt: new Date()
    };

    setOrders(orders.map(order => 
      order.id === selectedOrder.id ? updatedOrder : order
    ));

    setSelectedOrder(null);
    setCurrentView('view');
    
    // Reset form
    setOrderType('');
    setSalesOrder('');
    setDealId('');
    setTablets([]);
    setTVs([]);

    toast({
      title: "Success",
      description: "Order updated successfully!",
      variant: "default"
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

  const saveSerialNumbers = () => {
    if (!selectedOrder) return;

    const updatedOrder = {
      ...selectedOrder,
      status: 'completed' as const,
      updatedAt: new Date()
    };

    setOrders(orders.map(order => 
      order.id === selectedOrder.id ? updatedOrder : order
    ));

    setSelectedOrder(null);
    setCurrentView('view');

    toast({
      title: "Success",
      description: "Serial numbers saved successfully!",
      variant: "default"
    });
  };

  const deleteOrder = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
    toast({
      title: "Success",
      description: "Order deleted successfully!",
      variant: "default"
    });
  };

  const downloadCSV = () => {
    if (orders.length === 0) {
      toast({
        title: "No Data",
        description: "No orders to download",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      // Headers
      ['Order ID', 'Order Type', 'Sales Order', 'Deal ID', 'Device Type', 'School Name', 'Model', 'Location', 'Serial Number', 'Created At'],
      // Data rows - one row per serial number
      ...orders.flatMap(order => [
        ...order.tablets.flatMap(tablet => {
          if (tablet.serialNumbers && tablet.serialNumbers.length > 0) {
            return tablet.serialNumbers.map(serialNumber => [
              order.id.toString(),
              order.orderType,
              order.salesOrder,
              order.dealId,
              'Tablet',
              tablet.schoolName,
              tablet.model,
              tablet.location,
              serialNumber || '',
              order.createdAt.toISOString()
            ]);
          } else {
            // If no serial numbers, create rows based on quantity
            return Array.from({ length: tablet.quantity }, () => [
              order.id.toString(),
              order.orderType,
              order.salesOrder,
              order.dealId,
              'Tablet',
              tablet.schoolName,
              tablet.model,
              tablet.location,
              '',
              order.createdAt.toISOString()
            ]);
          }
        }),
        ...order.tvs.flatMap(tv => {
          if (tv.serialNumbers && tv.serialNumbers.length > 0) {
            return tv.serialNumbers.map(serialNumber => [
              order.id.toString(),
              order.orderType,
              order.salesOrder,
              order.dealId,
              'TV',
              tv.schoolName,
              tv.model,
              tv.location,
              serialNumber || '',
              order.createdAt.toISOString()
            ]);
          } else {
            // If no serial numbers, create rows based on quantity
            return Array.from({ length: tv.quantity }, () => [
              order.id.toString(),
              order.orderType,
              order.salesOrder,
              order.dealId,
              'TV',
              tv.schoolName,
              tv.model,
              tv.location,
              '',
              order.createdAt.toISOString()
            ]);
          }
        })
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "CSV file downloaded successfully!",
      variant: "default"
    });
  };

  const filteredOrders = orders.filter(order => 
    order.salesOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.dealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tablets.some(t => t.nucleusId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.tvs.some(t => t.nucleusId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Management
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">ORDER</h3>
                <div className="space-y-1">
                  <Button
                    variant={currentView === 'create' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentView('create');
                      setSidebarOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create a order
                  </Button>
                  <Button
                    variant={currentView === 'view' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentView('view');
                      setSidebarOpen(false);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View existing order
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={downloadCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Sales order, Deal ID, or Device number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {currentView === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Create Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="salesOrder">Sales Order</Label>
                  <Input
                    id="salesOrder"
                    placeholder="Leave blank for auto-generation"
                    value={salesOrder}
                    onChange={(e) => setSalesOrder(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealId">Deal ID</Label>
                  <Input
                    id="dealId"
                    placeholder="Leave blank for auto-generation"
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="tablet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tablet">Tablet</TabsTrigger>
                  <TabsTrigger value="tv">TV</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tablet" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Tablet Configuration</h3>
                    <Button onClick={addTablet} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tablet
                    </Button>
                  </div>
                  
                  {tablets.map((tablet, index) => (
                    <Card key={tablet.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">Tablet {index + 1}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTablet(tablet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nucleus ID</Label>
                          <Input
                            placeholder="Optional"
                            value={tablet.nucleusId || ''}
                            onChange={(e) => updateTablet(tablet.id, 'nucleusId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School Name *</Label>
                          <Input
                            placeholder="Required"
                            value={tablet.schoolName}
                            onChange={(e) => updateTablet(tablet.id, 'schoolName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                          <Label>Profile ID</Label>
                          <Input
                            placeholder="e.g., 706"
                            value={tablet.profileId}
                            onChange={(e) => updateTablet(tablet.id, 'profileId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
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
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={tablet.quantity}
                            onChange={(e) => updateTablet(tablet.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="tv" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">TV Configuration</h3>
                    <Button onClick={addTV} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add TV
                    </Button>
                  </div>
                  
                  {tvs.map((tv, index) => (
                    <Card key={tv.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">TV {index + 1}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTV(tv.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Nucleus ID</Label>
                          <Input
                            placeholder="Optional"
                            value={tv.nucleusId || ''}
                            onChange={(e) => updateTV(tv.id, 'nucleusId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School Name *</Label>
                          <Input
                            placeholder="Required"
                            value={tv.schoolName}
                            onChange={(e) => updateTV(tv.id, 'schoolName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select
                            value={tv.model}
                            onValueChange={(value) => updateTV(tv.id, 'model', value)}
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
                        <div className="space-y-2">
                          <Label>Location</Label>
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
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={tv.quantity}
                            onChange={(e) => updateTV(tv.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              <Button onClick={createOrder} className="w-full" size="lg">
                Create Order
              </Button>
            </CardContent>
          </Card>
        )}

        {currentView === 'view' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Existing Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <Card key={order.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{order.orderType}</Badge>
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{order.id}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p><strong>Sales Order:</strong> {order.salesOrder}</p>
                              <p><strong>Deal ID:</strong> {order.dealId}</p>
                              <p><strong>Created:</strong> {order.createdAt.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openOrderForSerialEntry(order)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editOrder(order)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteOrder(order.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.tablets.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Tablets ({order.tablets.length})</h4>
                              <div className="grid gap-2">
                                {order.tablets.map(tablet => (
                                  <div key={tablet.id} className="text-sm bg-muted p-2 rounded">
                                    <span className="font-medium">{tablet.schoolName}</span>
                                    {tablet.model && <span> - {tablet.model}</span>}
                                    <span> - Qty: {tablet.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {order.tvs.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">TVs ({order.tvs.length})</h4>
                              <div className="grid gap-2">
                                {order.tvs.map(tv => (
                                  <div key={tv.id} className="text-sm bg-muted p-2 rounded">
                                    <span className="font-medium">{tv.schoolName}</span>
                                    {tv.model && <span> - {tv.model}</span>}
                                    <span> - Qty: {tv.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'serial-entry' && selectedOrder && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enter Serial Numbers - Order #{selectedOrder.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
                  <p><strong>Sales Order:</strong> {selectedOrder.salesOrder}</p>
                  <p><strong>Deal ID:</strong> {selectedOrder.dealId}</p>
                </div>

                {selectedOrder.tablets.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tablet Serial Numbers</h3>
                    {selectedOrder.tablets.map(tablet => (
                      <Card key={tablet.id} className="p-4">
                        <div className="mb-3">
                          <Badge variant="secondary">Tablet</Badge>
                          <p className="text-sm mt-1">
                            <strong>{tablet.schoolName}</strong>
                            {tablet.model && <span> - {tablet.model}</span>}
                            <span> - Quantity: {tablet.quantity}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: tablet.quantity }, (_, index) => (
                            <div key={index} className="space-y-2">
                              <Label>Serial Number {index + 1}</Label>
                              <Input
                                placeholder={`Enter serial number ${index + 1}`}
                                value={tablet.serialNumbers?.[index] || ''}
                                onChange={(e) => updateSerialNumber(tablet.id, index, e.target.value, 'tablet')}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedOrder.tvs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">TV Serial Numbers</h3>
                    {selectedOrder.tvs.map(tv => (
                      <Card key={tv.id} className="p-4">
                        <div className="mb-3">
                          <Badge variant="secondary">TV</Badge>
                          <p className="text-sm mt-1">
                            <strong>{tv.schoolName}</strong>
                            {tv.model && <span> - {tv.model}</span>}
                            <span> - Quantity: {tv.quantity}</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: tv.quantity }, (_, index) => (
                            <div key={index} className="space-y-2">
                              <Label>Serial Number {index + 1}</Label>
                              <Input
                                placeholder={`Enter serial number ${index + 1}`}
                                value={tv.serialNumbers?.[index] || ''}
                                onChange={(e) => updateSerialNumber(tv.id, index, e.target.value, 'tv')}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={saveSerialNumbers} className="flex-1" size="lg">
                    Save Serial Numbers
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentView('view')}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'edit' && selectedOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Order #{selectedOrder.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="salesOrder">Sales Order</Label>
                  <Input
                    id="salesOrder"
                    placeholder="Leave blank for auto-generation"
                    value={salesOrder}
                    onChange={(e) => setSalesOrder(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealId">Deal ID</Label>
                  <Input
                    id="dealId"
                    placeholder="Leave blank for auto-generation"
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="tablet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tablet">Tablet</TabsTrigger>
                  <TabsTrigger value="tv">TV</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tablet" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Tablet Configuration</h3>
                    <Button onClick={addTablet} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tablet
                    </Button>
                  </div>
                  
                  {tablets.map((tablet, index) => (
                    <Card key={tablet.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">Tablet {index + 1}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTablet(tablet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Nucleus ID</Label>
                          <Input
                            placeholder="Optional"
                            value={tablet.nucleusId || ''}
                            onChange={(e) => updateTablet(tablet.id, 'nucleusId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School Name *</Label>
                          <Input
                            placeholder="Required"
                            value={tablet.schoolName}
                            onChange={(e) => updateTablet(tablet.id, 'schoolName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
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
                        <div className="space-y-2">
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
                        <div className="space-y-2">
                          <Label>Profile ID</Label>
                          <Input
                            placeholder="e.g., 706"
                            value={tablet.profileId}
                            onChange={(e) => updateTablet(tablet.id, 'profileId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
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
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={tablet.quantity}
                            onChange={(e) => updateTablet(tablet.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="tv" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">TV Configuration</h3>
                    <Button onClick={addTV} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add TV
                    </Button>
                  </div>
                  
                  {tvs.map((tv, index) => (
                    <Card key={tv.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary">TV {index + 1}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTV(tv.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Nucleus ID</Label>
                          <Input
                            placeholder="Optional"
                            value={tv.nucleusId || ''}
                            onChange={(e) => updateTV(tv.id, 'nucleusId', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>School Name *</Label>
                          <Input
                            placeholder="Required"
                            value={tv.schoolName}
                            onChange={(e) => updateTV(tv.id, 'schoolName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select
                            value={tv.model}
                            onValueChange={(value) => updateTV(tv.id, 'model', value)}
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
                        <div className="space-y-2">
                          <Label>Location</Label>
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
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={tv.quantity}
                            onChange={(e) => updateTV(tv.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="flex gap-4">
                <Button onClick={updateOrder} className="flex-1" size="lg">
                  Update Order
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('view')}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;