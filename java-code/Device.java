package com.warehouse.model;

import java.time.LocalDateTime;

public class Device {
    private String deviceNumber;
    private String orderId;
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

    // Constructors
    public Device() {
        this.createdAt = LocalDateTime.now();
    }

    public Device(String deviceNumber, Order order) {
        this();
        this.deviceNumber = deviceNumber;
        this.orderId = order.getId();
        this.orderType = order.getOrderType();
        this.salesOrder = order.getSalesOrder();
        this.dealId = order.getDealId();
        this.nucleusId = order.getNucleusId();
        this.schoolName = order.getSchoolName();
        this.product = order.getProduct();
        this.model = order.getModel();
        this.quantity = order.getQuantity();
        this.sdCardSize = order.getSdCardSize();
        this.profileId = order.getProfileId();
        this.location = order.getLocation();
        this.warehouse = order.getWarehouse();
        this.createdAt = order.getCreatedAt();
    }

    // Getters and Setters
    public String getDeviceNumber() { return deviceNumber; }
    public void setDeviceNumber(String deviceNumber) { this.deviceNumber = deviceNumber; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

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
}