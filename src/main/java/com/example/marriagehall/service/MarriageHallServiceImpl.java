
package com.example.marriagehall.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.marriagehall.dto.HallBookingDTO;
import com.example.marriagehall.entity.MarriageHallBooking;
import com.example.marriagehall.exception.BookingConflictException;
import com.example.marriagehall.exception.ResourceNotFoundException;
import com.example.marriagehall.repository.MarriageHallRepository;
import com.example.marriagehall.service.MarriageHallService;

@Service
@Transactional
public class MarriageHallServiceImpl implements MarriageHallService {

    private final MarriageHallRepository repository;

    public MarriageHallServiceImpl(MarriageHallRepository repository) {
        this.repository = repository;
    }

    @Override
    public HallBookingDTO addBooking(HallBookingDTO dto) {

        validateBooking(dto);

        if (repository.existsByHallNameIgnoreCaseAndEventDate(
                dto.getHallName().trim(), dto.getEventDate())) {

            throw new BookingConflictException(
                    "Hall already booked for this date");
        }

        MarriageHallBooking booking = new MarriageHallBooking();

        copyToEntity(dto, booking);

        return toDTO(repository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallBookingDTO> getAllBookings() {

        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HallBookingDTO getBookingById(Integer id) {

        return toDTO(findBooking(id));
    }

    @Override
    public HallBookingDTO updateBooking(
            Integer id, HallBookingDTO dto) {

        MarriageHallBooking booking = findBooking(id);

        validateBooking(dto);

        if (repository.existsByHallNameIgnoreCaseAndEventDateAndBookingIDNot(
                dto.getHallName().trim(), dto.getEventDate(), id)) {

            throw new BookingConflictException(
                    "Hall already booked for this date");
        }

        copyToEntity(dto, booking);

        return toDTO(repository.save(booking));
    }

    @Override
    public void cancelBooking(Integer id) {

        MarriageHallBooking booking = findBooking(id);

        repository.delete(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallBookingDTO> getBookingsByDates(
            LocalDate start, LocalDate end) {

        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException(
                    "Invalid start date or end date");
        }

        return repository.findByEventDateBetween(start, end)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallBookingDTO> getBookingsByCapacity(
            Integer minCapacity) {

        if (minCapacity == null || minCapacity <= 50) {
            throw new IllegalArgumentException(
                    "Capacity must be greater than 50");
        }

        return repository.findByHallCapacityGreaterThanEqual(minCapacity)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallBookingDTO> getBookingsByStatus(String status) {

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Booking status is required");
        }

        return repository.findByBookingStatusIgnoreCase(status.trim())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private MarriageHallBooking findBooking(Integer id) {

        return repository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                        "Booking not found with ID: " + id));
    }

    private void validateBooking(HallBookingDTO dto) {

        if (dto.getEventDate() == null ||
                !dto.getEventDate().isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Event date must be in the future");
        }

        if (dto.getHallCapacity() == null ||
                dto.getHallCapacity() <= 50) {

            throw new IllegalArgumentException(
                    "Hall capacity must be greater than 50");
        }

        if (dto.getRentAmount() == null ||
                dto.getRentAmount().signum() <= 0) {

            throw new IllegalArgumentException(
                    "Rent amount must be greater than zero");
        }
    }

    private void copyToEntity(
            HallBookingDTO dto, MarriageHallBooking booking) {

        booking.setCustomerName(dto.getCustomerName().trim());
        booking.setHallName(dto.getHallName().trim());
        booking.setEventDate(dto.getEventDate());
        booking.setHallCapacity(dto.getHallCapacity());
        booking.setRentAmount(dto.getRentAmount());
        booking.setBookingStatus(dto.getBookingStatus().trim());
    }

    private HallBookingDTO toDTO(MarriageHallBooking booking) {

        HallBookingDTO dto = new HallBookingDTO();

        dto.setBookingID(booking.getBookingID());
        dto.setCustomerName(booking.getCustomerName());
        dto.setHallName(booking.getHallName());
        dto.setEventDate(booking.getEventDate());
        dto.setHallCapacity(booking.getHallCapacity());
        dto.setRentAmount(booking.getRentAmount());
        dto.setBookingStatus(booking.getBookingStatus());

        return dto;
    }
}