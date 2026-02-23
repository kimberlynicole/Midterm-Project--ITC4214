// Get tasks
let tasks = JSON.parse(localStorage.getItem("tripTasks"));

if(tasks === null){
    tasks = [];
}

let completed = 0;
let pending = 0;

for(let i = 0; i < tasks.length; i++){
    if(tasks[i].status === "completed"){
        completed = completed + 1;
    }
    else {
        pending = pending + 1;
    }
}

const total = completed + pending;

let completedPercent = 0;
let pendingPercent = 0;

if(total > 0){
    completedPercent = Math.round((completed / total) * 100);
    pendingPercent = Math.round((pending / total) * 100);
}

// Show text values
document.querySelector(".completed").textContent =
    completed + " (" + completedPercent + "%)";

document.querySelector(".pending").textContent =
    pending + " (" + pendingPercent + "%)";

document.querySelector(".total").textContent = total;

// BAR CHART LOGIC 

const completedBar = document.querySelector(".completed-bar");
const pendingBar = document.querySelector(".pending-bar");

// Set width using percentage
completedBar.style.width = completedPercent + "%";
pendingBar.style.width = pendingPercent + "%";

// Show percentage text inside bars
completedBar.textContent = completedPercent + "%";
pendingBar.textContent = pendingPercent + "%";

