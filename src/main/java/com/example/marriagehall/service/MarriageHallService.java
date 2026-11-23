
package com.example.marriagehall.service;

import java.time.LocalDate;
import java.util.List;

import com.example.marriagehall.dto.HallBookingDTO;

public interface MarriageHallService {

    HallBookingDTO addBooking(HallBookingDTO dto);

    List<HallBookingDTO> getAllBookings();

    HallBookingDTO getBookingById(Integer id);

    HallBookingDTO updateBooking(Integer id, HallBookingDTO dto);

    void cancelBooking(Integer id);

    List<HallBookingDTO> getBookingsByDates(
            LocalDate start, LocalDate end);

    List<HallBookingDTO> getBookingsByCapacity(
            Integer minCapacity);

    List<HallBookingDTO> getBookingsByStatus(String status);
}