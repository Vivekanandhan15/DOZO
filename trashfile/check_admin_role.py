import sqlite3

conn = sqlite3.connect('dozo.db')
cursor = conn.cursor()

# Check the admin user
cursor.execute("SELECT user_id, name, email, role FROM users WHERE email = 'admin@dozo.com'")
admin = cursor.fetchone()

if admin:
    print(f"Current admin user: {admin}")
    print(f"Role: {admin[3]}")
    
    # Update role to ADMIN if it's not
    if admin[3] != 'ADMIN':
        cursor.execute("UPDATE users SET role = 'ADMIN' WHERE email = 'admin@dozo.com'")
        conn.commit()
        print(f"Updated role from '{admin[3]}' to 'ADMIN'")
    else:
        print("Role is already ADMIN")
else:
    print("Admin user not found!")

conn.close()
