package com.warehouse.service;

import com.warehouse.model.Order;
import com.warehouse.model.Device;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

public class WarehouseService {
    
    private OrderService orderService;
    
    public WarehouseService(OrderService orderService) {
        this.orderService = orderService;
    }

    // Predefined warehouse locations
    private static final List<String> WAREHOUSE_LOCATIONS = Arrays.asList(
        "Trichy", "Bangalore", "Hyderabad", "Kolkata", "Bhiwandi", 
        "Ghaziabad", "Zirakpur", "Indore", "Jaipur"
    );

    // Predefined tablet models
    private static final List<String> TABLET_MODELS = Arrays.asList(
        "TB301FU", "TB301FX", "TB-8505F", "TB-7306F", "TB-7306X", "TB-7305X"
    );

    // Predefined TV models
    private static final List<String> TV_MODELS = Arrays.asList(
        "Hyundai TV - 39\"", "Hyundai TV - 43\"", "Hyundai TV - 50\"", 
        "Hyundai TV - 55\"", "Hyundai TV - 65\"", "Xentec TV - 39\"", "Xentec TV - 43\""
    );

    /**
     * Get all available warehouses including 'All' option
     */
    public List<String> getAllWarehouses() {
        List<String> warehouses = new ArrayList<>();
        warehouses.add("All");
        warehouses.addAll(WAREHOUSE_LOCATIONS);
        return warehouses;
    }

    /**
     * Get warehouse summary with order and device counts
     */
    public Map<String, WarehouseSummary> getWarehouseSummary() {
        return getWarehouseSummary("All");
    }

    /**
     * Get warehouse summary filtered by location
     */
    public Map<String, WarehouseSummary> getWarehouseSummary(String selectedLocation) {
        Map<String, WarehouseSummary> summaryMap = new HashMap<>();
        
        List<String> warehousesToProcess = selectedLocation.equals("All") ? 
            WAREHOUSE_LOCATIONS : Arrays.asList(selectedLocation);
        
        for (String warehouse : warehousesToProcess) {
            List<Order> orders = getOrdersByWarehouse(warehouse);
            List<Device> devices = getDevicesByWarehouse(warehouse);
            
            WarehouseSummary summary = new WarehouseSummary();
            summary.setWarehouseName(warehouse);
            summary.setTotalOrders(orders.size());
            summary.setTotalDevices(devices.size());
            summary.setTotalQuantity(orders.stream().mapToInt(Order::getQuantity).sum());
            
            // Calculate inward, outward, and available stock
            Map<String, Integer> inwardStock = calculateInwardStock(orders);
            Map<String, Integer> outwardStock = calculateOutwardStock(orders);
            Map<String, Integer> availableStock = calculateAvailableStock(inwardStock, outwardStock);
            
            summary.setInwardStock(inwardStock);
            summary.setOutwardStock(outwardStock);
            summary.setAvailableStock(availableStock);
            summary.setOrderTypes(getOrderTypesSummary(orders));
            summary.setProductSummary(getProductSummary(orders));
            summary.setUpdatedAt(LocalDateTime.now());
            
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
     * Calculate inward stock (orders with type "Inward")
     */
    private Map<String, Integer> calculateInwardStock(List<Order> orders) {
        return orders.stream()
                .filter(order -> "Inward".equalsIgnoreCase(order.getOrderType()))
                .collect(Collectors.groupingBy(
                    Order::getProduct,
                    Collectors.summingInt(Order::getQuantity)
                ));
    }

    /**
     * Calculate outward stock (orders with type "Outward")
     */
    private Map<String, Integer> calculateOutwardStock(List<Order> orders) {
        return orders.stream()
                .filter(order -> "Outward".equalsIgnoreCase(order.getOrderType()))
                .collect(Collectors.groupingBy(
                    Order::getProduct,
                    Collectors.summingInt(Order::getQuantity)
                ));
    }

    /**
     * Calculate available stock (inward - outward)
     */
    private Map<String, Integer> calculateAvailableStock(Map<String, Integer> inwardStock, 
                                                       Map<String, Integer> outwardStock) {
        Map<String, Integer> availableStock = new HashMap<>(inwardStock);
        
        outwardStock.forEach((product, quantity) -> 
            availableStock.merge(product, -quantity, Integer::sum));
        
        return availableStock;
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
        private Map<String, Integer> inwardStock;
        private Map<String, Integer> outwardStock;
        private Map<String, Integer> availableStock;
        private LocalDateTime updatedAt;

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

        public Map<String, Integer> getInwardStock() { return inwardStock; }
        public void setInwardStock(Map<String, Integer> inwardStock) { this.inwardStock = inwardStock; }

        public Map<String, Integer> getOutwardStock() { return outwardStock; }
        public void setOutwardStock(Map<String, Integer> outwardStock) { this.outwardStock = outwardStock; }

        public Map<String, Integer> getAvailableStock() { return availableStock; }
        public void setAvailableStock(Map<String, Integer> availableStock) { this.availableStock = availableStock; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
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