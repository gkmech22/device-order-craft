package com.warehouse.service;

import com.warehouse.model.Order;
import com.warehouse.model.Device;
import java.util.*;
import java.util.stream.Collectors;

public class WarehouseService {
    
    private OrderService orderService;
    
    public WarehouseService(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Get all available warehouses
     */
    public List<String> getAllWarehouses() {
        return orderService.getUniqueWarehouses();
    }

    /**
     * Get warehouse summary with order and device counts
     */
    public Map<String, WarehouseSummary> getWarehouseSummary() {
        Map<String, WarehouseSummary> summaryMap = new HashMap<>();
        
        // Get all orders grouped by warehouse
        Map<String, List<Order>> ordersByWarehouse = orderService.getAllOrders().stream()
                .filter(order -> order.getWarehouse() != null && !order.getWarehouse().isEmpty())
                .collect(Collectors.groupingBy(Order::getWarehouse));
        
        // Get all devices grouped by warehouse
        Map<String, List<Device>> devicesByWarehouse = orderService.getAllDevices().stream()
                .filter(device -> device.getWarehouse() != null && !device.getWarehouse().isEmpty())
                .collect(Collectors.groupingBy(Device::getWarehouse));
        
        // Build summary for each warehouse
        Set<String> allWarehouses = new HashSet<>();
        allWarehouses.addAll(ordersByWarehouse.keySet());
        allWarehouses.addAll(devicesByWarehouse.keySet());
        
        for (String warehouse : allWarehouses) {
            List<Order> orders = ordersByWarehouse.getOrDefault(warehouse, new ArrayList<>());
            List<Device> devices = devicesByWarehouse.getOrDefault(warehouse, new ArrayList<>());
            
            WarehouseSummary summary = new WarehouseSummary();
            summary.setWarehouseName(warehouse);
            summary.setTotalOrders(orders.size());
            summary.setTotalDevices(devices.size());
            summary.setTotalQuantity(orders.stream().mapToInt(Order::getQuantity).sum());
            summary.setOrderTypes(getOrderTypesSummary(orders));
            summary.setProductSummary(getProductSummary(orders));
            
            summaryMap.put(warehouse, summary);
        }
        
        return summaryMap;
    }

    /**
     * Get orders by warehouse
     */
    public List<Order> getOrdersByWarehouse(String warehouse) {
        return orderService.getOrdersByWarehouse(warehouse);
    }

    /**
     * Get devices by warehouse
     */
    public List<Device> getDevicesByWarehouse(String warehouse) {
        return orderService.getAllDevices().stream()
                .filter(device -> warehouse.equals(device.getWarehouse()))
                .collect(Collectors.toList());
    }

    /**
     * Get order types summary for a list of orders
     */
    private Map<String, Integer> getOrderTypesSummary(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(
                    Order::getOrderType,
                    Collectors.summingInt(order -> 1)
                ));
    }

    /**
     * Get product summary for a list of orders
     */
    private Map<String, Integer> getProductSummary(List<Order> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(
                    Order::getProduct,
                    Collectors.summingInt(Order::getQuantity)
                ));
    }

    /**
     * Get warehouse statistics
     */
    public WarehouseStatistics getWarehouseStatistics(String warehouse) {
        List<Order> orders = getOrdersByWarehouse(warehouse);
        List<Device> devices = getDevicesByWarehouse(warehouse);
        
        WarehouseStatistics stats = new WarehouseStatistics();
        stats.setWarehouseName(warehouse);
        stats.setTotalOrders(orders.size());
        stats.setTotalDevices(devices.size());
        stats.setTotalQuantity(orders.stream().mapToInt(Order::getQuantity).sum());
        
        // Calculate order type distribution
        Map<String, Integer> orderTypeCount = orders.stream()
                .collect(Collectors.groupingBy(
                    Order::getOrderType,
                    Collectors.summingInt(order -> 1)
                ));
        stats.setOrderTypeDistribution(orderTypeCount);
        
        // Calculate product distribution
        Map<String, Integer> productCount = orders.stream()
                .collect(Collectors.groupingBy(
                    Order::getProduct,
                    Collectors.summingInt(Order::getQuantity)
                ));
        stats.setProductDistribution(productCount);
        
        // Recent activity (orders in last 30 days)
        long recentOrderCount = orders.stream()
                .filter(order -> order.getCreatedAt().isAfter(
                    java.time.LocalDateTime.now().minusDays(30)))
                .count();
        stats.setRecentOrderCount((int) recentOrderCount);
        
        return stats;
    }

    // Inner classes for warehouse data structures
    public static class WarehouseSummary {
        private String warehouseName;
        private int totalOrders;
        private int totalDevices;
        private int totalQuantity;
        private Map<String, Integer> orderTypes;
        private Map<String, Integer> productSummary;

        // Getters and Setters
        public String getWarehouseName() { return warehouseName; }
        public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

        public int getTotalDevices() { return totalDevices; }
        public void setTotalDevices(int totalDevices) { this.totalDevices = totalDevices; }

        public int getTotalQuantity() { return totalQuantity; }
        public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

        public Map<String, Integer> getOrderTypes() { return orderTypes; }
        public void setOrderTypes(Map<String, Integer> orderTypes) { this.orderTypes = orderTypes; }

        public Map<String, Integer> getProductSummary() { return productSummary; }
        public void setProductSummary(Map<String, Integer> productSummary) { this.productSummary = productSummary; }
    }

    public static class WarehouseStatistics {
        private String warehouseName;
        private int totalOrders;
        private int totalDevices;
        private int totalQuantity;
        private int recentOrderCount;
        private Map<String, Integer> orderTypeDistribution;
        private Map<String, Integer> productDistribution;

        // Getters and Setters
        public String getWarehouseName() { return warehouseName; }
        public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

        public int getTotalDevices() { return totalDevices; }
        public void setTotalDevices(int totalDevices) { this.totalDevices = totalDevices; }

        public int getTotalQuantity() { return totalQuantity; }
        public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

        public int getRecentOrderCount() { return recentOrderCount; }
        public void setRecentOrderCount(int recentOrderCount) { this.recentOrderCount = recentOrderCount; }

        public Map<String, Integer> getOrderTypeDistribution() { return orderTypeDistribution; }
        public void setOrderTypeDistribution(Map<String, Integer> orderTypeDistribution) { 
            this.orderTypeDistribution = orderTypeDistribution; 
        }

        public Map<String, Integer> getProductDistribution() { return productDistribution; }
        public void setProductDistribution(Map<String, Integer> productDistribution) { 
            this.productDistribution = productDistribution; 
        }
    }
}