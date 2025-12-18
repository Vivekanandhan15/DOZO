// Modal Elements
const modal = document.getElementById('batchModal');
const createBtn = document.getElementById('createBatchBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const batchForm = document.getElementById('batchForm');
const modalTitle = document.getElementById('modalTitle');
const batchesTableBody = document.getElementById('batchesTableBody');

// State
let editingBatchId = null;

// Open Modal for Create
createBtn.addEventListener('click', () => {
    editingBatchId = null;
    modalTitle.textContent = 'Create New Batch';
    batchForm.reset();
    document.getElementById('batchId').value = '';
    modal.classList.add('active');
});

// Close Modal
closeBtn.addEventListener('click', () => modal.classList.remove('active'));
cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Fetch and Display Batches
async function fetchBatches() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = '/';
        return;
    }

    try {
        const res = await fetch('/batches/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const batches = await res.json();
            renderBatches(batches);
        } else if (res.status === 401) {
            alert('Session expired. Please login again.');
            window.location.href = '/';
        } else {
            const data = await res.json();
            alert(`Error: ${data.detail || 'Failed to fetch batches'}`);
        }
    } catch (error) {
        console.error('Error fetching batches:', error);
        alert('Network error. Please try again.');
    }
}

function renderBatches(batches) {
    if (!batches || batches.length === 0) {
        batchesTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #a0aec0;">
          No batches found. Create your first batch!
        </td>
      </tr>
    `;
        return;
    }

    batchesTableBody.innerHTML = batches.map(batch => `
    <tr>
      <td>${batch.batch_id}</td>
      <td><strong>${batch.name}</strong></td>
      <td>${batch.teacher_id}</td>
      <td>${new Date(batch.start_date).toLocaleDateString()}</td>
      <td>${new Date(batch.end_date).toLocaleDateString()}</td>
      <td class="action-buttons">
        <button class="btn-icon edit" onclick="editBatch(${batch.batch_id})">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-icon delete" onclick="deleteBatch(${batch.batch_id})">
          <i class="fas fa-trash"></i> Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// Create/Update Batch
batchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const batchId = document.getElementById('batchId').value;
    const data = {
        name: document.getElementById('batchName').value,
        teacher_id: parseInt(document.getElementById('teacherId').value),
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value
    };

    const isEdit = batchId !== '';
    const url = isEdit ? `/batches/${batchId}` : '/batches/';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(isEdit ? 'Batch updated successfully!' : 'Batch created successfully!');
            modal.classList.remove('active');
            fetchBatches();
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.detail || 'Operation failed'}`);
        }
    } catch (error) {
        console.error('Error saving batch:', error);
        alert('Network error. Please try again.');
    }
});

// Edit Batch
window.editBatch = async function (id) {
    const token = localStorage.getItem('token');

    try {
        const res = await fetch('/batches/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const batches = await res.json();
            const batch = batches.find(b => b.batch_id === id);

            if (batch) {
                document.getElementById('batchId').value = batch.batch_id;
                document.getElementById('batchName').value = batch.name;
                document.getElementById('teacherId').value = batch.teacher_id;
                document.getElementById('startDate').value = batch.start_date;
                document.getElementById('endDate').value = batch.end_date;

                modalTitle.textContent = 'Edit Batch';
                modal.classList.add('active');
            }
        }
    } catch (error) {
        console.error('Error loading batch:', error);
        alert('Failed to load batch details');
    }
};

// Delete Batch
window.deleteBatch = async function (id) {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`/batches/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Batch deleted successfully!');
            fetchBatches();
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.detail || 'Failed to delete batch'}`);
        }
    } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Network error. Please try again.');
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchBatches();
});
