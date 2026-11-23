
package com.example.marriagehall.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.*;

public class HallBookingDTO {

    private Integer bookingID;

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name cannot exceed 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z ]+$",
        message = "Customer name must contain only characters, not numbers or special symbols"
    )
    private String customerName;

    @NotBlank(message = "Hall name is required")
    @Size(max = 100, message = "Hall name cannot exceed 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z ]+$",
        message = "Hall name must contain only characters, not numbers or special symbols"
    )
    private String hallName;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;

    @NotNull(message = "Hall capacity is required")
    @Min(value = 51, message = "Hall capacity must be greater than 50")
    private Integer hallCapacity;

    @NotNull(message = "Rent amount is required")
    @DecimalMin(
        value = "0.00",
        inclusive = false,
        message = "Rent amount must be greater than zero"
    )
    @Digits(
        integer = 8,
        fraction = 2,
        message = "Rent amount must have maximum 8 integer digits and 2 decimal places"
    )
    private BigDecimal rentAmount;

    @NotBlank(message = "Booking status is required")
    @Pattern(
        regexp = "CONFIRMED|PENDING|CANCELLED",
        message = "Status must be CONFIRMED, PENDING or CANCELLED"
    )
    private String bookingStatus;

    public Integer getBookingID() {
        return bookingID;
    }

    public void setBookingID(Integer bookingID) {
        this.bookingID = bookingID;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getHallName() {
        return hallName;
    }

    public void setHallName(String hallName) {
        this.hallName = hallName;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public Integer getHallCapacity() {
        return hallCapacity;
    }

    public void setHallCapacity(Integer hallCapacity) {
        this.hallCapacity = hallCapacity;
    }

    public BigDecimal getRentAmount() {
        return rentAmount;
    }

    public void setRentAmount(BigDecimal rentAmount) {
        this.rentAmount = rentAmount;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }
}
