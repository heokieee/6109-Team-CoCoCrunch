document.addEventListener('DOMContentLoaded', () => {
    const addResourceForm = document.getElementById('add-resource-form');
    const resourcesList = document.getElementById('resources');

    addResourceForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = document.getElementById('resource-title').value;
        const description = document.getElementById('resource-description').value;
        const file = document.getElementById('resource-file').files[0];

        if (file) {
            // Construct FormData to send the file via AJAX
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('file', file);

            // Example of sending data to server using fetch API
            fetch('/your-upload-endpoint/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Assuming data contains the URL to the uploaded file
                const fileURL = data.file_url;

                const resourceItem = document.createElement('li');
                resourceItem.innerHTML = `
                    <div class="resource-info">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </div>
                    <a href="${fileURL}" class="btn download-btn" download="${title}">Download</a>
                `;

                resourcesList.appendChild(resourceItem);
                addResourceForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    // Example resource data - This should come from your backend in a real application
    const exampleResources = [
        { title: 'MA1521 Study Notes', description: 'Math lecture notes for MA1521.', fileURL: "{% static 'files/ma1521notes.pdf' %}" },
        { title: 'LSM1101 Extra Notes', description: 'Additional materials for LSM1101.', fileURL: "{% static 'files/lsm1101notes.pdf' %}" }
    ];

    exampleResources.forEach(resource => {
        const resourceItem = document.createElement('li');
        resourceItem.innerHTML = `
            <div class="resource-info">
                <h3>${resource.title}</h3>
                <p>${resource.description}</p>
            </div>
            <a href="${resource.fileURL}" class="btn download-btn" download="${resource.title}">Download</a>
        `;

        resourcesList.appendChild(resourceItem);
    });
});

