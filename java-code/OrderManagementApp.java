package com.warehouse;

import com.warehouse.controller.OrderManagementController;
import com.warehouse.controller.OrderManagementController.OrderRequest;
import com.warehouse.model.Order;
import com.warehouse.model.Device;
import com.warehouse.service.WarehouseService;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

/**
 * Main application class demonstrating the order management system
 */
public class OrderManagementApp {
    
    private OrderManagementController controller;
    private Scanner scanner;
    
    public OrderManagementApp() {
        this.controller = new OrderManagementController();
        this.scanner = new Scanner(System.in);
    }
    
    public static void main(String[] args) {
        OrderManagementApp app = new OrderManagementApp();
        app.run();
    }
    
    public void run() {
        System.out.println("=== Order Management System ===");
        
        while (true) {
            printMenu();
            int choice = getChoice();
            
            switch (choice) {
                case 1:
                    createNewOrder();
                    break;
                case 2:
                    searchOrders();
                    break;
                case 3:
                    viewAllDevices();
                    break;
                case 4:
                    searchDevices();
                    break;
                case 5:
                    exportCSV();
                    break;
                case 6:
                    viewWarehouseSummary();
                    break;
                case 7:
                    viewWarehouseSummaryByLocation();
                    break;
                case 8:
                    viewOrdersByWarehouse();
                    break;
                case 9:
                    System.out.println("Goodbye!");
                    return;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
            
            System.out.println("\nPress Enter to continue...");
            scanner.nextLine();
        }
    }
    
    private void printMenu() {
        System.out.println("\n=== Main Menu ===");
        System.out.println("1. Create New Order");
        System.out.println("2. Search Orders");
        System.out.println("3. View All Devices");
        System.out.println("4. Search Devices");
        System.out.println("5. Export CSV");
        System.out.println("6. View Warehouse Summary");
        System.out.println("7. View Warehouse Summary by Location");
        System.out.println("8. View Orders by Warehouse");
        System.out.println("9. Exit");
        System.out.print("Choose an option: ");
    }
    
    private int getChoice() {
        try {
            return Integer.parseInt(scanner.nextLine());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
    
    private void createNewOrder() {
        System.out.println("\n=== Create New Order ===");
        
        System.out.print("Order Type (New/Refurbish/Replace): ");
        String orderType = scanner.nextLine();
        
        System.out.print("Sales Order: ");
        String salesOrder = scanner.nextLine();
        
        System.out.print("Deal ID: ");
        String dealId = scanner.nextLine();
        
        System.out.print("Nucleus ID: ");
        String nucleusId = scanner.nextLine();
        
        System.out.print("School Name: ");
        String schoolName = scanner.nextLine();
        
        System.out.print("Product: ");
        String product = scanner.nextLine();
        
        System.out.print("Model: ");
        String model = scanner.nextLine();
        
        System.out.print("Quantity: ");
        int quantity = Integer.parseInt(scanner.nextLine());
        
        System.out.print("SD Card Size: ");
        String sdCardSize = scanner.nextLine();
        
        System.out.print("Profile ID: ");
        String profileId = scanner.nextLine();
        
        System.out.print("Location: ");
        String location = scanner.nextLine();
        
        System.out.print("Warehouse: ");
        String warehouse = scanner.nextLine();
        
        OrderRequest request = new OrderRequest(orderType, salesOrder, dealId, nucleusId,
                                               schoolName, product, model, quantity,
                                               sdCardSize, profileId, location, warehouse);
        
        Order order = controller.createOrder(request);
        
        System.out.println("\nOrder created successfully!");
        printOrderDetails(order);
    }
    
    private void searchOrders() {
        System.out.println("\n=== Search Orders ===");
        System.out.print("Enter search term (Sales Order, Deal ID, Order ID, etc.): ");
        String searchTerm = scanner.nextLine();
        
        List<Order> orders = controller.searchOrders(searchTerm);
        
        if (orders.isEmpty()) {
            System.out.println("No orders found.");
        } else {
            System.out.println("\nFound " + orders.size() + " order(s):");
            for (Order order : orders) {
                printOrderSummary(order);
                System.out.println("---");
            }
        }
    }
    
    private void viewAllDevices() {
        System.out.println("\n=== All Devices ===");
        List<Device> devices = controller.getAllDevices();
        
        if (devices.isEmpty()) {
            System.out.println("No devices found.");
        } else {
            System.out.println("Total devices: " + devices.size());
            System.out.println();
            printDeviceHeader();
            for (Device device : devices) {
                printDeviceRow(device);
            }
        }
    }
    
    private void searchDevices() {
        System.out.println("\n=== Search Devices ===");
        System.out.print("Enter search term (Device Number, Sales Order, Deal ID, etc.): ");
        String searchTerm = scanner.nextLine();
        
        List<Device> devices = controller.searchDevices(searchTerm);
        
        if (devices.isEmpty()) {
            System.out.println("No devices found.");
        } else {
            System.out.println("\nFound " + devices.size() + " device(s):");
            printDeviceHeader();
            for (Device device : devices) {
                printDeviceRow(device);
            }
        }
    }
    
    private void exportCSV() {
        System.out.println("\n=== Export CSV ===");
        System.out.print("Enter file path (e.g., /path/to/devices.csv): ");
        String filePath = scanner.nextLine();
        
        try {
            controller.exportDevicesToFile(filePath);
            System.out.println("CSV exported successfully to: " + filePath);
        } catch (Exception e) {
            System.out.println("Error exporting CSV: " + e.getMessage());
        }
    }
    
    private void viewWarehouseSummary() {
        System.out.println("\n=== Warehouse Summary (All Locations) ===");
        Map<String, WarehouseService.WarehouseSummary> summary = controller.getWarehouseSummary();
        
        if (summary.isEmpty()) {
            System.out.println("No warehouse data available.");
        } else {
            for (WarehouseService.WarehouseSummary warehouseSummary : summary.values()) {
                printWarehouseSummaryDetails(warehouseSummary);
            }
        }
    }

    private void viewWarehouseSummaryByLocation() {
        System.out.println("\n=== Available Warehouses ===");
        List<String> warehouses = controller.getAllWarehouses();
        
        if (warehouses.isEmpty()) {
            System.out.println("No warehouses available.");
            return;
        }
        
        for (int i = 0; i < warehouses.size(); i++) {
            System.out.println((i + 1) + ". " + warehouses.get(i));
        }
        
        System.out.print("Select warehouse location: ");
        try {
            int choice = Integer.parseInt(scanner.nextLine()) - 1;
            if (choice >= 0 && choice < warehouses.size()) {
                String selectedLocation = warehouses.get(choice);
                System.out.println("\n=== Warehouse Summary for " + selectedLocation + " ===");
                
                Map<String, WarehouseService.WarehouseSummary> summary = 
                    controller.getWarehouseSummaryByLocation(selectedLocation);
                
                if (summary.isEmpty()) {
                    System.out.println("No data available for this location.");
                } else {
                    for (WarehouseService.WarehouseSummary warehouseSummary : summary.values()) {
                        printWarehouseSummaryDetails(warehouseSummary);
                    }
                }
            } else {
                System.out.println("Invalid selection!");
            }
        } catch (NumberFormatException e) {
            System.out.println("Invalid input.");
        }
    }

    private void printWarehouseSummaryDetails(WarehouseService.WarehouseSummary warehouseSummary) {
        System.out.println("\nWarehouse: " + warehouseSummary.getWarehouseName());
        System.out.println("Total Orders: " + warehouseSummary.getTotalOrders());
        System.out.println("Total Devices: " + warehouseSummary.getTotalDevices());
        System.out.println("Total Quantity: " + warehouseSummary.getTotalQuantity());
        if (warehouseSummary.getUpdatedAt() != null) {
            System.out.println("Updated At: " + warehouseSummary.getUpdatedAt());
        }
        
        System.out.println("\nStock Details:");
        if (warehouseSummary.getInwardStock() != null && !warehouseSummary.getInwardStock().isEmpty()) {
            System.out.println("Inward Stock:");
            warehouseSummary.getInwardStock().forEach((product, quantity) -> 
                System.out.println("  " + product + ": " + quantity));
        }
        
        if (warehouseSummary.getOutwardStock() != null && !warehouseSummary.getOutwardStock().isEmpty()) {
            System.out.println("Outward Stock:");
            warehouseSummary.getOutwardStock().forEach((product, quantity) -> 
                System.out.println("  " + product + ": " + quantity));
        }
        
        if (warehouseSummary.getAvailableStock() != null && !warehouseSummary.getAvailableStock().isEmpty()) {
            System.out.println("Available Stock:");
            warehouseSummary.getAvailableStock().forEach((product, quantity) -> 
                System.out.println("  " + product + ": " + quantity));
        }
        
        if (warehouseSummary.getOrderTypes() != null && !warehouseSummary.getOrderTypes().isEmpty()) {
            System.out.println("Order Types:");
            warehouseSummary.getOrderTypes().forEach((type, count) -> 
                System.out.println("  " + type + ": " + count));
        }
        
        if (warehouseSummary.getProductSummary() != null && !warehouseSummary.getProductSummary().isEmpty()) {
            System.out.println("Product Summary:");
            warehouseSummary.getProductSummary().forEach((product, quantity) -> 
                System.out.println("  " + product + ": " + quantity));
        }
        
        System.out.println("---");
    }
    
    private void viewOrdersByWarehouse() {
        System.out.println("\n=== Orders by Warehouse ===");
        List<String> warehouses = controller.getAllWarehouses();
        
        if (warehouses.isEmpty()) {
            System.out.println("No warehouses available.");
            return;
        }
        
        System.out.println("Available warehouses:");
        for (int i = 0; i < warehouses.size(); i++) {
            System.out.println((i + 1) + ". " + warehouses.get(i));
        }
        
        System.out.print("Select warehouse number: ");
        try {
            int choice = Integer.parseInt(scanner.nextLine()) - 1;
            if (choice >= 0 && choice < warehouses.size()) {
                String warehouse = warehouses.get(choice);
                List<Order> orders = controller.getOrdersByWarehouse(warehouse);
                
                System.out.println("\nOrders in " + warehouse + ":");
                if (orders.isEmpty()) {
                    System.out.println("No orders found for this warehouse.");
                } else {
                    for (Order order : orders) {
                        printOrderSummary(order);
                        System.out.println("---");
                    }
                }
            } else {
                System.out.println("Invalid warehouse selection.");
            }
        } catch (NumberFormatException e) {
            System.out.println("Invalid input.");
        }
    }
    
    private void printOrderDetails(Order order) {
        System.out.println("Order ID: " + order.getId());
        System.out.println("Order Type: " + order.getOrderType());
        System.out.println("Sales Order: " + order.getSalesOrder());
        System.out.println("Deal ID: " + order.getDealId());
        System.out.println("School Name: " + order.getSchoolName());
        System.out.println("Product: " + order.getProduct());
        System.out.println("Model: " + order.getModel());
        System.out.println("Quantity: " + order.getQuantity());
        System.out.println("Warehouse: " + order.getWarehouse());
        System.out.println("Created At: " + order.getCreatedAt());
        
        if (order.getDeviceNumbers() != null && !order.getDeviceNumbers().isEmpty()) {
            System.out.println("Device Numbers:");
            for (String deviceNumber : order.getDeviceNumbers()) {
                System.out.println("  " + deviceNumber);
            }
        }
    }
    
    private void printOrderSummary(Order order) {
        System.out.println("Order ID: " + order.getId() + 
                          " | Type: " + order.getOrderType() + 
                          " | Sales Order: " + order.getSalesOrder() + 
                          " | Quantity: " + order.getQuantity() + 
                          " | Warehouse: " + order.getWarehouse());
    }
    
    private void printDeviceHeader() {
        System.out.printf("%-20s %-12s %-15s %-15s %-12s %-20s %-10s %-15s %-10s%n",
                         "Created At", "Order Type", "Order ID", "Sales Order", "Deal ID", 
                         "Device Number", "Quantity", "Product", "Warehouse");
        System.out.println("=".repeat(150));
    }
    
    private void printDeviceRow(Device device) {
        System.out.printf("%-20s %-12s %-15s %-15s %-12s %-20s %-10d %-15s %-10s%n",
                         device.getCreatedAt().toString().substring(0, 19),
                         device.getOrderType(),
                         device.getOrderId(),
                         device.getSalesOrder(),
                         device.getDealId(),
                         device.getDeviceNumber(),
                         device.getQuantity(),
                         device.getProduct(),
                         device.getWarehouse());
    }
}