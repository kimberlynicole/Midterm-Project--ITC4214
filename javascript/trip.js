// ==========================================================
// INITIAL DATA: Load tasks and day dates from localStorage
// If nothing exists, use empty array/object
// ==========================================================
let tasks = JSON.parse(localStorage.getItem("tripTasks")) || [];
let dayDates = JSON.parse(localStorage.getItem("dayDates")) || {};

// ===============================
// DOM ELEMENTS
// ===============================
const addBtn = document.querySelector("#addBtn");
const dateInput = document.querySelector("#tripDate");
const daySelect = document.querySelector("#daySelect");
const statusFilter = document.querySelector("#statusFilter");
const daysContainer = document.querySelector("#daysContainer");

// ==========================================
// DATE PICKER: Prevent selecting past dates
// ==========================================
let today = new Date().toISOString().split("T")[0];
dateInput.min = today;

// ============================================================
// ERROR DISPLAY: Shows error messages inside #errorMsg element
// ============================================================
function showError(message) {
    document.querySelector("#errorMsg").textContent = message;
}

// =======================================
// EVENT: When user changes selected Day
// ========================================
daySelect.addEventListener("change", handleDaySelectChange);

 // Update minimum date allowed based on previous day
function handleDaySelectChange() {
    let selectedDay = daySelect.value;      // Get which day was selected
    updateMinDate(selectedDay);             // Update calendar to only allow valid dates

    // If this day already has a saved date -> user cannot chnage the date input
    if (dayDates[selectedDay]) {
        dateInput.value = dayDates[selectedDay];
        dateInput.readOnly = true;

    // If the day has no date yet, allow the user to select a new date
    } else {
        dateInput.value = "";
        dateInput.readOnly = false;
    }
}

// ================================================================
// FUNCTION: Make sure trip days are consecutive.
// ================================================================
function updateMinDate(day) {
    let dayNumber = parseInt(day.split(" ")[1]);
    let minDate = new Date();       // Default minimum date is today

    if (dayNumber > 1) {
        let prevDay = "Day " + (dayNumber - 1);
        // If previous day has a date, next day must be at least day after
        if (dayDates[prevDay]) {
            minDate = new Date(dayDates[prevDay]);
            minDate.setDate(minDate.getDate() + 1);
        }
    }
    // Set the minimum date in the input
    dateInput.min = minDate.toISOString().split("T")[0];
}

// =====================================================
//                      ADD TASK
// =====================================================

addBtn.addEventListener("click", handleAddTaskClick);

function handleAddTaskClick() {

    showError("");

    let day = daySelect.value;      // Which day (Day 1, Day 2, etc.)
    let date = dateInput.value;     // Selected date

    //  Get all the values from the form
    let name = document.querySelector("#activityName").value.trim();
    let location = document.querySelector("#location").value.trim();
    let description = document.querySelector("#description").value.trim();

    //  Check if any required field is empty
    if (!date || !name || !location || !description) {
        showError("Fill all required fields.");
        return;
    }

    // Convert the selected date string (from input) into a Date object
    // Allows to do date calculations like checking consecutive days
    let selectedDate = new Date(date);

    // Extract the day number from the selected day string.
    // It helps to know which day in the trip sequence we are working with
    let dayNumber = parseInt(day.split(" ")[1]);

     // Check if date is unique
    if (!validateUniqueDate(day, date)) return;

    // Check if day order is correct
    if (!validateConsecutiveDay(day, dayNumber, selectedDate)) return;

    setDayDate(day, date);
    tasks.push({
        day: day,
        name: name,
        location: location,
        description: description,
        status: "pending"
    });

    saveData();
}


// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

// Ensure each day has a unique date. No day should have the same date
function validateUniqueDate(day, date) {
    for (let existingDay in dayDates) {
        if (dayDates[existingDay] === date && existingDay !== day) {
            showError("Each day must have a unique date.");
            return false;
        }
    }

    return true;
}

// Ensure days are added consecutively (Day 2 must be after Day 1)
function validateConsecutiveDay(day, dayNumber, selectedDate) {
    // Day 1 can be any date (no previous day to check)
    if (dayNumber <= 1) return true;
    let prevDay = "Day " + (dayNumber - 1);

    // If previous day doesn’t exist, show error
    if (!dayDates[prevDay]) {
        showError("You must complete " + prevDay + " first.");
        return false;
    }

    // Check that the selected date is exactly one day after previous day
    let prevDate = new Date(dayDates[prevDay]);
    prevDate.setDate(prevDate.getDate() + 1);

    if (selectedDate.getTime() !== prevDate.getTime()) {
        showError(day + " must be exactly the next day after " + prevDay);
        return false;
    }

    return true;
}

// =====================================================
// DATA STORAGE
// =====================================================

// Save the date for a day only if it doesn’t exist yet
function setDayDate(day, date) {
    if (!dayDates[day]) {
        dayDates[day] = date;
        localStorage.setItem("dayDates", JSON.stringify(dayDates));
    }
}

function saveData() {
    localStorage.setItem("tripTasks", JSON.stringify(tasks));
    renderTasks();            
    tripPreview("#tripPreviewContainer");
    updateSummary(); 
}


// ===============================
// FUNCTION: Render tasks 
// ===============================

// Render all days and their tasks
function renderTasks() {
    daysContainer.innerHTML = "";
    let filterStatus = statusFilter.value;
    let orderedDays = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];
    // Go through each day and render its tasks
    orderedDays.forEach(day => renderDay(day, filterStatus));
}

// Render tasks for a single day
function renderDay(day, filterStatus) {
    // Get tasks that match this day and status filter
    let dayTasks = tasks.filter(task => task.day === day && (filterStatus === "all" || task.status === filterStatus));
    if (dayTasks.length === 0) return;
    
    // Create a card for the day and append it
    let dayCard = createDayCard(day, dayTasks);
    daysContainer.appendChild(dayCard);
}


//Creates a card (box) for a single day with all its tasks
function createDayCard(day, dayTasks) {
    let col = document.createElement("div");
    col.className = "col-md-12 mb-3";           //Bootstrap classes for spacing

    let card = document.createElement("div");
    card.className = "card p-4";                // Bootstrap card with padding

   // Show day name and formatted date
    let formattedDate = dayDates[day] ? formatDate(dayDates[day]) : "";
    card.innerHTML = `<h5>${day} - ${formattedDate}</h5>`;

    /// Create table with tasks for this day
    let table = createTaskTable(day, dayTasks);
    card.appendChild(table);
    col.appendChild(card);
    return col;
}

// Format a date string into a readable format like DATE-DAY-YEAR
function formatDate(dateStr) {
    let d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}


// FUNCTION: Create the table containing all tasks for a day
function createTaskTable(day, dayTasks) {
    let table = document.createElement("table");
    table.className = "table table-bordered";
    //Table header
    table.innerHTML = `
        <thead class="table-warning">
            <tr>
                <th>✔️</th>
                <th class="text-center">Activity</th>
                <th class="text-center">Location</th>
                <th class="text-center" style="width:40%">Description</th>
                <th class="text-center">Actions</th>
            </tr>
        </thead>
    `;

    // Add each task as a row in the table
    let tbody = document.createElement("tbody");
    dayTasks.forEach(task => tbody.appendChild(createTaskRow(task, day)));
    table.appendChild(tbody);
    return table;
}


//Creates a single row in the task table. This is where we add all the buttons and checkboxes.
function createTaskRow(task, day) {
    let row = document.createElement("tr");

     // If task is completed, add a CSS style to it (CSS/trip.css)
    if (task.status === "completed")
        row.classList.add("completed");

    // Add task details and action buttons
    row.innerHTML = `
        <td><input type="checkbox" class="checkTask"></td>
        <td>${task.name}</td>
        <td>${task.location}</td>
        <td>${task.description}</td>
        <td>
            <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-sm btn-outline-warning editBtn">
                    <i class="bi bi-pencil"></i> Edit
                </button>

                <button class="btn btn-sm btn-outline-danger deleteBtn">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </td>
    `;

    // Select all interactive elements inside the row.
    let actions = row.querySelectorAll(".checkTask, .deleteBtn, .editBtn");
    for (let i = 0; i < actions.length; i++) {
        let ac = actions[i];

        // Checkbox
        if (ac.classList.contains("checkTask")) {
            ac.checked = task.status === "completed";
            // Attach the task object to the checkbox for easy reference later
            ac._task = task;
            ac.addEventListener("change", handleCheckboxChange);    // When the checkbox changes (checked/unchecked), run this function
        }

        // Delete button
        if (ac.classList.contains("deleteBtn")) {
            // Store important references directly on the button:
            ac._row = row;
            ac._task = task;
            ac._day = day;
            ac.addEventListener("click", handleDeleteClick);
        }

        //Edit button
        if (ac.classList.contains("editBtn")) {
            // Store references to know which row is being edited and which task object should be updated
            ac._row = row;
            ac._task = task;
            ac.addEventListener("click", handleEditClick);
        }
    }

    return row;
}

// =====================================================
// Checkbox Handler: checks/unchecks a task's checkbox
// =====================================================
function handleCheckboxChange() {
    let checkbox = this;
    let task = checkbox._task;
    // Update task status based on checkbox
    task.status = checkbox.checked ? "completed" : "pending";
    saveData();
    
}

// ===============================================================
//  Delete Handler: when user clicks the delete button on a task
// ===============================================================
function handleDeleteClick() {
    let row = this._row;      // Get the row stored in the button
    let task = this._task;   // Get the task stored in the button
    let day = this._day;    // Get the day stored in the button

    let dayNumber = parseInt(day.split(" ")[1]);
    let tasksForDay = tasks.filter(t => t.day === day);

    // Find the card for this day
    let dayCard = row.closest(".card");

    // Create an error container inside the card if it doesn't exist
    let dayError = dayCard.querySelector(".day-error");
    if (!dayError) {
        dayError = document.createElement("div");
        dayError.className = "day-error text-danger mb-2";
        dayCard.append(dayError);
    }

    dayError.textContent = "";

    // Prevent deleting the last task of a day if later days exist
    if (tasksForDay.length === 1) {
        for (let i = dayNumber + 1; i <= 7; i++) {
            if (dayDates["Day " + i]) {
                dayError.textContent =
                    "You cannot delete this day because later days exist.";
                return;
            }
        }
        // Delete the day date if the validation allows it 
        delete dayDates[day];
        localStorage.setItem("dayDates", JSON.stringify(dayDates));
    }
    // Remove task from array
    tasks.splice(tasks.indexOf(task), 1);
    saveData();
}


// =================================================================
// Edit Handler: Replace row content with input fields for editing
// =================================================================
function handleEditClick() {

    let row = this._row;
    let task = this._task;

    // Prevent multiple edits at once
    if (row.querySelector(".edit-name")) return;

    // Get table cells
    let nameCell = row.cells[1];
    let locationCell = row.cells[2];
    let descCell = row.cells[3];
    let actionsCell = row.cells[4];

   // Save old values in case user cancels
    let oldName = task.name;
    let oldLocation = task.location;
    let oldDesc = task.description;

    // Replace text with input fields with maxlength
    nameCell.innerHTML =
        `<input type="text" class="form-control edit-name" value="${oldName}" maxlength="50" required>`;

    locationCell.innerHTML =
        `<input type="text" class="form-control edit-location" value="${oldLocation}" maxlength="50" required>`;

    descCell.innerHTML =
        `<input type="text" class="form-control edit-desc" value="${oldDesc}" maxlength="80" required>`;

    // Change buttons to Save / Cancel
    actionsCell.innerHTML = `
        <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-sm btn-outline-success saveBtn">Save</button>
            <button class="btn btn-sm btn-outline-secondary cancelBtn">Cancel</button>
        </div>
    `;
    // Add references for Save/Cancel buttons
    let saveBtn = actionsCell.querySelector(".saveBtn");
    let cancelBtn = actionsCell.querySelector(".cancelBtn");

    saveBtn._row = row;
    saveBtn._task = task;
    saveBtn._oldName = oldName;
    saveBtn._oldLocation = oldLocation;
    saveBtn._oldDesc = oldDesc;

    cancelBtn._row = row;
    cancelBtn._task = task;
    cancelBtn._oldName = oldName;
    cancelBtn._oldLocation = oldLocation;
    cancelBtn._oldDesc = oldDesc;

    saveBtn.addEventListener("click", handleSaveClick);
    cancelBtn.addEventListener("click", handleCancelClick);
}
// Save edited task
function handleSaveClick() {

    let row = this._row;
    let task = this._task;

    let nameCell = row.cells[1];
    let locationCell = row.cells[2];
    let descCell = row.cells[3];
    let actionsCell = row.cells[4];

// Get input elements
let nameInput = nameCell.querySelector(".edit-name");
let locationInput = locationCell.querySelector(".edit-location");
let descInput = descCell.querySelector(".edit-desc");

let newName = nameInput.value.trim().slice(0, 50);
let newLocation = locationInput.value.trim().slice(0, 50);
let newDesc = descInput.value.trim().slice(0, 80);

// Clear previous error styles
nameInput.classList.remove("is-invalid");
locationInput.classList.remove("is-invalid");
descInput.classList.remove("is-invalid");

let hasError = false;

if (!newName) {
    nameInput.classList.add("is-invalid");
    hasError = true;
}

if (!newLocation) {
    locationInput.classList.add("is-invalid");
    hasError = true;
}

if (!newDesc) {
    descInput.classList.add("is-invalid");
    hasError = true;
}

if (hasError) return;
    // Save new values
    task.name = newName;
    task.location = newLocation;
    task.description = newDesc;

    // Update cells back to normal text
    nameCell.textContent = newName;
    locationCell.textContent = newLocation;
    descCell.textContent = newDesc;

    actionsCell.innerHTML = `
        <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-sm btn-outline-warning editBtn"><i class="bi bi-pencil"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
        </div>
    `;
    saveData();
    tripPreview("#tripPreviewContainer");
}

//Cancel editing and restore old values
function handleCancelClick() {

    let row = this._row;
    let task = this._task;

    let oldName = this._oldName;
    let oldLocation = this._oldLocation;
    let oldDesc = this._oldDesc;

    let nameCell = row.cells[1];
    let locationCell = row.cells[2];
    let descCell = row.cells[3];
    let actionsCell = row.cells[4];

    nameCell.textContent = oldName;
    locationCell.textContent = oldLocation;
    descCell.textContent = oldDesc;

    actionsCell.innerHTML = `
        <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-sm btn-outline-warning editBtn"><i class="bi bi-pencil"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger deleteBtn"><i class="bi bi-trash"></i> Delete</button>
        </div>
    `;

    saveData();
    tripPreview("#tripPreviewContainer"); 
}

// ===============================
// FUNCTION: Update Summary
// ===============================
function updateSummary() {
    document.querySelector("#total").textContent = tasks.length;
    document.querySelector("#completed").textContent = tasks.filter(t => t.status === "completed").length;
    document.querySelector("#pending").textContent = tasks.filter(t => t.status === "pending").length;
}

// ===============================
// EVENT: Filter tasks by status
// ===============================
statusFilter.addEventListener("change", renderTasks);



//===============================
// Trip Preview for the Home page
//===============================
function tripPreview(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.classList.add("trip-preview-fade");

    // Clear previous content
    container.innerHTML = "";

    // ================= Summary =================
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const completed = tasks.filter(t => t.status === "completed").length;

    container.innerHTML += `
        <div class="mb-3">
            <b>Total:</b> ${total} |
            <b>Pending:</b> ${pending} |
            <b>Completed:</b> ${completed}
        </div>
    `;

    // ================= Day Tables =================
    const orderedDays = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];

    orderedDays.forEach(day => {
        const dayTasks = tasks.filter(t => t.day === day);
        if (dayTasks.length === 0) return; // skip empty days

        // Get the date for this day
        const dateStr = dayDates[day] ? formatDate(dayDates[day]) : "";

        // Create a card for day + date
        const cardDiv = document.createElement("div");
        cardDiv.className = "card mb-4 p-3";

        // Add day and date heading
        cardDiv.innerHTML = `<h5>${day} - ${dateStr}</h5>`;

        // Reuse existing createTaskTable function
        const table = createTaskTable(day, dayTasks);
        cardDiv.appendChild(table);

        // Append to preview container
        container.appendChild(cardDiv);
    });
}


// ===============================
// INITIAL RENDER
// ===============================
renderTasks();
updateSummary();
if (daySelect.value) handleDaySelectChange();
tripPreview("#tripPreviewContainer");




