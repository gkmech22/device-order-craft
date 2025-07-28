-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type TEXT NOT NULL CHECK (order_type IN ('Inward', 'Outward')),
  product TEXT NOT NULL CHECK (product IN ('Tablet', 'TV')),
  model TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  warehouse TEXT NOT NULL,
  serial_numbers TEXT[] NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Create devices table for tracking individual devices
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product TEXT NOT NULL CHECK (product IN ('Tablet', 'TV')),
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  warehouse TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Assigned', 'Maintenance')),
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Orders are publicly accessible" 
ON public.orders 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Devices are publicly accessible" 
ON public.devices 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_warehouse ON public.orders(warehouse);
CREATE INDEX idx_orders_product ON public.orders(product);
CREATE INDEX idx_orders_model ON public.orders(model);
CREATE INDEX idx_orders_date ON public.orders(order_date);
CREATE INDEX idx_orders_deleted ON public.orders(is_deleted);

CREATE INDEX idx_devices_warehouse ON public.devices(warehouse);
CREATE INDEX idx_devices_product ON public.devices(product);
CREATE INDEX idx_devices_model ON public.devices(model);
CREATE INDEX idx_devices_serial ON public.devices(serial_number);
CREATE INDEX idx_devices_status ON public.devices(status);
CREATE INDEX idx_devices_deleted ON public.devices(is_deleted);