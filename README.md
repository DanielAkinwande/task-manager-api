# Taskflow – Task Management Application

A full-stack task management application built with **FastAPI, PostgreSQL, and vanilla JavaScript**. Taskflow allows users to create accounts, authenticate securely, and manage their personal tasks through a simple web interface.

## 🚀 Live Demo

**[Open Taskflow](https://task-manager-api-5-am97.onrender.com)**

**Backend API:** [Taskflow API](https://task-manager-api-kkxl.onrender.com)

**API Documentation:** [Interactive Swagger Docs](https://task-manager-api-kkxl.onrender.com/docs)

## ✨ Features

- **User Registration:** Create a personal account.
- **Authentication:** Secure login using JWT-based authentication.
- **Password Security:** Password hashing for secure credential storage.
- **Task Management:** Create, view, update, and delete tasks.
- **User-specific Tasks:** Users can only access and manage their own tasks.
- **PostgreSQL Database:** Persistent data storage.
- **REST API:** Backend endpoints built with FastAPI.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| PostgreSQL | Database |
| SQLAlchemy | Database ORM |
| JWT | Authentication |
| HTML | Frontend structure |
| CSS | Styling |
| JavaScript | Frontend functionality |
| Neon | Cloud database hosting |
| Render | Application deployment |

## 🏗️ Architecture

Taskflow uses a frontend-backend architecture.

1. The frontend provides the user interface.
2. JavaScript communicates with the backend through HTTP requests.
3. FastAPI processes requests and handles authentication.
4. SQLAlchemy communicates with PostgreSQL.
5. JWT tokens protect authenticated endpoints.

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health check |
| POST | `/users` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/me` | Get authenticated user details |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | Retrieve user's tasks |
| GET | `/tasks/{task_id}` | Retrieve a specific task |
| PUT | `/tasks/{task_id}` | Update a task |
| DELETE | `/tasks/{task_id}` | Delete a task |

Interactive API documentation is available at `/docs`.

## 💻 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/DanielAkinwande/task-manager-api.git
cd task-manager-api
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

**Windows PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

**Linux/macOS**
```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_connection_string
SECRET_KEY=your_secret_key
```

Replace the placeholder values with your own credentials. Never commit your `.env` file.

### 5. Start the backend

```bash
uvicorn main:app --reload
```

The API will be available at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 6. Run the frontend

Open `task-manager-frontend/index.html` using a local development server, such as the VS Code Live Server extension.

## 🔐 Security

- Passwords are hashed before storage.
- JWT authentication protects private endpoints.
- Task operations are scoped to the authenticated user.
- Sensitive configuration is stored in environment variables.

## 🌍 Deployment

- **Frontend:** Render Static Site
- **Backend:** Render Web Service
- **Database:** Neon PostgreSQL

## 📌 Future Improvements

- Task deadlines and priority levels.
- Task search and filtering.
- Improved responsive design.
- Automated testing.
- Task completion statistics.

## 👨‍💻 Author

**Daniel Akinwande**

Computer Science Student | Backend Development | Cloud & Networking

- GitHub: [@DanielAkinwande](https://github.com/DanielAkinwande)
- LinkedIn: [Daniel Akinwande](https://linkedin.com/in/daniel-akinwande-302155309)

---

*Built as a hands-on project to develop practical skills in backend development, database management, authentication, and full-stack application deployment.*
