# Library Management System - API Documentation

Because the current implementation is a static frontend prototype, this document outlines the **theoretical REST API design** intended to be implemented in the backend (using a framework like ASP.NET Core, Laravel, or Django) to meet the requirements of Phase 4 of the Lab Manual.

## 1. REST Principles

### 1.1 REST Statelessness
Our API follows the REST constraint of statelessness. This means that every HTTP request from the client to the server must contain all the necessary information for the server to understand and process the request. The server does not store any session state about the client on the server side between requests. 

This accelerates development and improves scalability because any server instance can handle any incoming request without needing synchronized session data. Authentication is typically handled via a token (e.g., JWT) included in every request header, rather than a server-side session variable.

### 1.2 Scaffolding and Development Acceleration
Using an MVC framework's scaffolding tools dramatically accelerates development by automatically generating the boilerplate code (Controllers, Views, and Models) required for standard CRUD operations. Instead of manually writing repetitive HTML forms, routing logic, and database query methods for both the `Book` and `Member` entities, the scaffolding generator reads the model definitions and outputs fully functional base code. This reduces human error, ensures consistent architecture, and allows developers to focus on custom business logic and UI refinement immediately.

### 1.3 Idempotency
An HTTP method is considered **Idempotent** if making multiple identical requests has the same effect on the server's state as making a single request. 
- **GET, PUT, DELETE** are idempotent. For example, deleting a resource that is already deleted leaves the state exactly the same as the first deletion.
- **POST** is *not* idempotent. If you send a POST request multiple times, you will create multiple distinct records in the database.

---

## 2. API Endpoint Design

The following table documents the URI structure for the Library Management System. It strictly adheres to REST standard conventions, utilizing plural nouns representing the resources rather than verbs.

### Books Endpoints

| URI | HTTP Method | Description | Idempotent |
|-----|-------------|-------------|:---:|
| `/api/books` | **GET** | Retrieves a list of all books in the catalog. | Yes |
| `/api/books/{id}` | **GET** | Retrieves the specific details of a single book by its ID. | Yes |
| `/api/books` | **POST** | Creates a new book record in the catalog. | **No** |
| `/api/books/{id}` | **PUT** | Updates an existing book record with entirely new data. | Yes |
| `/api/books/{id}` | **DELETE** | Removes the specific book from the catalog. | Yes |

### Members Endpoints

| URI | HTTP Method | Description | Idempotent |
|-----|-------------|-------------|:---:|
| `/api/members` | **GET** | Retrieves a list of all registered library members. | Yes |
| `/api/members/{id}` | **GET** | Retrieves the details of a specific member by their ID. | Yes |
| `/api/members` | **POST** | Registers a new member in the system. | **No** |
| `/api/members/{id}` | **PUT** | Updates the profile details of an existing member. | Yes |
| `/api/members/{id}` | **DELETE** | Removes the member from the system. | Yes |

### Hierarchical Relationships (Demonstration)

To demonstrate hierarchical REST structure, the follow endpoints handle relationships between Members and the Books they interact with.

| URI | HTTP Method | Description | Idempotent |
|-----|-------------|-------------|:---:|
| `/api/members/{id}/borrowed-books` | **GET** | Retrieves a list of books currently borrowed by a specific member. | Yes |
| `/api/members/{id}/borrowed-books` | **POST** | Assigns (checks out) a book to the specific member. | **No** |
