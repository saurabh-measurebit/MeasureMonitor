document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    
    // Save client button click handler
    document.getElementById('saveClient').addEventListener('click', saveClient);
});

function loadClients() {
    fetch('/clients')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tableBody = document.getElementById('clientsTableBody');
                tableBody.innerHTML = '';
                
                data.clients.forEach(client => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${client.name}</td>
                        <td>${client.email}</td>
                        <td>${client.phone}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editClient('${client.id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteClient('${client.id}')">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        })
        .catch(error => showToast('Error loading clients: ' + error.message, 'error'));
}

function saveClient() {
    const clientId = document.getElementById('clientId').value;
    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value
    };

    const url = clientId ? `/clients/${clientId}` : '/clients';
    const method = clientId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
            loadClients();
            resetForm();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => showToast('Error saving client: ' + error.message, 'error'));
}

function editClient(clientId) {
    fetch(`/clients/${clientId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const client = data.client;
                document.getElementById('clientId').value = clientId;
                document.getElementById('clientName').value = client.name;
                document.getElementById('clientEmail').value = client.email;
                document.getElementById('clientPhone').value = client.phone;
                document.getElementById('clientAddress').value = client.address || '';
                
                document.getElementById('modalTitle').textContent = 'Edit Client';
                new bootstrap.Modal(document.getElementById('clientModal')).show();
            }
        })
        .catch(error => showToast('Error loading client details: ' + error.message, 'error'));
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        fetch(`/clients/${clientId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message, 'success');
                loadClients();
            } else {
                showToast(data.message, 'error');
            }
        })
        .catch(error => showToast('Error deleting client: ' + error.message, 'error'));
    }
}

function resetForm() {
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Client';
}

function showToast(message, type) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: 'right',
        backgroundColor: type === 'success' ? '#4caf50' : '#f44336'
    }).showToast();
}
