// Student Profile - Dynamic Data Loading

const API_BASE = '';
let authToken = '';
let studentData = null;

// Auth check and load profile
document.addEventListener('DOMContentLoaded', async () => {
  authToken = localStorage.getItem('token');
  if (!authToken) {
    window.location.href = '/';
    return;
  }

  await loadStudentProfile();
});

// Load student profile from backend
async function loadStudentProfile() {
  try {
    const response = await fetch(`${API_BASE}/students/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    studentData = await response.json();
    populateProfile(studentData);
    await loadEnrollmentInfo();
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Failed to load profile data');
  }
}

// Populate form with student data
function populateProfile(data) {
  // Profile overview
  const userName = data.user?.name || 'Student';
  const userEmail = data.user?.email || '';

  document.querySelector('.user-name').textContent = userName;
  document.querySelector('.user-email').textContent = userEmail;
  document.querySelector('.user-id').textContent = data.roll_no || '';
  document.querySelector('.avatar-large').textContent = userName.charAt(0).toUpperCase();

  // General info form
  document.getElementById('fullName').value = userName;
  document.getElementById('phone').value = data.user?.phone || '';
  document.getElementById('guardian').value = data.parent_contact || '';

  // Academic details
  const enrollDate = data.admission_date ? new Date(data.admission_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  document.querySelector('.info-grid').querySelectorAll('.stat-value')[2].textContent = enrollDate;
  document.querySelector('.info-grid').querySelectorAll('.stat-value')[3].textContent = data.roll_no || 'N/A';
}

// Load enrollment information
async function loadEnrollmentInfo() {
  try {
    // We can get batch info from the enrollments endpoint if we had the batch_id
    // For now, display placeholder or fetch separately if needed
    // You could add a /students/me/enrollment endpoint in the future
  } catch (error) {
    console.error('Error loading enrollment:', error);
  }
}

// Update profile
const generalForm = document.querySelector('#general form');
if (generalForm) {
  generalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const guardian = document.getElementById('guardian').value.trim();

    try {
      const response = await fetch(`${API_BASE}/students/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent_contact: guardian
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      alert('✅ Profile updated successfully');
      await loadStudentProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  });
}

// Change password (if you have an endpoint for it)
const securityForm = document.querySelector('#security form');
if (securityForm) {
  securityForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (newPass !== confirm) {
      alert('New passwords do not match');
      return;
    }

    if (newPass.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    alert('🔐 Password change feature coming soon');
    // TODO: Implement password change endpoint
    e.target.reset();
  });
}

// Tab handling (already in HTML inline script, but keeping for reference)
const tabs = document.querySelectorAll('.tab-button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});
