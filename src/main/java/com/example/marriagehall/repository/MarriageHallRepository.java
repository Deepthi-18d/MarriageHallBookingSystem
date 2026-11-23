
package com.example.marriagehall.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.marriagehall.entity.MarriageHallBooking;

@Repository
public interface MarriageHallRepository
        extends JpaRepository<MarriageHallBooking, Integer> {

    // Find bookings between two dates
    List<MarriageHallBooking> findByEventDateBetween(
            LocalDate start, LocalDate end);

    // Find halls with minimum capacity
    List<MarriageHallBooking> findByHallCapacityGreaterThanEqual(
            Integer capacity);

    // Find bookings by status
    List<MarriageHallBooking> findByBookingStatusIgnoreCase(
            String status);

    // Check duplicate hall booking
    boolean existsByHallNameIgnoreCaseAndEventDate(
            String hallName, LocalDate eventDate);

    // Check duplicate booking while updating
    boolean existsByHallNameIgnoreCaseAndEventDateAndBookingIDNot(
            String hallName, LocalDate eventDate, Integer bookingID);
}
