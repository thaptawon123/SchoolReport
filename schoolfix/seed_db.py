"""
Database Seeder Script for SchoolFix
Creates initial tables and seeds realistic data for testing roles:
- Admin: somchai_admin / admin1234
- Teacher: teacher_wilai / teacher1234
- Teacher: teacher_nopadol / teacher1234
- Technician: tech_prasert / tech1234
- Technician: tech_kamol / tech1234
"""

import sqlite3
import os
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'schoolfix.db'
SCHEMA_PATH = BASE_DIR / 'schema.sql'

def hash_pw(password: str) -> str:
    """Generate Werkzeug-compatible pbkdf2:sha256 format or fallback standard hash."""
    try:
        from werkzeug.security import generate_password_hash
        return generate_password_hash(password)
    except ImportError:
        import base64
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        salt_b64 = base64.b64encode(salt).decode('ascii')
        key_b64 = base64.b64encode(key).decode('ascii')
        return f"pbkdf2:sha256:100000${salt_b64}${key_b64}"

def seed_database():
    print(f"[*] Initializing SchoolFix Database at: {DB_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    conn.executescript(schema_sql)
    cursor = conn.cursor()

    # Check if users already exist
    cursor.execute("SELECT COUNT(*) FROM users;")
    if cursor.fetchone()[0] > 0:
        print("[!] Database already contains users. Skipping seed.")
        conn.close()
        return

    print("[*] Seeding Test Users...")
    users = [
        # (username, password, fullname, email, role, department, phone)
        ('somchai_admin', hash_pw('admin1234'), 'นายสมชาย ดูแลดี (Admin)', 'somchai.admin@school.ac.th', 'admin', 'ฝ่ายบริหารงานทั่วไปและอาคารสถานที่', '081-234-5678'),
        ('teacher_wilai', hash_pw('teacher1234'), 'ครูวิไล สอนศิลป์ (Teacher)', 'wilai.art@school.ac.th', 'teacher', 'กลุ่มสาระการเรียนรู้ศิลปะ', '082-345-6789'),
        ('teacher_nopadol', hash_pw('teacher1234'), 'ครูนภดล วิทยา (Teacher)', 'nopadol.sci@school.ac.th', 'teacher', 'กลุ่มสาระการเรียนรู้วิทยาศาสตร์', '083-456-7890'),
        ('tech_prasert', hash_pw('tech1234'), 'นายประเสริฐ ซ่อมไว (Technician)', 'prasert.fix@school.ac.th', 'technician', 'หน่วยงานซ่อมบำรุงไฟฟ้าและปรับอากาศ', '084-567-8901'),
        ('tech_kamol', hash_pw('tech1234'), 'นายกมล ไอทีเทพ (Technician)', 'kamol.it@school.ac.th', 'technician', 'ศูนย์เทคโนโลยีและคอมพิวเตอร์', '085-678-9012')
    ]

    cursor.executemany("""
        INSERT INTO users (username, password_hash, fullname, email, role, department, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, users)

    print("[*] Seeding Sample Repair Requests...")
    now = datetime.utcnow()
    y_m = now.strftime('%Y%m')

    # Sample requests representing different workflow states
    requests = [
        # (request_no, user_id, building, room, problem_type, description, urgency, status, assigned_to, due_date, completion_date, cost, result)
        (
            f"RP-{y_m}-001", 2, "อาคาร 2 (เฉลิมพระเกียรติ)", "ห้อง 224", "aircon",
            "เครื่องปรับอากาศไม่เย็น มีน้ำหยดลงบนโต๊ะนักเรียน ส่งเสียงดังผิดปกติ",
            "high", "completed", 4,
            (now - timedelta(days=2)).strftime('%Y-%m-%d'),
            (now - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S'),
            450.00, "ล้างแอร์ เติมน้ำยา R32 และเปลี่ยนท่อน้ำทิ้งที่อุดตัน ทดสอบแล้วเย็นสม่ำเสมอ"
        ),
        (
            f"RP-{y_m}-002", 2, "อาคารศิลปะ", "ห้องปฏิบัติการ 1", "electrical",
            "ไฟนีออนเพดานกระพริบ 2 ดวง และปลั๊กไฟติดผนังด้านหน้าห้องไม่มีไฟ",
            "medium", "in_progress", 4,
            (now + timedelta(days=2)).strftime('%Y-%m-%d'),
            None, 0.0, None
        ),
        (
            f"RP-{y_m}-003", 3, "อาคารวิทยาศาสตร์", "ห้องคอมพิวเตอร์ 3", "computer",
            "เครื่องคอมพิวเตอร์ประจำโต๊ะครูเปิดไม่ติด พาวเวอร์ซัพพลายมีกลิ่นไหม้",
            "high", "accepted", 5,
            (now + timedelta(days=1)).strftime('%Y-%m-%d'),
            None, 0.0, None
        ),
        (
            f"RP-{y_m}-004", 3, "อาคาร 1", "ห้องพักครูวิทย์ 105", "furniture",
            "ขาเก้าอี้หมุนสำนักงานหัก 1 ขา และรางเลิ้นชักโต๊ะทำงานหลุด",
            "low", "pending", None,
            None, None, 0.0, None
        ),
        (
            f"RP-{y_m}-005", 2, "อาคารหอประชุม", "ห้องควบคุมเสียง", "other",
            "กลอนประตูด้านข้างชำรุด ปิดล็อคจากข้างในไม่ได้",
            "medium", "pending", None,
            None, None, 0.0, None
        )
    ]

    cursor.executemany("""
        INSERT INTO repair_requests 
        (request_no, user_id, building, room, problem_type, description, urgency, status, assigned_to, due_date, completion_date, cost, result)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, requests)

    # Seed status history
    history_records = [
        # RP-001 (pending -> accepted -> in_progress -> completed)
        (1, None, 'pending', 2, 'สร้างใบแจ้งซ่อมใหม่'),
        (1, 'pending', 'accepted', 1, 'มอบหมายงานให้ช่างประเสริฐ'),
        (1, 'accepted', 'in_progress', 4, 'ช่างประเสริฐรับเรื่องและเตรียมอุปกรณ์'),
        (1, 'in_progress', 'completed', 4, 'ปิดงานซ่อมเรียบร้อย ค่าใช้จ่าย 450.00 บาท'),

        # RP-002 (pending -> accepted -> in_progress)
        (2, None, 'pending', 2, 'สร้างใบแจ้งซ่อมใหม่'),
        (2, 'pending', 'accepted', 1, 'มอบหมายให้ช่างประเสริฐ'),
        (2, 'accepted', 'in_progress', 4, 'เริ่มตรวจเช็คแผงสวิตช์และหลอดไฟ'),

        # RP-003 (pending -> accepted)
        (3, None, 'pending', 3, 'แจ้งซ่อมคอมพิวเตอร์'),
        (3, 'pending', 'accepted', 1, 'มอบหมายให้ช่างกมล ไอที'),

        # RP-004 & 005 (pending)
        (4, None, 'pending', 3, 'แจ้งซ่อมเก้าอี้และโต๊ะ'),
        (5, None, 'pending', 2, 'แจ้งซ่อมประตูด้านข้าง')
    ]

    cursor.executemany("""
        INSERT INTO repair_status_history (repair_id, old_status, new_status, changed_by, remark)
        VALUES (?, ?, ?, ?, ?);
    """, history_records)

    # Seed sample comments
    comments = [
        (1, 4, "กำลังนำบันไดและชุดล้างแอร์ขึ้นไปห้อง 224 ครับ"),
        (1, 2, "ขอบคุณมากค่ะ แอร์ใช้งานได้เย็นสบายแล้ว"),
        (2, 4, "กำลังเบิกหลอด LED T8 มาเปลี่ยนแทนหลอดเดิมครับ"),
        (3, 5, "พรุ่งนี้เช้าจะนำเพาเวอร์ซัพพลายสำรอง 550W ไปเปลี่ยนให้ครับ")
    ]

    cursor.executemany("""
        INSERT INTO comments (repair_id, user_id, comment)
        VALUES (?, ?, ?);
    """, comments)

    conn.commit()
    conn.close()
    print("[✓] SchoolFix Database seeded successfully!")

if __name__ == '__main__':
    seed_database()
