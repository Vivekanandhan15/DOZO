
const API_BASE = '';
let authToken = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
    if (!authToken) {
        window.location.href = '/';
        return;
    }
    loadSubmissions();
});

async function loadSubmissions() {
    const listContainer = document.getElementById('submissionsList');
    try {
        const response = await fetch(`${API_BASE}/submissions/all`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch submissions');

        const submissions = await response.json();
        listContainer.innerHTML = '';

        if (submissions.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #888;">No submissions found.</p>';
            return;
        }

        submissions.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'submission-card';

            // Determine status color
            const hasGrade = sub.grade !== null;
            const statusColor = hasGrade ? '#2ecc71' : '#f1c40f'; // Green or Yellow
            const statusText = hasGrade ? `Graded: ${sub.grade}` : 'Pending Review';

            card.innerHTML = `
                <div class="submission-info">
                    <h3>${sub.assignment_title || 'Assignment #' + sub.assignment_id}</h3>
                    <p><strong>Student:</strong> ${sub.student_name || 'ID: ' + sub.student_id}</p>
                    <p><strong>File:</strong> <a href="${sub.file_url}" target="_blank" class="file-link">View Submission</a></p>
                    <p><strong>Submitted:</strong> ${new Date(sub.submitted_at).toLocaleString()}</p>
                    <p style="color: ${statusColor}; font-weight: bold; margin-top: 5px;">${statusText}</p>
                </div>
                <div class="grading-section">
                    <input type="number" class="grade-input" placeholder="0-100" value="${sub.grade || ''}" ${hasGrade ? 'disabled' : ''}>
                    <input type="text" class="feedback-input" placeholder="Feedback..." value="${sub.feedback || ''}" ${hasGrade ? 'disabled' : ''}>
                    ${hasGrade ? '' : `<button class="btn-grade" onclick="submitGrade(${sub.submission_id}, this)">Submit Grade</button>`}
                </div>
            `;
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error:', error);
        listContainer.innerHTML = '<p style="text-align: center; color: red;">Error loading submissions.</p>';
    }
}

async function submitGrade(submissionId, btnElement) {
    const card = btnElement.parentElement;
    const grade = card.querySelector('.grade-input').value;
    const feedback = card.querySelector('.feedback-input').value;

    if (!grade) {
        alert('Please enter a grade');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/submissions/${submissionId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ grade: parseInt(grade), feedback: feedback })
        });

        if (!response.ok) throw new Error('Failed to submit grade');

        alert('Grade submitted successfully! ✅');
        loadSubmissions(); // Reload list

    } catch (error) {
        console.error('Error grading:', error);
        alert('Failed to submit grade ❌');
    }
}
