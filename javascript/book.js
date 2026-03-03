// Select  DOM elements from the page 
const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const totalNights = document.querySelector('#totalNights');
const totalPrice = document.querySelector('#totalPrice');
const form = document.querySelector('#bookingForm');
const errorMessage = document.querySelector('#errorMessage');
const successMessage = document.querySelector('#successMessage');
const guests = document.querySelector('#guests');
const fullName = document.querySelector('#fullName');

const PRICE_PER_NIGHT = 350;

// Set minimum dates 
const today = new Date().toISOString().split('T')[0];
checkin.min = today;
checkout.min = today;


// Check-in change
checkin.addEventListener('change', handleCheckinChange);
function handleCheckinChange() {
    checkout.min = checkin.value;
    // Reset checkout if it is before or equal to the new check-in
    if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
    }
    updatePrice();      // Recalculate price whenever check-in changes
}

// Checkout change
checkout.addEventListener('change',  updatePrice);

function updatePrice() {
    if (!checkin.value || !checkout.value) return;

    const checkinDate = new Date(checkin.value);
    const checkoutDate = new Date(checkout.value);

    // If checkout is before or equal to check-in, reset values
    if (checkoutDate <= checkinDate) {
        totalNights.textContent = 0;
        totalPrice.textContent = 0;
        return;
    }

    // Calculate the number of nights
    const diffTime = checkoutDate - checkinDate;
    const nights = diffTime / (1000 * 60 * 60 * 24);

    totalNights.textContent = nights;                        // Display number of nights
    totalPrice.textContent = nights * PRICE_PER_NIGHT;      // Display total price
}

// Guests input
guests.addEventListener('input', handleGuestsInput);
function handleGuestsInput() {
    hideMessages();
    if (guests.value > 10) {
        showError("Maximum guest limit is 10 only.");
    } else if (guests.value < 1) {
        showError("Minimum guest is 1.");
    }
}

// Full name input
fullName.addEventListener('input', validateFullNameInput);
function validateFullNameInput() {
    const name = fullName.value;
    let isValid = true;
    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (!((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || char === ' ')) {
            isValid = false;
            break;
        }
    }
    if (!isValid) {
        showError("Full name should not contain numbers or special characters.");
    } else {
        errorMessage.classList.add('d-none');
    }
}

// Form submission
form.addEventListener('submit', handleFormSubmit);
function handleFormSubmit(event) {
    event.preventDefault();
    hideMessages();

    // Validate dates
    if (!checkin.value || !checkout.value || new Date(checkout.value) <= new Date(checkin.value)) {
        showError("Checkout must be after check-in.");
        return;
    }

    // Validate guests
    if (guests.value < 1 || guests.value > 10) {
        showError("Guests must be between 1 and 10 only.");
        return;
    }

    // Validate full name
    const name = fullName.value;
    let isValidName = true;
    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        if (!((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || char === ' ')) {
            isValidName = false;
            break;
        }
    }
    if (!isValidName) {
        showError("Full name should not contain numbers or special characters.");
        return;
    }

    // Success
    successMessage.classList.remove('d-none');
    form.reset();
    totalNights.textContent = 0;
    totalPrice.textContent = 0;
}

function showError(message) {
    errorMessage.textContent = message;             // hides the error message
    errorMessage.classList.remove('d-none');        // shows the error message
}

function hideMessages() {
    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');
}
