document.addEventListener("DOMContentLoaded", function() {
    const categoryLabels = document.querySelectorAll(".category");
    const tasks = document.querySelectorAll(".task");
    const reminderTableBody = document.getElementById("reminderTableBody");
    const notificationSound = document.getElementById("notificationSound");
    const addReminderForm = document.getElementById("addReminderForm");
    const deleteTaskUrl = "/accounts/delete_task/";

    // Function to filter tasks based on category
    function filterTasks(category) {
        tasks.forEach(task => {
            const taskCategory = task.getAttribute("data-category");
            if (category === "all" || taskCategory === category) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    }

    // Event listener for category filter labels
    categoryLabels.forEach(label => {
        label.addEventListener("click", function() {
            const category = this.getAttribute("data-category");
            filterTasks(category);
        });
    });

    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie) {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Ask user to allow notification access
    if ("Notification" in window) {
        Notification.requestPermission().then(function(permission) {
            if (Notification.permission !== "granted") {
                alert("Please allow notification access!");
                location.reload();
            }
        });
    }

    var timeoutIds = [];

    function scheduleReminder() {
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        const dateTimeString = date + " " + time;
        const scheduledTime = new Date(dateTimeString);
        const currentTime = new Date();
        const timeDifference = scheduledTime - currentTime;

        if (timeDifference > 0) {
            addReminder(title, description, dateTimeString);

            setTimeout(function() {
                notificationSound.play();
                new Notification(title, {
                    body: description,
                    requireInteraction: true
                });
            }, timeDifference);
        } else {
            alert("Please select a future date and time.");
        }
    }

    function addReminder(title, description, dateTimeString) {
        const row = reminderTableBody.insertRow();

        const titleCell = row.insertCell(0);
        const descriptionCell = row.insertCell(1);
        const dateTimeCell = row.insertCell(2);
        const actionCell = row.insertCell(3);

        titleCell.textContent = title;
        descriptionCell.textContent = description;
        dateTimeCell.textContent = dateTimeString;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function() {
            deleteReminder(row);
        };
        actionCell.appendChild(deleteButton);
    }

    function deleteReminder(row) {
        const rowIndex = row.rowIndex;
        reminderTableBody.deleteRow(rowIndex);
    }

    // Event listener for form submission
    addReminderForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Retrieve form values
        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;

        // Validate input values (optional)
        if (title.trim() === "" || description.trim() === "" || date === "" || time === "") {
            alert("Please fill in all fields.");
            return;
        }

        // Call function to schedule reminder
        scheduleReminder();

        // Reset form fields (optional)
        this.reset();
    });

    // Event listener for delete buttons
    tasks.forEach(task => {
        const deleteButton = task.querySelector(".delete-task");
        deleteButton.addEventListener("click", function() {
            const taskId = task.getAttribute("data-task-id");

            if (confirm("Are you sure you want to delete this task?")) {
                fetch(deleteTaskUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": getCookie("csrftoken")
                        },
                        body: JSON.stringify({
                            task_id: taskId
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.status === "success") {
                            task.remove(); // Remove task element from DOM
                        } else {
                            alert(data.message); // Show error message if deletion failed
                        }
                    })
                    .catch(error => {
                        console.error("Error deleting task:", error);
                        alert("Error deleting task. Please try again."); // Generic error message
                    });
            }
        });
    });

    // Event listener for add reminder form submission
    addReminderForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form from submitting normally
        scheduleReminder(); // Schedule the reminder
    });

    filterTasks("all"); // Initially show all tasks
});