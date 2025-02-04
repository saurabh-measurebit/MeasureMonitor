// DOM Elements
const clientForm = document.getElementById('clientForm');
const clientsTableBody = document.getElementById('clientsTableBody');
const saveClientBtn = document.getElementById('saveClient');
const clientModal = new bootstrap.Modal(document.getElementById('clientModal'));

// Utility Functions
function showToast(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: type === 'success' ? "#28a745" : "#dc3545" }
    }).showToast();
}

// Client Management Functions
async function fetchClients() {
    try {
        const response = await fetch('/api/clients');
        const data = await response.json();
        console.log('Received data from server:', data);
        if (data.status === 'success') {
            console.log('Clients to display:', data.clients);
            displayClients(data.clients);
        } else {
            showToast(data.message || 'Error fetching clients', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to fetch clients', 'error');
    }
}

function displayClients(clients) {
    console.log('Starting to display clients:', clients);
    clientsTableBody.innerHTML = '';
    if (!Array.isArray(clients)) {
        console.error('Clients is not an array:', clients);
        return;
    }
    clients.forEach(client => {
        console.log('Processing client:', client);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name || client.id || ''}</td>
            <td>${client.projectId || client.project_id || ''}</td>
            <td>${client.gaPropertyId || client.ga_property_id || ''}</td>
            <td>${Array.isArray(client.eventsList) ? client.eventsList.join(', ') : Array.isArray(client.events_list) ? client.events_list.join(', ') : ''}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editClient('${client.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Delete</button>
            </td>
        `;
        clientsTableBody.appendChild(row);
    });
}

async function saveClient(event) {
    event.preventDefault();
    
    const clientId = document.getElementById('clientId').value;
    const eventsList = document.getElementById('eventsList').value
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

    const formData = {
        name: document.getElementById('clientName').value,
        project_id: document.getElementById('projectId').value,
        ga_property_id: document.getElementById('gaPropertyId').value,
        events_list: eventsList,
        min_average: parseFloat(document.getElementById('minAverage').value) || 0,
        std_dev_multiplier: parseFloat(document.getElementById('stdDevMultiplier').value) || 0,
        threshold_percentage: parseFloat(document.getElementById('thresholdPercentage').value) || 0,
        event_configs: {} // We'll handle this separately if needed
    };

    try {
        const url = clientId ? `/api/clients/${clientId}` : '/api/clients';
        const method = clientId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (data.status === 'success') {
            showToast(clientId ? 'Client updated successfully' : 'Client added successfully');
            clientModal.hide();
            fetchClients();
            resetForm();
        } else {
            showToast(data.message || 'Error saving client', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to save client', 'error');
    }
}

async function editClient(clientId) {
    try {
        const response = await fetch(`/api/clients/${clientId}`);
        const data = await response.json();
        if (data.status === 'success') {
            const client = data.client;
            document.getElementById('clientId').value = client.id;
            document.getElementById('clientName').value = client.id; // Using ID as name
            document.getElementById('projectId').value = client.project_id;
            document.getElementById('gaPropertyId').value = client.ga_property_id;
            document.getElementById('eventsList').value = client.events_list.join(', ');
            document.getElementById('minAverage').value = client.min_average || 0;
            document.getElementById('stdDevMultiplier').value = client.std_dev_multiplier || 0;
            document.getElementById('thresholdPercentage').value = client.threshold_percentage || 0;
            
            document.getElementById('modalTitle').textContent = 'Edit Client';
            document.getElementById('clientName').disabled = true; // Can't change client ID once created
            clientModal.show();
        } else {
            showToast(data.message || 'Error fetching client details', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to fetch client details', 'error');
    }
}

function resetForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Client';
    document.getElementById('clientName').disabled = false;
}

async function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.status === 'success') {
                showToast('Client deleted successfully');
                fetchClients();
            } else {
                showToast(data.message || 'Error deleting client', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to delete client', 'error');
        }
    }
}

// Event Listeners
document.getElementById('saveClient').addEventListener('click', saveClient);
document.getElementById('clientModal').addEventListener('hidden.bs.modal', resetForm);

// Add client button handler
document.querySelector('[data-bs-toggle="modal"]').addEventListener('click', () => {
    resetForm();
    clientModal.show();
});

// Initial load
fetchClients();
