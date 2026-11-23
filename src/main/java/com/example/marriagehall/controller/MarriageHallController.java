
package com.example.marriagehall.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.marriagehall.dto.HallBookingDTO;
import com.example.marriagehall.service.MarriageHallService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/hall-bookings")
public class MarriageHallController {

    private final MarriageHallService service;

    public MarriageHallController(MarriageHallService service) {
        this.service = service;
    }

    // Add booking
    @PostMapping
    public ResponseEntity<HallBookingDTO> addBooking(
            @Valid @RequestBody HallBookingDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.addBooking(dto));
    }

    // Display all bookings
    @GetMapping
    public ResponseEntity<List<HallBookingDTO>> displayBookings() {

        return ResponseEntity.ok(service.getAllBookings());
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<HallBookingDTO> getBooking(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.getBookingById(id));
    }

    // Update booking
    @PutMapping("/{id}")
    public ResponseEntity<HallBookingDTO> updateBooking(
            @PathVariable Integer id,
            @Valid @RequestBody HallBookingDTO dto) {

        return ResponseEntity.ok(service.updateBooking(id, dto));
    }

    // Cancel booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Integer id) {

        service.cancelBooking(id);

        return ResponseEntity.noContent().build();
    }

    // Report by dates
    @GetMapping("/reports/dates")
    public ResponseEntity<List<HallBookingDTO>> reportByDates(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate start,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate end) {

        return ResponseEntity.ok(
                service.getBookingsByDates(start, end));
    }

    // Report by capacity
    @GetMapping("/reports/capacity")
    public ResponseEntity<List<HallBookingDTO>> reportByCapacity(
            @RequestParam Integer minCapacity) {

        return ResponseEntity.ok(
                service.getBookingsByCapacity(minCapacity));
    }

    // Report by status
    @GetMapping("/reports/status")
    public ResponseEntity<List<HallBookingDTO>> reportByStatus(
            @RequestParam String status) {

        return ResponseEntity.ok(
                service.getBookingsByStatus(status));
    }
}