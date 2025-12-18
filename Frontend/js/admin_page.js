// Admin Dashboard - Dynamic Data Loading

const API_BASE = '';
let authToken = '';

// Helper functions
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

// Auth check
document.addEventListener('DOMContentLoaded', async () => {
  authToken = localStorage.getItem('token');
  if (!authToken) {
    window.location.href = '/';
    return;
  }

  // Load all dynamic data
  await Promise.all([
    loadUserProfile(),
    loadDashboardStats(),
    loadLeaveRequests(),
    loadAnnouncements(),
    loadSchedule()
  ]);
});

// Load and Render Schedule
async function loadSchedule() {
  try {
    const res = await fetch('/dashboard/schedule', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const schedule = await res.json();
      renderSchedule(schedule);
    }
  } catch (err) {
    console.error("Error loading schedule:", err);
  }
}

function renderSchedule(scheduleItems) {
  const list = document.querySelector('.schedule-list');
  if (!list) return;

  // Clear existing items but keep "View All" link if inside the list (usually it's in header)
  // Let's check structure. Assuming .schedule-list contains ul/divs.
  // We'll replace inner content effectively.
  list.innerHTML = '';

  if (scheduleItems.length === 0) {
    list.innerHTML = '<p style="text-align:center; padding:10px; color:#888;">No classes scheduled today.</p>';
    return;
  }

  scheduleItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'schedule-card'; // Reuse or create simpler style
    // If no specific class exists, we use inline or reuse announcement card style with mods
    // Given the image, it looks like a card with icon, title, details, and status.

    // Determine status color
    const statusClass = item.status === 'In Progress' ? 'status-green' : (item.status === 'Upcoming' ? 'status-blue' : 'status-gray');

    card.innerHTML = `
        <div class="schedule-icon" style="background:${stringToColor(item.batch_name)}; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; color:white; font-size:1.2em;">
            <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div style="flex-grow:1;">
            <h4 style="margin:0; font-size:1em; color:#333;">${item.batch_name}</h4>
            <span style="font-size:0.85em; color:#666;">
                 ${item.room} • ${item.student_count} students
            </span>
        </div>
        <div style="text-align:right;">
             <div style="font-weight:600; font-size:0.9em; color:#333;">${item.time}</div>
             <div style="font-size:0.8em; color:${statusClass === 'status-green' ? '#2ecc71' : '#3498db'}; font-weight:500;">
                 ${item.status}
             </div>
        </div>
    `;
    // Add basic flex styling if class doesn't exist
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.padding = '15px';
    card.style.border = '1px solid #f0f0f0';
    card.style.borderRadius = '10px';
    card.style.marginBottom = '10px';
    card.style.backgroundColor = '#fff';

    list.appendChild(card);
  });
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

// Load User Profile (Welcome Message)
async function loadUserProfile() {
  try {
    const res = await fetch('/users/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const user = await res.json();
      const welcomeEl = document.querySelector('.header-title h2');
      if (welcomeEl) {
        welcomeEl.textContent = `Welcome Back, ${user.name}`;
      }
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

// Load Dashboard Stats
async function loadDashboardStats() {
  try {
    const res = await fetch('/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const stats = await res.json();

      // Update HTML elements (Assuming structure matches)
      const boxes = document.querySelectorAll('.stat-card');
      if (boxes.length >= 3) {
        // 1. Total Students
        boxes[0].querySelector('h3').textContent = stats.total_students;
        // 2. Active Tasks
        boxes[1].querySelector('h3').textContent = stats.active_tasks;
        // 3. Attendance Rate (or Pending Leaves)
        // If the third box is Leaves:
        const thirdBoxTitle = boxes[2].querySelector('p').textContent.toLowerCase();
        if (thirdBoxTitle.includes('leave')) {
          boxes[2].querySelector('h3').textContent = stats.pending_leaves;
        } else {
          boxes[2].querySelector('h3').textContent = stats.attendance_rate + '%';
        }
      }
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// Fetch and display leave requests
async function loadLeaveRequests() {
  try {
    const response = await fetch(`${API_BASE}/leaves/`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to fetch leaves');

    const leaves = await response.json();
    renderLeaveRequests(leaves);
  } catch (error) {
    console.error('Error loading leave requests:', error);
  }
}

function renderLeaveRequests(leaves) {
  const container = $('.leave-section');
  if (!container) return;

  // Keep the title
  const title = container.querySelector('.leave-section-title');
  container.innerHTML = '';
  container.appendChild(title);

  if (leaves.length === 0) {
    container.innerHTML += '<p style="padding: 20px; text-align: center;">No pending leave requests</p>';
    return;
  }

  leaves.forEach(leave => {
    const isPending = leave.status === 'PENDING';
    const bgClass = isPending ? 'yellow-bg' : (leave.status === 'APPROVED' ? 'green-bg' : 'red-bg');

    const card = document.createElement('div');
    card.className = `leave-card ${bgClass}`;
    card.innerHTML = `
      <div class="leave-left">
        <img src="" alt="${leave.student?.user?.name || 'Student'}" class="leave-avatar">
        <div>
          <h3>${leave.student?.user?.name || 'Student'}</h3>
          <p>${leave.reason}</p>
          <small>Date: ${new Date(leave.date).toLocaleDateString()}</small>
        </div>
      </div>
      <div class="leave-actions">
        ${isPending ? `
          <button class="btn-approve" data-leave-id="${leave.leave_id}">Approve</button>
          <button class="btn-reject" data-leave-id="${leave.leave_id}">Reject</button>
        ` : `
          <button class="btn-approved" disabled>${leave.status}</button>
        `}
      </div>
    `;
    container.appendChild(card);
  });

  // Attach event listeners
  attachLeaveActions();
}

function attachLeaveActions() {
  $all('.btn-approve').forEach(btn => {
    btn.addEventListener('click', async () => {
      const leaveId = btn.dataset.leaveId;
      await updateLeaveStatus(leaveId, 'APPROVED');
    });
  });

  $all('.btn-reject').forEach(btn => {
    btn.addEventListener('click', async () => {
      const leaveId = btn.dataset.leaveId;
      await updateLeaveStatus(leaveId, 'REJECTED');
    });
  });
}

async function updateLeaveStatus(leaveId, status) {
  try {
    const response = await fetch(`${API_BASE}/leaves/${leaveId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to update leave');

    alert(`Leave ${status.toLowerCase()} successfully`);
    await loadLeaveRequests(); // Reload
  } catch (error) {
    console.error('Error updating leave:', error);
    alert('Failed to update leave status');
  }
}

// Fetch and display announcements
async function loadAnnouncements() {
  try {
    const response = await fetch(`${API_BASE}/announcements/`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!response.ok) throw new Error('Failed to fetch announcements');

    const announcements = await response.json();
    renderAnnouncements(announcements);
  } catch (error) {
    console.error('Error loading announcements:', error);
  }
}

function renderAnnouncements(announcements) {
  const container = $('.recent-announcements');
  if (!container) return;

  // Keep header
  const header = container.querySelector('.announcements-header');
  container.innerHTML = '';
  container.appendChild(header);

  if (announcements.length === 0) {
    container.innerHTML += '<p style="padding: 20px;">No announcements yet</p>';
    return;
  }

  announcements.slice(0, 3).forEach((ann, index) => {
    const colors = ['blue-border', 'green-border', 'yellow-border'];
    const card = document.createElement('div');
    card.className = `announcement-card ${colors[index % 3]}`;
    card.innerHTML = `
      <div class="announcement-content">
        <div class="announcement-header">
          <h3>${ann.title}</h3>
          <span class="time">${getTimeAgo(ann.posted_date)}</span>
        </div>
        <p>${ann.content}</p>
        <div class="announcement-meta">
          <span><i class="fas fa-user"></i> Admin</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Create new announcement
const announcementBtn = $('.comm-btn');
if (announcementBtn) {
  announcementBtn.addEventListener('click', async () => {
    const title = prompt('Announcement Title');
    if (!title) return;

    const content = prompt('Announcement Message');
    if (!content) return;

    try {
      const response = await fetch(`${API_BASE}/announcements/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Failed to create announcement');

      alert('📢 Announcement posted successfully');
      await loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to post announcement');
    }
  });
}

// Sidebar navigation
$all('.menu-item').forEach(link => {
  link.addEventListener('click', () => {
    $all('.menu-item').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole'); // If used
  window.location.href = '/';
}
window.logout = logout; // Expose to global scope
