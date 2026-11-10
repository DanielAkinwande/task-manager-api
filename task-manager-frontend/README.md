# Taskflow frontend

A responsive vanilla HTML/CSS/JavaScript frontend for the FastAPI + PostgreSQL task manager API.

## 1. Start your backend

In the backend project folder, activate your virtual environment and run:

```powershell
uvicorn main:app --reload
```

The API should be available at `http://127.0.0.1:8000`.

## 2. Enable CORS in FastAPI

Because this frontend is served from a different local port, your FastAPI app must allow the frontend origin.

In `main.py`, add this import near the top:

```python
from fastapi.middleware.cors import CORSMiddleware
```

Immediately after `app = FastAPI()`, add:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Save `main.py`; Uvicorn should reload.

## 3. Run the frontend

Open a second PowerShell window, change directory into this frontend folder, then run:

```powershell
python -m http.server 5500
```

Open this in your browser:

`http://127.0.0.1:5500`

Do not open `index.html` by double-clicking it; use the local server command above.

## API contract expected

- `POST /users` accepts JSON: `{"username": "...", "email": "...", "password": "..."}`
- `POST /login` accepts OAuth2 form data. The email is sent in the `username` field.
- `GET /me` returns the authenticated user (currently known to return at least `user_id`).
- `GET /tasks` returns the signed-in user's tasks.
- `POST /tasks` accepts `{"title": "...", "description": "..."}`
- `GET /tasks/{task_id}` retrieves one owned task.
- `PUT /tasks/{task_id}` accepts `title`, `description`, and `completed`.
- `DELETE /tasks/{task_id}` deletes one owned task.

If your backend uses a different route or response shape, update `API_BASE` or the relevant fetch call in `app.js`.
