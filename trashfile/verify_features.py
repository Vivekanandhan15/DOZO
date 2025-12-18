import urllib.request
import json
import time
from datetime import date

BASE_URL = "http://127.0.0.1:8000"

class APIClient:
    def __init__(self, name, email, password, role):
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.token = None
        self.user_id = None 

    def request(self, method, endpoint, data=None):
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f"Bearer {self.token}"
        
        body = json.dumps(data).encode('utf-8') if data else None
        
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                if response.status == 204:
                    return response.status, {}
                return response.status, json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            content = e.read().decode('utf-8')
            try:
                return e.code, json.loads(content)
            except json.JSONDecodeError:
                print(f"Non-JSON Error Response ({e.code}): {content}")
                return e.code, {}
        except urllib.error.URLError as e:
            print(f"URL Error: {e.reason}")
            return 0, str(e.reason)

    def signup(self):
        print(f"[{self.role}] Signing up {self.email}...")
        signup_data = {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "phone": "1234567890",
            "role": self.role
        }
        status, body = self.request("POST", "/users/signup", signup_data)
        if status == 200:
            print(f"  Success: User created. ID: {body['user_id']}")
            self.user_id = body['user_id']
        elif status == 400 and "Email already exists" in str(body):
            print("  User already exists. (Warning: ID unknown)")
        else:
            print(f"  Failed: {status} {body}")

    def login(self):
        print(f"[{self.role}] Logging in {self.email}...")
        login_data = {"email": self.email, "password": self.password}
        status, body = self.request("POST", "/auth/login", login_data)
        if status == 200:
            self.token = body['access_token']
            print("  Success: Token received.")
        else:
            print(f"  Failed: {status} {body}")
            exit(1)

def run_verification():
    print("=== Starting Feature Verification ===")
    ts = int(time.time())
    
    # 1. Setup Users
    admin = APIClient("Admin User", f"admin_{ts}@example.com", "pass123", "ADMIN")
    teacher = APIClient("Teacher User", f"teacher_{ts}@example.com", "pass123", "TEACHER")
    student = APIClient("Student User", f"student_{ts}@example.com", "pass123", "STUDENT")

    for u in [admin, teacher, student]:
        u.signup()
        u.login()
        if not u.user_id:
            print(f"Critical: No User ID for {u.role}. Exiting.")
            return

    # 2. Batches (Admin)
    print("\n--- Batches ---")
    batch_data = {
        "name": f"Batch {ts}", 
        "start_date": str(date.today()),
        "end_date": str(date.today()),
        "teacher_id": teacher.user_id
    }
    status, batch_body = admin.request("POST", "/batches/", batch_data)
    if status == 200:
        if 'id' in batch_body:
            batch_id = batch_body['id']
        elif 'batch_id' in batch_body:
            batch_id = batch_body['batch_id']
        else:
            print(f"Error: No ID in batch response: {batch_body}")
            return
        print(f"Batch created: {batch_id} - {batch_body.get('name')}")
    else:
        print(f"Batch creation failed: {status} {batch_body}")
        return

    # 3. Students (Admin adds Student Profile)
    print("\n--- Students ---")
    student_data = {
        "user_id": student.user_id,
        "roll_no": f"R-{ts}",
        "parent_contact": "9999999999",
        "admission_date": str(date.today())
    }
    status, student_profile = admin.request("POST", "/students/", student_data)
    if status == 200:
        if 'student_id' in student_profile:
            student_id = student_profile['student_id']
        elif 'id' in student_profile:
             student_id = student_profile['id']
        else: 
            student_id = student_profile.get('student_id')
        print(f"Student profile created for User {student.user_id}, Student ID: {student_id}")
    else:
        print(f"Student profile failed: {status} {student_profile}")
        return

    # 4. Enrollment (Admin enrolls Student to Batch)
    print("\n--- Enrollment ---")
    # Schema EnrollStudent: student_id: int, batch_id: int
    enroll_data = {"student_id": student_id, "batch_id": batch_id}
    status, enroll_res = admin.request("POST", "/enrollment/", enroll_data)
    if status == 200:
        print(f"Enrolled Student ID {student_id} to Batch {batch_id}")
    else:
        print(f"Enrollment failed: {status} {enroll_res}")

    # 5. Assignments (Teacher creates)
    print("\n--- Assignments ---")
    assign_data = {
        "title": "HW 1",
        "description": "Do it",
        "batch_id": batch_id,
        "due_date": str(date.today()),
        "points": 100
    }
    status, assign_res = teacher.request("POST", "/assignments/", assign_data)
    if status == 200:
        # Schema AssignmentOut: assignment_id
        if 'assignment_id' in assign_res:
             assign_id = assign_res['assignment_id']
        else:
             assign_id = assign_res.get('id')
        print(f"Assignment created: {assign_id}")
    else:
        print(f"Assignment failed: {status} {assign_res}")
        return

    # 6. Submissions (Student submits)
    print("\n--- Submissions ---")
    sub_data = {
        "assignment_id": assign_id,
        "file_url": "http://sub.com/1"
    }
    status, sub_res = student.request("POST", "/submissions/", sub_data)
    if status == 200:
        # Returns Submission object. assume id.
        sub_id = sub_res.get('submission_id') or sub_res.get('id')
        print(f"Submission successful: {sub_id}")
        if not sub_id:
             print("Warning: No submission ID returned")
             sub_id = 1 # Fallback to guess
    else:
        print(f"Submission failed: {status} {sub_res}")
        return
    
    # 7. Grading (Teacher grades)
    print("\n--- Grading ---")
    grade_data = {"grade": 95, "feedback": "Good job"}
    status, grade_res = teacher.request("PUT", f"/submissions/{sub_id}", grade_data)
    if status == 200:
        print(f"Graded submission {sub_id}: {grade_res.get('grade')}")
    else:
        print(f"Grading failed: {status} {grade_res}")

    # 8. Attendance (Teacher marks)
    print("\n--- Attendance ---")
    # Mark single student as per schema
    att_data = {
        "batch_id": batch_id,
        "student_id": student_id,
        "status": "PRESENT",
        "date": str(date.today())
    }
    status, att_res = teacher.request("POST", "/attendance/", att_data)
    if status == 200:
        print("Attendance marked.")
    elif status == 400 and "Already marked" in str(att_res):
            print("Attendance already marked.")
    else:
        print(f"Attendance failed: {status} {att_res}")

    # 9. Leaves (Student applies)
    print("\n--- Leaves ---")
    leave_data = {
        "date": str(date.today()),
        "reason": "Sick"
    }
    status, leave_res = student.request("POST", "/leaves/", leave_data)
    if status == 200:
        leave_id = leave_res.get('leave_id') or leave_res.get('id')
        print(f"Leave applied: {leave_id}")
        
        # Approve
        status, app_res = teacher.request("PUT", f"/leaves/{leave_id}", {"status": "APPROVED"})
        if status == 200:
            print("Leave approved.")
        else:
            print(f"Leave approval failed: {status} {app_res}")
    else:
        print(f"Leave application failed: {status} {leave_res}")

    # 10. Announcements (Teacher creates)
    print("\n--- Announcements ---")
    ann_data = {
        "title": "News",
        "content": "Hello",
        "expiry_date": str(date.today()),
        "batch_id": batch_id
    }
    status, ann_res = teacher.request("POST", "/announcements/", ann_data)
    if status == 200:
        ann_id = ann_res.get('id') or ann_res.get('announcement_id') # Model usually has id
        print(f"Announcement created: {ann_id}")
    else:
        print(f"Announcement failed: {status} {ann_res}")

if __name__ == "__main__":
    run_verification()
