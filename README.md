# UTRGV Degree Roadmap Platform

Developed for the Software Engineering course project at UTRGV.

## Project Description

The UTRGV Degree Roadmap Platform is a web application that helps students plan their path to graduation. Students will be able to enter courses they have already completed and receive a personalized roadmap showing remaining degree requirements and suggested future classes. The platform will also allow students to read and leave reviews about professors to help make better registration decisions.

---

## Problem

Many students struggle to determine which courses they still need, what order to take them in, and which professors to choose. Degree planning often requires checking multiple systems and manually tracking prerequisite chains.

---

## Proposed Solution

This platform will allow students to:

- Track completed courses
- View remaining degree requirements
- Generate a suggested degree roadmap
- Read and submit professor reviews

---

## Tech Stack

Frontend  
- Next.js  
- TypeScript  
- TailwindCSS  

Backend  
- FastAPI  
- Python  

Database  
- PostgreSQL  

Version Control  
- GitHub

---

## Repository Structure

## Repository Structure

```
utrgv-degree-roadmap
├── frontend    # Next.js application
├── backend     # FastAPI backend
├── docs        # planning documents
└── README.md
```
---

## Agile Planning

### User Stories

- As a student, I want to input completed courses so I can track my degree progress.
- As a student, I want to see remaining required courses so I know what to take next.
- As a student, I want to read professor reviews to help choose instructors.

### Sprint 1 Goal

Set up the repository, development environments, and initial project documentation.

## Sprint 2 Progress

The team has progressed from initial setup to early development of core application features.

- Set up and validated frontend development environment (Next.js)
- Set up and confirmed backend API (FastAPI) is running successfully
- Verified full-stack local development environment
- Fixed development issues related to Next.js build system (Turbopack/cache errors)
- Confirmed backend API accessibility through `/docs` endpoint
- Continued development of project structure and UI foundation

---

## Current Prototype Status

- Home page structure has been initialized
- Backend API is running locally and responding successfully
- Development environment for both frontend and backend is functional
- Project is ready for feature implementation and integration

---


## Testing Notes

- Backend API confirmed running at: `http://127.0.0.1:8000`
- API documentation available at: `http://127.0.0.1:8000/docs`
- Frontend development server runs successfully on local environment after dependency and cache reset