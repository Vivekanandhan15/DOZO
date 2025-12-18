const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
  container.classList.remove("forgot-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
  container.classList.remove("forgot-active");
});

// Handle Sign Up
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, phone: "", role: "student" }) // Default values
    });

    if (response.ok) {
      alert('Registration successful! Please Sign In.');
      container.classList.remove("right-panel-active"); // Switch to Sign In view
    } else {
      const data = await response.json();
      alert(`Registration failed: ${data.detail || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during registration.');
  }
});

// Handle Sign In
signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("LOGIN SUCCESS! Response Data:", data);

      if (!data.access_token) {
        alert("Error: No access token received");
        return;
      }

      localStorage.setItem('token', data.access_token);

      const role = data.role ? data.role.toUpperCase() : "STUDENT"; // Default to STUDENT
      localStorage.setItem('role', role);

      console.log("Redirecting for role:", role);

      if (role === 'ADMIN') {
        console.log("Going to /admin");
        window.location.href = '/admin';
      } else {
        console.log("Going to /student");
        window.location.href = '/student';
      }
    } else {
      const data = await response.json();
      console.error("LOGIN FAILED:", data);
      alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
    }
  } catch (error) {
    console.error('CRITICAL JS ERROR:', error);
    alert('An error occurred. Please check the browser console.');
  }
});
