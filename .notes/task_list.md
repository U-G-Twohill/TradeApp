# Task List

## High Priority
- [ ] **Project Setup & Configuration**  
  **Status:** In Progress  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Initialize repository, create initial file structure, and set up CI/CD pipeline.
  **Sub-tasks:**
  - [x] Initialize Git repository
  - [x] Configure basic CI/CD pipeline (GitHub Actions)
    - [x] Set up linting workflow
    - [x] Set up testing workflow
    - [x] Set up build workflow
    - [ ] Set up deployment workflow
  - [x] Set up backend project structure (Node.js/Express)
    - [x] Initialize Node.js project with TypeScript
    - [x] Set up basic Express server
    - [x] Configure middleware and error handling
    - [x] Set up logging system
    - [x] Create initial API endpoints (health check)
    - [x] Set up database connection
    - [x] Create initial database schemas
    - [x] Configure TypeORM entities
    - [x] Run and verify initial database migration
    - [x] Implement user authentication
    - [x] Test authentication endpoints
    - [ ] Implement core API routes for tasks/users
  - [ ] Set up mobile project structure (React Native)
  - [ ] Set up web project structure (React)
  - [x] Configure TypeScript for all projects
  - [x] Set up ESLint and Prettier

- [ ] **Database Schema Design**  
  **Status:** Next Up  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Outline tables/collections for tasks, user profiles, and ratings.
  **Sub-tasks:**
  - [ ] Design user profile schema
  - [ ] Design task/job schema
  - [ ] Design rating/review schema
  - [ ] Create database migration system
  - [ ] Set up test database

- [ ] **Define Core Documents**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Create and refine `project_overview.md`, `task_list.md`, and `.cursorrules`.

- [ ] **Core Task Management UI**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Build initial screens for creating, viewing, and updating tasks.

## Medium Priority
- [ ] **Authentication Module**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Implement user registration, login, and secure session management.

- [ ] **API Endpoints for Tasks**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Develop RESTful endpoints for CRUD operations on tasks.

- [ ] **Notification System**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Integrate a system to push real-time updates on task changes.

## Low Priority
- [ ] **User Collaboration Features**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Prototype functionality for connecting tradespeople and delegating tasks.

- [ ] **Rating & Review System**  
  **Status:** To Do  
  **Assigned To:** Self / AI Assistant  
  **Notes:** Design a rating system similar to Uber for peer feedback.

- [ ] **Client Access Module**  
  **Status:** To Do  
  **Assigned To:** Future Phase  
  **Notes:** Plan integration of client-specific features for future releases.

## Completed

## Next Steps
- [ ] **API Development**
  **Status:** Ready to Start
  **Sub-tasks:**
  - [ ] Create user management endpoints (CRUD)
    - [ ] GET /api/users (list users)
    - [ ] GET /api/users/:id (get user details)
    - [ ] PUT /api/users/:id (update user)
    - [ ] DELETE /api/users/:id (delete user)
  - [ ] Create task management endpoints (CRUD)
    - [ ] POST /api/tasks (create task)
    - [ ] GET /api/tasks (list tasks)
    - [ ] GET /api/tasks/:id (get task details)
    - [ ] PUT /api/tasks/:id (update task)
    - [ ] DELETE /api/tasks/:id (delete task)
  - [ ] Implement input validation
  - [ ] Add API documentation (Swagger/OpenAPI)
