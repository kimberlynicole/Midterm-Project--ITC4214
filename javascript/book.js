const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const totalNights = document.querySelector('#totalNights');
const totalPrice = document.querySelector('#totalPrice');
const form = document.querySelector('#bookingForm');
const errorMessage = document.querySelector('#errorMessage');
const successMessage = document.querySelector('#successMessage');
const guests = document.querySelector('#guests');
const fullName = document.querySelector('#fullName');

const pricePerNight = 350;

//  Disable past dates
const today = new Date().toISOString().split('T')[0];
checkin.min = today;
checkout.min = today;

//  When check-in changes
checkin.addEventListener('change', () => {

    checkout.min = checkin.value;

    if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
    }

    calculatePrice();
});

//  When checkout changes
checkout.addEventListener('change', calculatePrice);

//  Limit guests to maximum 10
guests.addEventListener('input', () => {

    errorMessage.classList.add('d-none');

    if (guests.value > 10) {
        errorMessage.textContent = "Maximum guest limit is 10 only.";
        errorMessage.classList.remove('d-none');
    }

    if (guests.value < 1) {
        errorMessage.textContent = "Minimum guest is 1.";
        errorMessage.classList.remove('d-none');
    }
});

fullName.addEventListener('input', () => {

    const namePattern = /^[a-zA-Z\s]+$/;

    if (!namePattern.test(fullName.value)) {
        errorMessage.textContent = "Full name should not contain numbers or special characters.";
        errorMessage.classList.remove('d-none');
    } else {
        errorMessage.classList.add('d-none');
    }

});

function calculatePrice(){

    if(!checkin.value || !checkout.value) return;

    const checkinDate = new Date(checkin.value);
    const checkoutDate = new Date(checkout.value);

    if(checkoutDate <= checkinDate){
        totalNights.textContent = 0;
        totalPrice.textContent = 0;
        return;
    }

    const diff = checkoutDate - checkinDate;
    const nights = diff / (1000 * 60 * 60 * 24);

    totalNights.textContent = nights;
    totalPrice.textContent = nights * pricePerNight;
}

//  Final Form Validation
form.addEventListener('submit', function(e){

    e.preventDefault();
    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');
    

    const checkinDate = new Date(checkin.value);
    const checkoutDate = new Date(checkout.value);
    const namePattern = /^[a-zA-Z\s]+$/;

    if(!checkin.value || !checkout.value || checkoutDate <= checkinDate){
        errorMessage.textContent = "Checkout must be after check-in.";
        errorMessage.classList.remove('d-none');
        return;
    }

    if (guests.value < 1 || guests.value > 10) {
        errorMessage.textContent = "Guests must be between 1 and 10 only.";
        errorMessage.classList.remove('d-none');
        return;
    }

    if (!namePattern.test(fullName.value)) {
        errorMessage.textContent = "Full name should not contain numbers or special characters.";
        errorMessage.classList.remove('d-none');
        return;
    }
    successMessage.classList.remove('d-none');
    form.reset();
    totalNights.textContent = 0;
    totalPrice.textContent = 0;
});