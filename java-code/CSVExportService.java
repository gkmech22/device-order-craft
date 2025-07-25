package com.warehouse.service;

import com.warehouse.model.Device;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class CSVExportService {
    
    private static final String CSV_SEPARATOR = ",";
    private static final String CSV_HEADER = "Created At,Order Type,Order ID,Sales Order,Deal ID,Nucleus ID,School Name,Product,Model,Quantity,Device Number,SD Card Size,Profile ID,Location,Warehouse";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Export devices to CSV string
     */
    public String exportDevicesToCSV(List<Device> devices) {
        StringWriter stringWriter = new StringWriter();
        
        try {
            // Write header
            stringWriter.append(CSV_HEADER).append("\n");
            
            // Write data rows
            for (Device device : devices) {
                stringWriter.append(buildCSVRow(device)).append("\n");
            }
            
        } catch (IOException e) {
            throw new RuntimeException("Error generating CSV", e);
        }
        
        return stringWriter.toString();
    }

    /**
     * Export devices to CSV file
     */
    public void exportDevicesToCSVFile(List<Device> devices, String filePath) throws IOException {
        try (FileWriter writer = new FileWriter(filePath)) {
            // Write header
            writer.append(CSV_HEADER).append("\n");
            
            // Write data rows
            for (Device device : devices) {
                writer.append(buildCSVRow(device)).append("\n");
            }
        }
    }

    /**
     * Build a CSV row for a device
     */
    private String buildCSVRow(Device device) {
        StringBuilder row = new StringBuilder();
        
        // Created At
        row.append(escapeCSVField(device.getCreatedAt().format(DATE_FORMATTER))).append(CSV_SEPARATOR);
        
        // Order Type
        row.append(escapeCSVField(device.getOrderType())).append(CSV_SEPARATOR);
        
        // Order ID
        row.append(escapeCSVField(device.getOrderId())).append(CSV_SEPARATOR);
        
        // Sales Order
        row.append(escapeCSVField(device.getSalesOrder())).append(CSV_SEPARATOR);
        
        // Deal ID
        row.append(escapeCSVField(device.getDealId())).append(CSV_SEPARATOR);
        
        // Nucleus ID
        row.append(escapeCSVField(device.getNucleusId())).append(CSV_SEPARATOR);
        
        // School Name
        row.append(escapeCSVField(device.getSchoolName())).append(CSV_SEPARATOR);
        
        // Product
        row.append(escapeCSVField(device.getProduct())).append(CSV_SEPARATOR);
        
        // Model
        row.append(escapeCSVField(device.getModel())).append(CSV_SEPARATOR);
        
        // Quantity
        row.append(device.getQuantity()).append(CSV_SEPARATOR);
        
        // Device Number
        row.append(escapeCSVField(device.getDeviceNumber())).append(CSV_SEPARATOR);
        
        // SD Card Size
        row.append(escapeCSVField(device.getSdCardSize())).append(CSV_SEPARATOR);
        
        // Profile ID
        row.append(escapeCSVField(device.getProfileId())).append(CSV_SEPARATOR);
        
        // Location
        row.append(escapeCSVField(device.getLocation())).append(CSV_SEPARATOR);
        
        // Warehouse (last field, no separator)
        row.append(escapeCSVField(device.getWarehouse()));
        
        return row.toString();
    }

    /**
     * Escape CSV field to handle commas, quotes, and newlines
     */
    private String escapeCSVField(String field) {
        if (field == null) {
            return "";
        }
        
        // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
        if (field.contains(",") || field.contains("\"") || field.contains("\n") || field.contains("\r")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        
        return field;
    }

    /**
     * Generate filename with timestamp
     */
    public String generateCSVFileName() {
        return "devices_export_" + 
               DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").format(java.time.LocalDateTime.now()) + 
               ".csv";
    }
}