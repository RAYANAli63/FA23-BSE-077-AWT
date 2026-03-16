# Lab Assignment Manual: Library Management System – MVC Web Application

**Course:** Undergraduate Web Development  
**Topic:** MVC Frameworks, Scaffolding, Bootstrap UI, and REST API Design  
**Total Points:** 100  

---

## 1. Project Scenario

Welcome to the **Digital Library Management System** project. 

In this lab, you are stepping into the role of a Full-Stack Web Developer. The University Library has commissioned you to build a modern, web-based system to manage their expanding collection of books and their registered library members. Your goal is to create a functional prototype using a Model-View-Controller (MVC) framework of your choice (e.g., ASP.NET Core, Laravel, or Django).

You will rapidly generate the data interfaces using the framework's scaffolding features, stylize the user interface using the responsive Bootstrap CSS framework, and critically design and document a RESTful architectural pattern for the system's endpoints.

---

## 2. Prerequisites

Before starting this lab, ensure you have the following installed on your machine:
- **IDE/Code Editor:** Visual Studio, Visual Studio Code, PHPStorm, or PyCharm.
- **Web Framework Environment:** 
  - *ASP.NET Core:* .NET SDK 6.0+
  - *Laravel:* PHP 8.1+, Composer, Node.js
  - *Django:* Python 3.9+
- **Database:** SQLite (Default for most MVC environments) or SQL Server/MySQL.
- **Frontend Toolkit:** Bootstrap 5 (via CDN or npm).

---

## 3. Step-by-Step Implementation Guide

### Phase 1: Environment Setup

**Objective:** Initialize your MVC project and configure the local development environment.

1. **Create the Project:**
   Use your framework's CLI tool to generate a new MVC application.
   - *Example (ASP.NET Core):* `dotnet new mvc -n LibraryManagementSystem`
   - *Example (Laravel):* `composer create-project laravel/laravel LibraryManagementSystem`
   - *Example (Django):* `django-admin startproject LibraryManagementSystem`
2. **Database Configuration:** Configure the database connection string in your environment configuration file (`appsettings.json`, `.env`, or `settings.py`).
3. **Verify Setup:** Run the development server and ensure the default welcome page loads on `localhost`.

### Phase 2: Creating Models and Scaffolding CRUD

**Objective:** Define the core data structures and use scaffolding to generate views and controllers.

1. **Create the `Book` Model:**
   Define properties: `Id` (Primary Key), `Title`, `Author`, `ISBN`, `PublishedYear`, and `IsAvailable` (Boolean).
2. **Create the `Member` Model:**
   Define properties: `Id` (Primary Key), `FirstName`, `LastName`, `Email`, and `JoinDate`.
3. **Database Migration:** Run your framework's migration commands to create the corresponding tables in your database.
4. **Scaffold CRUD Interfaces:**
   Use your framework's view generator (scaffolding) to automatically create controllers and views supporting Create, Read, Update, and Delete operations for both `Book` and `Member`.
   - *Example (ASP.NET):* `dotnet aspnet-codegenerator controller -name BooksController -m Book -dc LibraryContext --relativeFolderPath Controllers --useDefaultLayout --referenceScriptLibraries`
5. **Expected Output:** You should now have fully functional web pages that allow you to add, view, edit, and delete books and members without writing the boilerplate HTML/backend logic yourself.

> **Written Requirement:** In your documentation, include a short paragraph explaining *how scaffolding accelerates development* (e.g., standardizing boilerplate code, reducing human error, and speeding up early prototyping).

### Phase 3: Bootstrap UI Integration

**Objective:** Upgrade the auto-generated views into a clean, modern, and responsive user interface using Bootstrap.

1. **Bootstrap Setup:** Include Bootstrap in your main layout file (`_Layout.cshtml`, `app.blade.php`, or `base.html`) via CDN if it is not already included.
2. **Bootstrap Navbar:** 
   Replace the default navigation with a modern Bootstrap Navbar (`navbar-expand-lg`, `navbar-dark bg-primary`). Include links to the Home, Books, and Members pages.
3. **Responsive Grid Layout:** 
   Use the **Bootstrap 12-column grid system** (`container`, `row`, `col-md-6`, etc.) to structure your pages. Ensure that the layout adapts gracefully to mobile devices.
4. **Bootstrap Cards:**
   Modify the "Read/List" view for Books. Instead of a standard HTML table, display each book using a **Bootstrap Card** (`card`, `card-body`, `card-title`).
5. **Styled Forms and Buttons:**
   Update all Create and Edit forms. Use `form-control` for input fields and style all actions using Bootstrap buttons (e.g., `btn-primary` for Create/Save, `btn-warning` for Edit, `btn-danger` for Delete).
6. **Expected Output:** A polished, mobile-friendly application that reflects professional design standards without writing custom CSS.

### Phase 4: REST API Design and Documentation

**Objective:** Design and document the URI structure strictly following RESTful architectural principles. 

1. **Map UI Actions to HTTP Methods:**
   In your documentation, cleanly map the CRUD actions of your application to the appropriate HTTP methods:
   - **GET:** Retrieve a list of resources or a single resource.
   - **POST:** Create a new resource.
   - **PUT:** Update an existing resource.
   - **DELETE:** Remove a resource.
2. **Resource and URI Design:**
   Design your endpoints adhering to strict REST constraints:
   - URIs **must** use plural nouns (e.g., `/books`, not `/book`).
   - Verbs are **prohibited** in URIs (e.g., do not use `/get-books` or `/create-member`).
   - Demonstrate a hierarchical structure for relationships (e.g., `/members/{id}/borrowed-books`).

3. **API Endpoint List:**
   Create a table documenting your system's API endpoints. Include standard CRUD endpoints for Books and Members.

   *Example representation:*
   | URI | HTTP Method | Description | Idempotent |
   |-----|-------------|-------------|------------|
   | `/books` | GET | Retrieve a list of all books | Yes |
   | `/books` | POST | Add a new book to the library | No |
   | `/books/{id}` | PUT | Update the details of a specific book | Yes |
   | `/members/{id}/borrowed-books`| GET | Retrieve books borrowed by a member | Yes |

4. **Written REST Principles Explanation:**
   In your final document, provide a short written explanation of:
   - **REST Statelessness:** Explain how client-server communication is handled without storing session state on the server.
   - **Idempotency:** Define what it means for an endpoint to be Idempotent, and explain *why* GET, PUT, and DELETE are idempotent while POST is not.

---

## 4. Deliverables

Students must submit a single compressed file (`.zip`) containing the following:

1. **Source Code:** The entire project folder (excluding build artifacts like `node_modules` or `bin`/`obj`). Ensure database migrations are included.
2. **Screenshots:** A PDF containing screenshots of the working system, specifically demonstrating the Bootstrap Grid, Cards, Navbar, and styled Forms.
3. **API Documentation & Explanations:** A PDF or Markdown document containing:
   - The API endpoint table.
   - The brief explanation of how scaffolding accelerates development.
   - The written explanation of REST Statelessness and Idempotency.

---

## 5. Grading Rubric (100 Points Total)

Your lab will be graded according to the following criteria:

| Category | Description | Points |
|----------|-------------|--------|
| **1. Models & MVC Implementation** | `Book` and `Member` models are accurately defined. The MVC framework is properly configured. | 15 |
| **2. Scaffolding Usage** | CRUD interfaces for Books and Members are successfully scaffolded. Explanation of scaffolding provided. | 15 |
| **3. Bootstrap Integration (Layout)** | Effectively implements the 12-column grid system and responsive Navbar. Layout is clean and modern. | 10 |
| **4. Bootstrap Integration (Components)**| Books displayed using Bootstrap Cards. Forms and buttons utilize modern Bootstrap styling. | 15 |
| **5. REST Method Selection & Design** | Validation of GET, POST, PUT, DELETE methods. URIs use plural nouns exclusively, avoiding verbs. | 15 |
| **6. Idempotency & Statelessness** | Accurate written explanation of REST Statelessness and clear justification of Idempotent endpoints. | 10 |
| **7. API Documentation** | The API endpoint table is complete, demonstrating proper hierarchy and accurate HTTP method mapping. | 10 |
| **8. Code Organization & Submission**| Code is clean, logically separated. All deliverables (Code, Screenshots, Written Responses) are included. | 10 |
| **Total** | | **100** |

**Instructor Note:** Start early, plan your URI mappings thoroughly before writing the code, and ensure you run your application at different screen sizes to verify your Bootstrap grid layout. Good luck!
