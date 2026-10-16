-- ==============================================================================
-- SchoolFix SQLite Database Schema
-- Designed following OOAD & OOP Domain Specifications
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Admin, Teacher, Technician)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'teacher' CHECK(role IN ('admin', 'teacher', 'technician')),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Repair Requests Table (Work Orders)
CREATE TABLE IF NOT EXISTS repair_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_no VARCHAR(30) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    building VARCHAR(100) NOT NULL,
    room VARCHAR(50) NOT NULL,
    problem_type VARCHAR(50) NOT NULL DEFAULT 'other' 
        CHECK(problem_type IN ('electrical', 'aircon', 'computer', 'furniture', 'other')),
    description TEXT NOT NULL,
    urgency VARCHAR(20) NOT NULL DEFAULT 'medium' 
        CHECK(urgency IN ('low', 'medium', 'high')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' 
        CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed')),
    assigned_to INTEGER NULL,
    due_date DATE NULL,
    completion_date TIMESTAMP NULL,
    cost REAL NULL DEFAULT 0.0 CHECK(cost >= 0.0),
    result TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_repairs_request_no ON repair_requests(request_no);
CREATE INDEX IF NOT EXISTS idx_repairs_user_id ON repair_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_repairs_assigned_to ON repair_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repairs_problem_type ON repair_requests(problem_type);

-- 3. Repair Images Table (Before / After Photos)
CREATE TABLE IF NOT EXISTS repair_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repair_id INTEGER NOT NULL,
    image_type VARCHAR(20) NOT NULL DEFAULT 'before' CHECK(image_type IN ('before', 'after')),
    image_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repair_id) REFERENCES repair_requests(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_repair_id ON repair_images(repair_id);

-- 4. Comments Table (Communication on Requests)
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repair_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repair_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_repair_id ON comments(repair_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 5. Repair Status History Table (Audit Log & Timeline)
CREATE TABLE IF NOT EXISTS repair_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repair_id INTEGER NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by INTEGER NULL,
    remark VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repair_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_history_repair_id ON repair_status_history(repair_id);
