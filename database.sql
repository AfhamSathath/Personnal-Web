-- ===================================
-- DATABASE
-- ===================================
CREATE DATABASE  skillmatch;
USE skillmatch;

-- ===================================
-- PERSONNEL TABLE
-- ===================================
CREATE TABLE personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(255),
  experience ENUM('Junior','Mid-Level','Senior') DEFAULT 'Junior',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- SKILLS TABLE
-- ===================================
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255) NOT NULL,
  description TEXT
);

-- ===================================
-- PERSONNEL ↔ SKILLS (WITH PROFICIENCY)
-- ===================================
CREATE TABLE personnel_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency ENUM('Beginner','Intermediate','Advanced','Expert') 
              NOT NULL DEFAULT 'Beginner',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (personnel_id, skill_id),

  FOREIGN KEY (personnel_id) REFERENCES personnel(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===================================
-- PROJECTS TABLE
-- ===================================
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planning','Active','Completed') DEFAULT 'Planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- PROJECT ↔ REQUIRED SKILLS
-- (Used in Project Page)
-- ===================================
CREATE TABLE project_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  skill_id INT NOT NULL,
  min_level ENUM('Beginner','Intermediate','Advanced','Expert')
            NOT NULL DEFAULT 'Beginner',

  UNIQUE (project_id, skill_id),

  FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id)
    ON DELETE CASCADE ON UPDATE CASCADE
);
