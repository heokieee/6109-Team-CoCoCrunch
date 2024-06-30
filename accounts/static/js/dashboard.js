document.addEventListener('DOMContentLoaded', function () {
    if ("Notification" in window) {
        Notification.requestPermission().then(function (permission) {
            if (Notification.permission !== "granted") {
                alert("Please allow notification access!");
            }
        });
    }

    var timeoutIds = [];

    function loadReminders() {
        const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        reminders.forEach(reminder => {
            addReminderToTable(reminder.title, reminder.description, reminder.dateTimeString, reminder.priority);
            scheduleNotification(reminder);
        });
    }

    function scheduleReminder(event) {
        event.preventDefault();

        var title = document.getElementById("id_title").value;
        var description = document.getElementById("id_description").value;
        var date = document.getElementById("id_date").value;
        var time = document.getElementById("id_time").value;
        var priority = document.getElementById("id_priority").value;

        var dateTimeString = date + " " + time;
        var scheduledTime = new Date(dateTimeString);
        var currentTime = new Date();
        var timeDifference = scheduledTime - currentTime;

        if (timeDifference > 0) {
            const newReminder = {
                title: title,
                description: description,
                dateTimeString: dateTimeString,
                priority: priority
            };
            
            // Save to local storage
            let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
            reminders.push(newReminder);
            localStorage.setItem('reminders', JSON.stringify(reminders));

            addReminderToTable(newReminder.title, newReminder.description, newReminder.dateTimeString, newReminder.priority);
            scheduleNotification(newReminder);
        } else {
            alert("Please select a future date and time.");
        }
    }

    function addReminderToTable(title, description, dateTimeString, priority) {
        var tableBody = document.getElementById("reminderTableBody");

        var row = tableBody.insertRow();

        var titleCell = row.insertCell(0);
        var descriptionCell = row.insertCell(1);
        var dateTimeCell = row.insertCell(2);
        var priorityCell = row.insertCell(3);
        var actionCell = row.insertCell(4);

        titleCell.innerHTML = title;
        descriptionCell.innerHTML = description;
        dateTimeCell.innerHTML = dateTimeString;
        priorityCell.innerHTML = priority;
        var deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
            deleteReminder(row);
        });
        actionCell.appendChild(deleteBtn);
    }

    function scheduleNotification(reminder) {
        var scheduledTime = new Date(reminder.dateTimeString);
        var currentTime = new Date();
        var timeDifference = scheduledTime - currentTime;

        var timeoutId = setTimeout(function () {
            document.getElementById("notificationSound").play();

            var notification = new Notification(reminder.title, {
                body: reminder.description,
                requireInteraction: true
            });
        }, timeDifference);

        timeoutIds.push({ id: timeoutId, dateTimeString: reminder.dateTimeString });
    }

    function deleteReminder(row) {
        var title = row.cells[0].innerText;
        var dateTimeString = row.cells[2].innerText;

        // Delete from local storage
        let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
        reminders = reminders.filter(reminder => !(reminder.title === title && reminder.dateTimeString === dateTimeString));
        localStorage.setItem('reminders', JSON.stringify(reminders));

        // Clear the corresponding timeout
        let timeoutId = timeoutIds.find(timeout => timeout.dateTimeString === dateTimeString);
        if (timeoutId) {
            clearTimeout(timeoutId.id);
            timeoutIds = timeoutIds.filter(timeout => timeout.dateTimeString !== dateTimeString);
        }

        row.remove();
    }

    document.getElementById("addReminderForm").addEventListener("submit", scheduleReminder);
    loadReminders();
});








