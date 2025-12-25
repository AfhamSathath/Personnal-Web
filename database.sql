CREATE DATABASE skillmatch;
USE skillmatch;

CREATE TABLE personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(100),
  experience ENUM('Junior','Mid-Level','Senior'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  description TEXT
);

CREATE TABLE personnel_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  personnel_id INT,
  skill_id INT,
  proficiency ENUM('Beginner','Intermediate','Advanced','Expert'),
  FOREIGN KEY (personnel_id) REFERENCES personnel(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planning','Active','Completed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  skill_id INT,
  min_level ENUM('Beginner','Intermediate','Advanced','Expert'),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
