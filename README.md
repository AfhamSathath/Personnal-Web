# Personnel Skill Matching System

This is a **full-stack web application** built to help small consultancies and tech teams manage their people, track skills, and easily find the **right team members for the right projects**.

Instead of guessing who fits a project, the system uses real data and a simple matching algorithm to recommend the most suitable personnel.



## What This Project Does

As teams grow, it becomes harder to remember:

* Who knows what
* How strong each person is in a skill
* Who is best suited for an upcoming project

This application solves that problem by:

* Storing personnel and skill data in one place
* Allowing skills to be assigned with proficiency levels
* Letting projects define required skills
* Automatically matching the best people to projects



## Main Features

* Create, update, and manage personnel profiles
* Create and manage skills
* Assign skills to personnel with proficiency levels
* Create projects and define required skills
* Automatically match personnel to projects
* Identify skill gaps
* Clean and easy-to-understand UI



## Tech Stack

**Frontend**

* React (Hooks)
* Axios
* React Router
* Tailwind CSS

**Backend**

* Node.js
* Express.js
* MySQL

**Tools**

* Postman
* Git



## Project Structure


Personnal Web/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── db.js
│   │   ├── app.js
│   │   └── server.js
│   └── database.sql
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│
└── README.md


The project is structured in a way that’s easy to understand and easy to scale.



##How Matching Works

Each project defines the skills it needs and the **minimum level** required.

Each person has skills with levels:

* Beginner
* Intermediate
* Advanced
* Expert

The system:

1. Checks if a person has all required skills
2. Verifies their skill level meets the minimum requirement
3. Calculates a score based on skill strength
4. Ranks people from best match to least match

This way, only **qualified people** are suggested.



##Extra Features

# Skill Gap Analysis

Shows which skills are missing or weak for a project.
This helps teams decide whether to train someone or hire externally.

#Utilization View

Simple visual view of how busy each person is, making planning easier.



##Database Design

The database is fully normalized and includes:

* Personnel
* Skills
* Personnel–Skills relationship with proficiency
* Projects
* Project–Skills requirements

Foreign keys and constraints are used to keep the data clean and reliable.



## How to Run the Project

### Backend
bash
cd backend
npm install
npm start


### Frontend
bash
cd frontend
npm install
npm run dev




## API Testing

All APIs were tested using Postman, including:

* Creating personnel
* Assigning skills
* Creating projects
* Matching personnel to projects

Screenshots are included in the repository.



Why This Project Matters

This isn’t just another CRUD app.

It shows:

* Real-world database relationships
* Practical backend logic
* Thoughtful frontend design
* How to solve a real business problem using code



Author

**Afham Sathath**

