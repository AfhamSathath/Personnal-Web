-- ===================================
-- DATABASE CREATION
-- ===================================

CREATE DATABASE skillmatch ;
USE skillmatch;

-- ===================================
-- PERSONNEL TABLE
-- ===================================
CREATE TABLE personnel (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(255) DEFAULT NULL,
  experience ENUM('Junior','Mid-Level','Senior') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- SKILLS TABLE
-- ===================================
CREATE TABLE skills (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL
);

-- ===================================
-- PERSONNEL_SKILLS TABLE
-- ===================================
CREATE TABLE personnel_skills (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency ENUM('Beginner','Intermediate','Advanced','Expert') NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_personnel_skill (personnel_id, skill_id),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===================================
-- PROJECTS TABLE
-- ===================================
CREATE TABLE projects (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  status ENUM('Planning','Active','Completed') DEFAULT 'Planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================
-- PROJECT_SKILLS TABLE
-- ===================================
CREATE TABLE project_skills (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  skill_id INT NOT NULL,
  min_level ENUM('Beginner','Intermediate','Advanced','Expert') DEFAULT 'Beginner',
  UNIQUE KEY unique_project_skill (project_id, skill_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE ON UPDATE CASCADE
);
