-- ========================
-- Nivaran Database Schema
-- ========================

-- Users table (citizens, officers, admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table (AI-routed grievances)
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),

  -- AI routing fields
  department VARCHAR(255) DEFAULT 'Unassigned',
  ai_confidence FLOAT DEFAULT 0,
  ai_status VARCHAR(100) DEFAULT 'Pending',

  -- Assignment & status
  assigned_to INT REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint updates (audit trail of status changes)
CREATE TABLE complaint_updates (
  id SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  comment TEXT,
  image_url TEXT,
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);