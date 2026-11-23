
const API_URL = "/api/v1/hall-bookings";

let allBookings = [];

// ======================================
// PAGE INITIALIZATION
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    const page = document.body.dataset.page;

    if (page === "home") {
        loadDashboard();
    }

    if (page === "bookings") {
        initializeBookingsPage();
    }

    if (page === "reports") {
        initializeReportsPage();
    }

    const eventDateInput = document.getElementById("eventDate");

    if (eventDateInput) {
        eventDateInput.min = getTomorrowDate();
    }
});

// ======================================
// GET TOMORROW'S DATE
// ======================================

function getTomorrowDate() {

    const date = new Date();
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ======================================
// ALERT MESSAGE
// ======================================

function showAlert(message, type = "success") {

    const alertBox = document.getElementById("alertMessage");

    if (!alertBox) return;

    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
}

// ======================================
// API REQUEST FUNCTION
// ======================================

async function apiRequest(url, options = {}) {

    let response;

    try {

        response = await fetch(url, options);

    } catch (error) {

        throw new Error(
            "Cannot connect to the server. Check whether Spring Boot is running."
        );
    }

    // DELETE returns HTTP 204 without a response body.

    if (response.status === 204) {

        if (!response.ok) {
            throw new Error("Request failed.");
        }

        return null;
    }

    const responseText = await response.text();

    let data = null;

    if (responseText) {

        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    if (!response.ok) {

        let message = `Request failed with status ${response.status}`;

        if (data && typeof data === "object") {

            message =
                data.message ||
                data.detail ||
                data.error ||
                message;

            if (data.errors && typeof data.errors === "object") {

                message = Object.values(data.errors).join(", ");

            } else if (data.fieldErrors && Array.isArray(data.fieldErrors)) {

                message = data.fieldErrors
                    .map(error => error.defaultMessage || error.message)
                    .join(", ");
            }

        } else if (typeof data === "string" && data.trim()) {

            message = data;

        }

        throw new Error(message);
    }

    return data;
}

// ======================================
// ESCAPE HTML
// ======================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (char) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];

    });
}

// ======================================
// NAME VALIDATION
// ======================================

function isValidName(value) {
    return /^[A-Za-z ]+$/.test(value.trim());
}

// ======================================
// DASHBOARD PAGE
// ======================================

async function loadDashboard() {

    try {

        const bookings = await apiRequest(API_URL);

        const records = Array.isArray(bookings) ? bookings : [];

        const totalElement = document.getElementById("totalBookings");

        const confirmedElement =
            document.getElementById("confirmedBookings");

        const pendingElement =
            document.getElementById("pendingBookings");

        if (totalElement) {
            totalElement.textContent = records.length;
        }

        if (confirmedElement) {

            confirmedElement.textContent = records.filter(
                booking =>
                    String(booking.bookingStatus).toUpperCase() === "CONFIRMED"
            ).length;

        }

        if (pendingElement) {

            pendingElement.textContent = records.filter(
                booking =>
                    String(booking.bookingStatus).toUpperCase() === "PENDING"
            ).length;

        }

    } catch (error) {

        showAlert(error.message, "danger");

    }
}

// ======================================
// BOOKINGS PAGE
// ======================================

function initializeBookingsPage() {

    loadBookings();

    document.getElementById("bookingForm")
        .addEventListener("submit", saveBooking);

    document.getElementById("resetButton")
        .addEventListener("click", resetBookingForm);

    document.getElementById("searchInput")
        .addEventListener("input", searchBookings);

    document.getElementById("bookingTableBody")
        .addEventListener("click", handleBookingAction);

}

// ======================================
// LOAD ALL BOOKINGS
// ======================================

async function loadBookings() {

    try {

        const data = await apiRequest(API_URL);

        allBookings = Array.isArray(data) ? data : [];

        displayBookings(allBookings);

    } catch (error) {

        showAlert(error.message, "danger");

        document.getElementById("bookingTableBody").innerHTML =
            `<tr>
                <td colspan="8" class="text-center">
                    Unable to load bookings.
                </td>
            </tr>`;

    }
}

// ======================================
// DISPLAY BOOKINGS
// ======================================

function displayBookings(bookings) {

    const tbody = document.getElementById("bookingTableBody");

    if (!bookings.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="8" class="text-center">
                    No bookings found.
                </td>
            </tr>`;

    } else {

        tbody.innerHTML = bookings.map(booking => `

            <tr>

                <td>${escapeHTML(booking.bookingID)}</td>

                <td>${escapeHTML(booking.customerName)}</td>

                <td>${escapeHTML(booking.hallName)}</td>

                <td>${escapeHTML(booking.eventDate)}</td>

                <td>${escapeHTML(booking.hallCapacity)}</td>

                <td>₹${escapeHTML(booking.rentAmount)}</td>

                <td>${escapeHTML(booking.bookingStatus)}</td>

                <td class="text-nowrap">

                    <button class="btn btn-sm btn-warning"
                            data-action="edit"
                            data-id="${escapeHTML(booking.bookingID)}">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-danger"
                            data-action="delete"
                            data-id="${escapeHTML(booking.bookingID)}">
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");

    }

    document.getElementById("recordCount").textContent =
        "Total records: " + bookings.length;

}

// ======================================
// SEARCH BOOKINGS
// ======================================

function searchBookings() {

    const searchValue = document.getElementById("searchInput")
        .value.toLowerCase().trim();

    const filtered = allBookings.filter(booking =>

        String(booking.customerName).toLowerCase().includes(searchValue) ||

        String(booking.hallName).toLowerCase().includes(searchValue)

    );

    displayBookings(filtered);

}

// ======================================
// ADD OR UPDATE BOOKING
// ======================================

async function saveBooking(event) {

    event.preventDefault();

    const bookingID = document.getElementById("bookingID").value;

    const customerName =
        document.getElementById("customerName").value.trim();

    const hallName =
        document.getElementById("hallName").value.trim();

    const eventDate =
        document.getElementById("eventDate").value;

    const capacity =
        Number(document.getElementById("hallCapacity").value);

    const rent =
        Number(document.getElementById("rentAmount").value);

    const bookingStatus =
        document.getElementById("bookingStatus").value;

    // CUSTOMER NAME VALIDATION

	// CUSTOMER NAME VALIDATION

	if (!isValidName(customerName)) {

	    showAlert(
	        "Customer Name: Only characters are allowed. Numbers and special characters are not allowed.",
	        "danger"
	    );

	    document.getElementById("customerName").focus();

	    return;
	}
	// HALL NAME VALIDATION

	if (!isValidName(hallName)) {

	    showAlert(
	        "Hall Name: Only characters are allowed. Numbers and special characters are not allowed.",
	        "danger"
	    );

	    document.getElementById("hallName").focus();

	    return;
	}

    // EVENT DATE VALIDATION

    if (!eventDate || eventDate < getTomorrowDate()) {

        showAlert(
            "Event date must be a future date.",
            "danger"
        );

        return;
    }

    // CAPACITY VALIDATION

    if (!Number.isInteger(capacity) || capacity <= 50) {

        showAlert(
            "Hall capacity must be greater than 50.",
            "danger"
        );

        return;
    }

    // RENT VALIDATION

    if (!Number.isFinite(rent) || rent <= 0) {

        showAlert(
            "Rent amount must be greater than zero.",
            "danger"
        );

        return;
    }

    // STATUS VALIDATION

    if (!["CONFIRMED", "PENDING", "CANCELLED"].includes(bookingStatus)) {

        showAlert(
            "Please select a valid booking status.",
            "danger"
        );

        return;
    }

    // BOOKING DATA

    const booking = {

        customerName: customerName,

        hallName: hallName,

        eventDate: eventDate,

        hallCapacity: capacity,

        rentAmount: rent,

        bookingStatus: bookingStatus

    };

    try {

        const url = bookingID
            ? `${API_URL}/${bookingID}`
            : API_URL;

        const method = bookingID ? "PUT" : "POST";

        const result = await apiRequest(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(booking)

        });

        showAlert(

            bookingID
                ? "Booking updated successfully. Booking ID: " + bookingID
                : "Booking added successfully. Booking ID: " +
                  (result?.bookingID ?? "Generated"),

            "success"

        );

        resetBookingForm();

        await loadBookings();

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// EDIT AND DELETE BUTTONS
// ======================================

async function handleBookingAction(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {

        await editBooking(id);

    }

    if (button.dataset.action === "delete") {

        await deleteBooking(id);

    }

}

// ======================================
// EDIT BOOKING
// ======================================

async function editBooking(id) {

    try {

        const booking = await apiRequest(`${API_URL}/${id}`);

        document.getElementById("bookingID").value =
            booking.bookingID;

        document.getElementById("customerName").value =
            booking.customerName;

        document.getElementById("hallName").value =
            booking.hallName;

        document.getElementById("eventDate").value =
            booking.eventDate;

        document.getElementById("hallCapacity").value =
            booking.hallCapacity;

        document.getElementById("rentAmount").value =
            booking.rentAmount;

        document.getElementById("bookingStatus").value =
            String(booking.bookingStatus).toUpperCase();

        document.getElementById("formTitle").textContent =
            "Update Booking";

        document.getElementById("saveButton").textContent =
            "Update Booking";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// DELETE BOOKING
// ======================================

async function deleteBooking(id) {

    const confirmed = window.confirm(
        "Are you sure you want to delete booking ID " + id + "?"
    );

    if (!confirmed) return;

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showAlert(
            "Booking deleted successfully.",
            "success"
        );

        await loadBookings();

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// RESET BOOKING FORM
// ======================================

function resetBookingForm() {

    document.getElementById("bookingForm").reset();

    document.getElementById("bookingID").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Booking";

    document.getElementById("saveButton").textContent =
        "Add Booking";

    document.getElementById("eventDate").min =
        getTomorrowDate();

}

// ======================================
// REPORTS PAGE
// ======================================

function initializeReportsPage() {

    document.getElementById("dateReportButton")
        .addEventListener("click", generateDateReport);

    document.getElementById("capacityReportButton")
        .addEventListener("click", generateCapacityReport);

    document.getElementById("statusReportButton")
        .addEventListener("click", generateStatusReport);

    document.getElementById("showAllButton")
        .addEventListener("click", showAllReportBookings);

}

// ======================================
// DISPLAY REPORT RESULTS
// ======================================

function displayReport(bookings, title) {

    const tbody = document.getElementById("reportTableBody");

    const records = Array.isArray(bookings) ? bookings : [];

    document.getElementById("reportTitle").textContent = title;

    if (!records.length) {

        tbody.innerHTML =
            `<tr>
                <td colspan="7" class="text-center">
                    No matching bookings found.
                </td>
            </tr>`;

    } else {

        tbody.innerHTML = records.map(booking => `

            <tr>

                <td>${escapeHTML(booking.bookingID)}</td>

                <td>${escapeHTML(booking.customerName)}</td>

                <td>${escapeHTML(booking.hallName)}</td>

                <td>${escapeHTML(booking.eventDate)}</td>

                <td>${escapeHTML(booking.hallCapacity)}</td>

                <td>₹${escapeHTML(booking.rentAmount)}</td>

                <td>${escapeHTML(booking.bookingStatus)}</td>

            </tr>

        `).join("");

    }

    document.getElementById("reportCount").textContent =
        "Total records: " + records.length;

}

// ======================================
// DATE RANGE REPORT
// ======================================

async function generateDateReport() {

    const start = document.getElementById("startDate").value;

    const end = document.getElementById("endDate").value;

    if (!start || !end) {

        showAlert(
            "Please select both start date and end date.",
            "warning"
        );

        return;
    }

    if (start > end) {

        showAlert(
            "Start date cannot be after end date.",
            "warning"
        );

        return;
    }

    const params = new URLSearchParams({
        start: start,
        end: end
    });

    try {

        const data = await apiRequest(
            `${API_URL}/reports/dates?${params.toString()}`
        );

        displayReport(data, "Date Range Report");

        showAlert(
            "Date report generated successfully.",
            "success"
        );

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// CAPACITY REPORT
// ======================================

async function generateCapacityReport() {

    const capacityValue =
        document.getElementById("minCapacity").value;

    const capacity = Number(capacityValue);

    if (
        !capacityValue ||
        !Number.isInteger(capacity) ||
        capacity <= 50
    ) {

        showAlert(
            "Enter a minimum capacity greater than 50.",
            "warning"
        );

        return;
    }

    const params = new URLSearchParams({
        minCapacity: capacity
    });

    try {

        const data = await apiRequest(
            `${API_URL}/reports/capacity?${params.toString()}`
        );

        displayReport(data, "Minimum Capacity Report");

        showAlert(
            "Capacity report generated successfully.",
            "success"
        );

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// STATUS REPORT
// ======================================

async function generateStatusReport() {

    const status =
        document.getElementById("reportStatus").value;

    if (!["CONFIRMED", "PENDING", "CANCELLED"].includes(status)) {

        showAlert(
            "Please select a valid booking status.",
            "warning"
        );

        return;
    }

    const params = new URLSearchParams({
        status: status
    });

    try {

        const data = await apiRequest(
            `${API_URL}/reports/status?${params.toString()}`
        );

        displayReport(data, "Booking Status Report");

        showAlert(
            "Status report generated successfully.",
            "success"
        );

    } catch (error) {

        showAlert(error.message, "danger");

    }

}

// ======================================
// SHOW ALL BOOKINGS IN REPORTS
// ======================================

async function showAllReportBookings() {

    try {

        const data = await apiRequest(API_URL);

        displayReport(data, "All Booking Records");

        showAlert(
            "All bookings loaded successfully.",
            "success"
        );

    } catch (error) {

        showAlert(error.message, "danger");

    }

}
