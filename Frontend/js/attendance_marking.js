
// Attendance Marking Logic

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Please login first");
    window.location.href = "../index.html";
    return;
  }

  // Populate Batches
  try {
    const res = await fetch('/batches/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const batches = await res.json();
      const select = document.getElementById('batch-select');
      select.addEventListener('change', loadStudents);
      batches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.batch_id;
        opt.textContent = b.name;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Failed to load batches", err);
  }

  // Mark All Present Listener
  const markAllBtn = document.querySelector('.mark-all-btn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      document.querySelectorAll('input[type="radio"][value="PRESENT"]').forEach(radio => {
        radio.checked = true;
      });
    });
  }
});

async function loadStudents() {
  const batchId = document.getElementById('batch-select').value;
  const container = document.getElementById('student-list-container');
  container.innerHTML = ''; // Clear

  if (!batchId) return;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`/enrollment/batch/${batchId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const enrollments = await res.json();

    if (enrollments.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center;">No students in this batch.</p>';
      return;
    }

    enrollments.forEach((enroll, index) => {
      const student = enroll.student;
      const user = student.user;
      const name = user.name;
      const sId = student.student_id;

      const div = document.createElement('div');
      div.className = 'student-item';
      div.dataset.studentId = sId;

      // Unique IDs for labels
      const presentId = `status_${sId}_present`;
      const absentId = `status_${sId}_absent`;

      div.innerHTML = `
                <span class="student-name-col">${index + 1}. ${name}</span>
                <div class="status-col status-controls">
                    <div class="radio-option">
                        <input type="radio" id="${presentId}" name="status_${sId}" value="PRESENT" checked>
                        <label for="${presentId}" class="present">Present</label>
                    </div>

                    <div class="radio-option">
                        <input type="radio" id="${absentId}" name="status_${sId}" value="ABSENT">
                        <label for="${absentId}" class="absent">Absent</label>
                    </div>
                </div>
                <input type="text" class="note-col student-note" placeholder="Note">
            `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load students");
  }
}

const form = document.getElementById("markAttendanceForm");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const batchId = document.getElementById('batch-select').value;
    const date = document.getElementById('attendance-date').value;
    const token = localStorage.getItem('token');

    if (!batchId || !date) {
      alert("Select batch and date");
      return;
    }

    const students = document.querySelectorAll('.student-item');
    const promises = [];

    // Improve UX: Disable button
    const submitBtn = form.querySelector('.btn-primary');
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    for (const item of students) {
      const sId = item.dataset.studentId;
      const statusInput = item.querySelector(`input[name="status_${sId}"]:checked`);
      const status = statusInput ? statusInput.value : 'PRESENT'; // Default
      const note = item.querySelector('.student-note').value; // In case we add note support later

      const p = fetch('/attendance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          batch_id: parseInt(batchId),
          student_id: parseInt(sId),
          status: status,
          date: date
        })
      }).then(res => {
        if (!res.ok) throw new Error(`Failed for student ${sId}`);
        return res;
      });
      promises.push(p);
    }

    try {
      await Promise.all(promises);
      alert("Attendance marked successfully! ✅");
      window.location.href = "/admin"; // Use absolute path
    } catch (err) {
      console.error(err);
      alert("Some records failed to save. Check console.");
      submitBtn.textContent = "Save Attendance";
      submitBtn.disabled = false;
    }
  });
}

