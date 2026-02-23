// ===============================
// INITIAL DATA: Load tasks and day dates
// ===============================
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

// ===============================
// DATE PICKER: Prevent past dates
// ===============================
let today = new Date().toISOString().split("T")[0];
dateInput.min = today;

// ===============================
// FUNCTION: Update minimum selectable date based on previous day
// ===============================
function updateMinDate(day) {
    let dayNumber = parseInt(day.split(" ")[1]);
    let minDate = new Date(); // default = today

    // If previous day exists → minimum date must be after it
    if (dayNumber > 1) {
        let prevDay = "Day " + (dayNumber - 1);
        if (dayDates[prevDay]) {
            minDate = new Date(dayDates[prevDay]);
            minDate.setDate(minDate.getDate() + 1);
        }
    }

    dateInput.min = minDate.toISOString().split("T")[0];
}

// ===============================
// EVENT: Lock/unlock date when day changes
// ===============================
daySelect.addEventListener("change", function() {
    let selectedDay = this.value;
    updateMinDate(selectedDay);

    if (dayDates[selectedDay]) {
        dateInput.value = dayDates[selectedDay];
        dateInput.disabled = true;
    } else {
        dateInput.value = "";
        dateInput.disabled = false;
    }
});

// ===============================
// EVENT: Add Task
// ===============================
addBtn.addEventListener("click", function() {

    // Get input values
    let day = daySelect.value;
    let date = dateInput.value;
    let name = document.querySelector("#activityName").value.trim();
    let location = document.querySelector("#location").value.trim();
    let description = document.querySelector("#description").value.trim();

    // Basic validation
    if (!date || !name || !location) {
        alert("Fill all required fields.");
        return;
    }

    let selectedDate = new Date(date);
    let dayNumber = parseInt(day.split(" ")[1]);

    // Prevent duplicate date across different days
    for (let existingDay in dayDates) {
        if (dayDates[existingDay] === date && existingDay !== day) {
            alert("Each day must have a unique date.");
            return;
        }
    }

    // Enforce consecutive day rule
    if (dayNumber > 1) {
        let prevDay = "Day " + (dayNumber - 1);
        if (!dayDates[prevDay]) {
            alert("You must complete " + prevDay + " first.");
            return;
        }

        let prevDate = new Date(dayDates[prevDay]);
        prevDate.setDate(prevDate.getDate() + 1);

        if (selectedDate.getTime() !== prevDate.getTime()) {
            alert(day + " must be exactly the next day after " + prevDay);
            return;
        }
    }

    // Ensure all tasks for the same day share the same date
    if (dayDates[day] && dayDates[day] !== date) {
        alert(day + " already has a fixed date.");
        return;
    } else if (!dayDates[day]) {
        dayDates[day] = date;
        localStorage.setItem("dayDates", JSON.stringify(dayDates));
    }

    // Add task
    tasks.push({
        day: day,
        name: name,
        location: location,
        description: description,
        status: "pending"
    });

    saveData();
});

// ===============================
// FUNCTION: Save tasks to localStorage
// ===============================
function saveData() {
    localStorage.setItem("tripTasks", JSON.stringify(tasks));
    renderTasks();
    updateSummary();
}

// ===============================
// FUNCTION: Render tasks
// ===============================
function renderTasks() {

    daysContainer.innerHTML = "";
    let filterStatus = statusFilter.value;
    let orderedDays = ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"];

    orderedDays.forEach(function(day) {
        let dayTasks = tasks.filter(t => 
            t.day === day && (filterStatus === "all" || t.status === filterStatus)
        );

        if (dayTasks.length === 0) return;

        // Create card
        let col = document.createElement("div");
        col.className = "col-md-12 mb-3";
        let card = document.createElement("div");
        card.className = "card p-4";

        // Format date
        let formattedDate = "";
        if (dayDates[day]) {
            let d = new Date(dayDates[day]);
            formattedDate = d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        card.innerHTML = `<h5>${day} - ${formattedDate}</h5>`;

        // Create table
        let table = document.createElement("table");
        table.className = "table table-bordered";
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

        let tbody = document.createElement("tbody");

        dayTasks.forEach(function(task) {
            let row = document.createElement("tr");
            if (task.status === "completed") row.classList.add("completed");

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

            // Checkbox change
            let checkbox = row.querySelector(".checkTask");
            checkbox.checked = task.status === "completed";
            checkbox.addEventListener("change", function() {
                task.status = checkbox.checked ? "completed" : "pending";
                saveData();
            });

            // Delete button
            row.querySelector(".deleteBtn").addEventListener("click", function() {
                let dayNumber = parseInt(day.split(" ")[1]);
                let tasksForDay = tasks.filter(t => t.day === day);

                if (tasksForDay.length === 1) {
                    for (let i = dayNumber + 1; i <= 7; i++) {
                        if (dayDates["Day " + i]) {
                            alert("You cannot delete this day because later days exist.");
                            return;
                        }
                    }
                    delete dayDates[day];
                    localStorage.setItem("dayDates", JSON.stringify(dayDates));
                }

                tasks.splice(tasks.indexOf(task), 1);
                saveData();
            });

            // Edit button
            row.querySelector(".editBtn").addEventListener("click", function() {
                let newName = prompt("Edit Activity Name", task.name);
                let newLoc = prompt("Edit Location", task.location);
                let newDesc = prompt("Edit Description", task.description);

                if (newName) task.name = newName;
                if (newLoc) task.location = newLoc;
                if (newDesc) task.description = newDesc;

                saveData();
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        card.appendChild(table);
        col.appendChild(card);
        daysContainer.appendChild(col);
    });
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

// ===============================
// INITIAL RENDER
// ===============================
renderTasks();
updateSummary();