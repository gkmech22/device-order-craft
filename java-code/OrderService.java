package com.warehouse.service;

import com.warehouse.model.Order;
import com.warehouse.model.Device;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class OrderService {
    private List<Order> orders;
    private List<Device> devices;
    private int orderCounter;

    public OrderService() {
        this.orders = new ArrayList<>();
        this.devices = new ArrayList<>();
        this.orderCounter = 1;
    }

    /**
     * Create a new order with generated device numbers
     */
    public Order createOrder(String orderType, String salesOrder, String dealId, 
                           String nucleusId, String schoolName, String product, 
                           String model, int quantity, String sdCardSize, 
                           String profileId, String location, String warehouse) {
        
        Order order = new Order(orderType, salesOrder, dealId, nucleusId, 
                               schoolName, product, model, quantity, 
                               sdCardSize, profileId, location, warehouse);
        
        // Generate unique order ID
        order.setId("ORD-" + String.format("%06d", orderCounter++));
        
        // Generate device numbers
        List<String> deviceNumbers = generateDeviceNumbers(order);
        order.setDeviceNumbers(deviceNumbers);
        
        // Create individual device records
        for (String deviceNumber : deviceNumbers) {
            Device device = new Device(deviceNumber, order);
            devices.add(device);
        }
        
        orders.add(order);
        return order;
    }

    /**
     * Generate device numbers based on order details
     */
    private List<String> generateDeviceNumbers(Order order) {
        List<String> deviceNumbers = new ArrayList<>();
        String prefix = generateDevicePrefix(order);
        
        for (int i = 1; i <= order.getQuantity(); i++) {
            String deviceNumber = prefix + String.format("%04d", i);
            deviceNumbers.add(deviceNumber);
        }
        
        return deviceNumbers;
    }

    /**
     * Generate device prefix based on order type and product
     */
    private String generateDevicePrefix(Order order) {
        StringBuilder prefix = new StringBuilder();
        
        // Add order type prefix
        switch (order.getOrderType().toLowerCase()) {
            case "new":
                prefix.append("NEW-");
                break;
            case "refurbish":
                prefix.append("REF-");
                break;
            case "replace":
                prefix.append("RPL-");
                break;
            default:
                prefix.append("ORD-");
                break;
        }
        
        // Add product/model abbreviation
        if (order.getProduct() != null && !order.getProduct().isEmpty()) {
            prefix.append(order.getProduct().substring(0, Math.min(3, order.getProduct().length())).toUpperCase());
        }
        
        if (order.getModel() != null && !order.getModel().isEmpty()) {
            prefix.append(order.getModel().substring(0, Math.min(2, order.getModel().length())).toUpperCase());
        }
        
        prefix.append("-");
        return prefix.toString();
    }

    /**
     * Search orders by various criteria
     */
    public List<Order> searchOrders(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return new ArrayList<>(orders);
        }
        
        String term = searchTerm.toLowerCase().trim();
        
        return orders.stream()
                .filter(order -> 
                    (order.getSalesOrder() != null && order.getSalesOrder().toLowerCase().contains(term)) ||
                    (order.getDealId() != null && order.getDealId().toLowerCase().contains(term)) ||
                    (order.getId() != null && order.getId().toLowerCase().contains(term)) ||
                    (order.getNucleusId() != null && order.getNucleusId().toLowerCase().contains(term)) ||
                    (order.getSchoolName() != null && order.getSchoolName().toLowerCase().contains(term)) ||
                    order.getDeviceNumbers().stream().anyMatch(device -> device.toLowerCase().contains(term))
                )
                .collect(Collectors.toList());
    }

    /**
     * Search devices by device number or other criteria
     */
    public List<Device> searchDevices(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return new ArrayList<>(devices);
        }
        
        String term = searchTerm.toLowerCase().trim();
        
        return devices.stream()
                .filter(device -> 
                    (device.getDeviceNumber() != null && device.getDeviceNumber().toLowerCase().contains(term)) ||
                    (device.getSalesOrder() != null && device.getSalesOrder().toLowerCase().contains(term)) ||
                    (device.getDealId() != null && device.getDealId().toLowerCase().contains(term)) ||
                    (device.getOrderId() != null && device.getOrderId().toLowerCase().contains(term))
                )
                .collect(Collectors.toList());
    }

    /**
     * Get all devices sorted by creation date
     */
    public List<Device> getAllDevicesSortedByDate() {
        return devices.stream()
                .sorted((d1, d2) -> d2.getCreatedAt().compareTo(d1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Get orders by warehouse
     */
    public List<Order> getOrdersByWarehouse(String warehouse) {
        return orders.stream()
                .filter(order -> warehouse.equals(order.getWarehouse()))
                .collect(Collectors.toList());
    }

    /**
     * Get unique warehouses
     */
    public List<String> getUniqueWarehouses() {
        return orders.stream()
                .map(Order::getWarehouse)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Get warehouse summary
     */
    public Map<String, Integer> getWarehouseSummary() {
        Map<String, Integer> summary = new HashMap<>();
        
        for (Order order : orders) {
            String warehouse = order.getWarehouse();
            if (warehouse != null && !warehouse.isEmpty()) {
                summary.put(warehouse, summary.getOrDefault(warehouse, 0) + order.getQuantity());
            }
        }
        
        return summary;
    }

    /**
     * Get all orders
     */
    public List<Order> getAllOrders() {
        return new ArrayList<>(orders);
    }

    /**
     * Get all devices
     */
    public List<Device> getAllDevices() {
        return new ArrayList<>(devices);
    }

    /**
     * Get order by ID
     */
    public Order getOrderById(String orderId) {
        return orders.stream()
                .filter(order -> orderId.equals(order.getId()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Delete order and associated devices
     */
    public boolean deleteOrder(String orderId) {
        Order order = getOrderById(orderId);
        if (order != null) {
            // Remove associated devices
            devices.removeIf(device -> orderId.equals(device.getOrderId()));
            // Remove order
            orders.remove(order);
            return true;
        }
        return false;
    }

    /**
     * Update order
     */
    public boolean updateOrder(String orderId, Order updatedOrder) {
        Order existingOrder = getOrderById(orderId);
        if (existingOrder != null) {
            // Update order fields
            existingOrder.setOrderType(updatedOrder.getOrderType());
            existingOrder.setSalesOrder(updatedOrder.getSalesOrder());
            existingOrder.setDealId(updatedOrder.getDealId());
            existingOrder.setNucleusId(updatedOrder.getNucleusId());
            existingOrder.setSchoolName(updatedOrder.getSchoolName());
            existingOrder.setProduct(updatedOrder.getProduct());
            existingOrder.setModel(updatedOrder.getModel());
            existingOrder.setQuantity(updatedOrder.getQuantity());
            existingOrder.setSdCardSize(updatedOrder.getSdCardSize());
            existingOrder.setProfileId(updatedOrder.getProfileId());
            existingOrder.setLocation(updatedOrder.getLocation());
            existingOrder.setWarehouse(updatedOrder.getWarehouse());
            
            // Regenerate device numbers if quantity changed
            if (existingOrder.getQuantity() != updatedOrder.getQuantity()) {
                // Remove old devices
                devices.removeIf(device -> orderId.equals(device.getOrderId()));
                
                // Generate new device numbers
                List<String> newDeviceNumbers = generateDeviceNumbers(existingOrder);
                existingOrder.setDeviceNumbers(newDeviceNumbers);
                
                // Create new device records
                for (String deviceNumber : newDeviceNumbers) {
                    Device device = new Device(deviceNumber, existingOrder);
                    devices.add(device);
                }
            }
            
            return true;
        }
        return false;
    }
}