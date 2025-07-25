package com.warehouse.model;

import java.time.LocalDateTime;
import java.util.List;

public class Order {
    private String id;
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
    private LocalDateTime createdAt;
    private List<String> deviceNumbers;

    // Constructors
    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    public Order(String orderType, String salesOrder, String dealId, String nucleusId, 
                 String schoolName, String product, String model, int quantity, 
                 String sdCardSize, String profileId, String location, String warehouse) {
        this();
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
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getDeviceNumbers() { return deviceNumbers; }
    public void setDeviceNumbers(List<String> deviceNumbers) { this.deviceNumbers = deviceNumbers; }
}