package com.warehouse.controller;

import com.warehouse.model.Order;
import com.warehouse.model.Device;
import com.warehouse.service.OrderService;
import com.warehouse.service.CSVExportService;
import com.warehouse.service.WarehouseService;
import java.util.List;
import java.util.Map;

/**
 * Main controller class that orchestrates all order management operations
 * This is equivalent to the React component's business logic
 */
public class OrderManagementController {
    
    private OrderService orderService;
    private CSVExportService csvExportService;
    private WarehouseService warehouseService;
    
    public OrderManagementController() {
        this.orderService = new OrderService();
        this.csvExportService = new CSVExportService();
        this.warehouseService = new WarehouseService(orderService);
    }

    /**
     * Create a new order
     */
    public Order createOrder(OrderRequest request) {
        return orderService.createOrder(
            request.getOrderType(),
            request.getSalesOrder(),
            request.getDealId(),
            request.getNucleusId(),
            request.getSchoolName(),
            request.getProduct(),
            request.getModel(),
            request.getQuantity(),
            request.getSdCardSize(),
            request.getProfileId(),
            request.getLocation(),
            request.getWarehouse()
        );
    }

    /**
     * Search orders
     */
    public List<Order> searchOrders(String searchTerm) {
        return orderService.searchOrders(searchTerm);
    }

    /**
     * Search devices
     */
    public List<Device> searchDevices(String searchTerm) {
        return orderService.searchDevices(searchTerm);
    }

    /**
     * Get all devices sorted by creation date
     */
    public List<Device> getAllDevices() {
        return orderService.getAllDevicesSortedByDate();
    }

    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    /**
     * Export devices to CSV
     */
    public String exportDevicesToCSV() {
        List<Device> devices = orderService.getAllDevicesSortedByDate();
        return csvExportService.exportDevicesToCSV(devices);
    }

    /**
     * Export devices to CSV file
     */
    public void exportDevicesToFile(String filePath) {
        try {
            List<Device> devices = orderService.getAllDevicesSortedByDate();
            csvExportService.exportDevicesToCSVFile(devices, filePath);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export CSV file", e);
        }
    }

    /**
     * Get warehouse summary
     */
    public Map<String, WarehouseService.WarehouseSummary> getWarehouseSummary() {
        return warehouseService.getWarehouseSummary();
    }

    /**
     * Get all warehouses
     */
    public List<String> getAllWarehouses() {
        return warehouseService.getAllWarehouses();
    }

    /**
     * Get orders by warehouse
     */
    public List<Order> getOrdersByWarehouse(String warehouse) {
        return warehouseService.getOrdersByWarehouse(warehouse);
    }

    /**
     * Get devices by warehouse
     */
    public List<Device> getDevicesByWarehouse(String warehouse) {
        return warehouseService.getDevicesByWarehouse(warehouse);
    }

    /**
     * Get warehouse statistics
     */
    public WarehouseService.WarehouseStatistics getWarehouseStatistics(String warehouse) {
        return warehouseService.getWarehouseStatistics(warehouse);
    }

    /**
     * Delete order
     */
    public boolean deleteOrder(String orderId) {
        return orderService.deleteOrder(orderId);
    }

    /**
     * Update order
     */
    public boolean updateOrder(String orderId, OrderRequest request) {
        Order updatedOrder = new Order(
            request.getOrderType(),
            request.getSalesOrder(),
            request.getDealId(),
            request.getNucleusId(),
            request.getSchoolName(),
            request.getProduct(),
            request.getModel(),
            request.getQuantity(),
            request.getSdCardSize(),
            request.getProfileId(),
            request.getLocation(),
            request.getWarehouse()
        );
        
        return orderService.updateOrder(orderId, updatedOrder);
    }

    /**
     * Get order by ID
     */
    public Order getOrderById(String orderId) {
        return orderService.getOrderById(orderId);
    }

    // Inner class for order request data
    public static class OrderRequest {
        private String orderType;
        private String salesOrder;
        private String dealId;
        private String nucleusId;
        private String schoolName;
        private String product;
        private String model;
        private int quantity;
        private String sdCardSize;
        private String profileId;
        private String location;
        private String warehouse;

        // Constructors
        public OrderRequest() {}

        public OrderRequest(String orderType, String salesOrder, String dealId, String nucleusId, 
                           String schoolName, String product, String model, int quantity, 
                           String sdCardSize, String profileId, String location, String warehouse) {
            this.orderType = orderType;
            this.salesOrder = salesOrder;
            this.dealId = dealId;
            this.nucleusId = nucleusId;
            this.schoolName = schoolName;
            this.product = product;
            this.model = model;
            this.quantity = quantity;
            this.sdCardSize = sdCardSize;
            this.profileId = profileId;
            this.location = location;
            this.warehouse = warehouse;
        }

        // Getters and Setters
        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }

        public String getSalesOrder() { return salesOrder; }
        public void setSalesOrder(String salesOrder) { this.salesOrder = salesOrder; }

        public String getDealId() { return dealId; }
        public void setDealId(String dealId) { this.dealId = dealId; }

        public String getNucleusId() { return nucleusId; }
        public void setNucleusId(String nucleusId) { this.nucleusId = nucleusId; }

        public String getSchoolName() { return schoolName; }
        public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

        public String getProduct() { return product; }
        public void setProduct(String product) { this.product = product; }

        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }

        public String getSdCardSize() { return sdCardSize; }
        public void setSdCardSize(String sdCardSize) { this.sdCardSize = sdCardSize; }

        public String getProfileId() { return profileId; }
        public void setProfileId(String profileId) { this.profileId = profileId; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getWarehouse() { return warehouse; }
        public void setWarehouse(String warehouse) { this.warehouse = warehouse; }
    }
}