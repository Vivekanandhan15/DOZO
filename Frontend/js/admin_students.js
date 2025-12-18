
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch('/students/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                window.location.href = '/';
                return;
            }
            throw new Error(`Failed to fetch students: ${response.statusText}`);
        }

        const students = await response.json();
        renderStudentList(students);

    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Failed to load student list.');
    }
});

function renderStudentList(students) {
    const container = document.querySelector('.student-list-card');
    // Keep header and pagination, clear list items
    const header = container.querySelector('.list-header');
    const pagination = container.querySelector('.pagination');

    // Clear existing items (items are between header and pagination)
    // Safer way: clear everything and rebuild
    container.innerHTML = '';
    container.appendChild(header);

    if (students.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'list-item';
        emptyMsg.innerHTML = '<p style="padding: 20px; text-align: center; width: 100%;">No students found.</p>';
        container.appendChild(emptyMsg);
    } else {
        students.forEach(student => {
            const item = document.createElement('div');
            item.className = 'list-item';

            // Avatar Initial
            const initial = student.user.name.charAt(0).toUpperCase();
            // Random color class logic or fixed
            const avatarClass = 'avatar-a';

            item.innerHTML = `
                <div class="student-info-col">
                    <div class="avatar ${avatarClass}">${initial}</div>
                    <div>
                        <span class="student-name">${student.user.name}</span>
                        <span class="student-id">${student.roll_no}</span>
                    </div>
                </div>

                <span class="batch-col">${student.batch_name}</span>
                <span class="attendance-col rate-high">--%</span>
                <span class="status-col status-active">${student.status}</span>

                <span class="actions-col">
                    <button class="icon-btn" title="View"><i class="fas fa-eye"></i></button>
                    <button class="icon-btn" title="Edit"><i class="fas fa-edit"></i></button>
                </span>
            `;
            container.appendChild(item);
        });
    }

    container.appendChild(pagination);
}
