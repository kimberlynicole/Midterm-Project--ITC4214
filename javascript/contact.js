// Select form and modal elements from the DOM
const form = document.querySelector('#contactForm');
const modalElement = document.querySelector('#confirmationModal');
const modalBody = document.querySelector('#modalBody');

// Function to check if a string contains ONLY letters and spaces
function isLettersAndSpacesOnly(text) {
    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // If the character is NOT:
        // - an uppercase letter (A–Z)
        // - a lowercase letter (a–z)
        // - or a space
        // then return false (invalid input)
        if (
            !(char >= 'A' && char <= 'Z') &&
            !(char >= 'a' && char <= 'z') &&
            char !== ' '
        ) {
            return false;
        }
    }

    // If all characters are valid, return true
    return true;
}

// Add submit event listener to the form
form.addEventListener('submit', function (event) {

    // Prevent the default form submission
    event.preventDefault();

    // Check built-in HTML5 validation first
    if (!form.checkValidity()) {
        event.stopPropagation(); // Stop event bubbling
        form.classList.add('was-validated'); // Add Bootstrap validation style
        return; // Stop further execution
    }

    // Get and trim input values
    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const subject = document.querySelector('#subject').value.trim();
    const message = document.querySelector('#message').value.trim();

    // Custom validation: Name should not contain numbers or special characters
    if (!isLettersAndSpacesOnly(name)) {
        alert("Name should not contain numbers or special characters.");
        return;
    }

    // Custom validation: Subject should not contain numbers or special characters
    if (!isLettersAndSpacesOnly(subject)) {
        alert("Subject should not contain numbers or special characters.");
        return;
    }

    // Insert form data into the modal body
    modalBody.innerHTML = `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b> ${message}</p>
    `;

    // Create and show Bootstrap modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Reset form fields after submission
    form.reset();
    form.classList.remove('was-validated');
});