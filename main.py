from fastapi import FastAPI, Depends
import model
from database import engine, SessionLocal
from sqlalchemy.orm import Session
import schemas
import security
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware


model.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
def get_db():
   
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

@app.get("/")
def home():
    return {"message": "Task Manager Api is running"}



@app.post("/users")
def create_user(user:
                schemas.UserCreate, db: Session = Depends(get_db)):
        new_user = model.User(
            username = user.username,
            email = user.email,
            password = security.hash_password(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
     db_user = db.query(model.User).filter(model.User.email == form_data.username).first()
     if not db_user:
          raise HTTPException(status_code = 401, detail = "Invalid email or password")
     if not security.verify_pasword(form_data.password, db_user.password):
          raise HTTPException(status_code = 401, detail = "Invalid email or password")
     access_token = security.create_access_token({"user_id": db_user.id})
     return {
          "access_token": access_token, "token_type": "bearer"
     }
@app.get("/me")
def get_me(user_id: int = Depends(security.get_current_user)):
     return {"user_id": user_id}

@app.post("/tasks")
def create_task(
     task: schemas.TaskCreate, 
     user_id: int = Depends(security.get_current_user),
     db: Session = Depends(get_db)):
     
     new_task = model.Task(title=task.title, description= task.description, completed = False, user_id = user_id)

     db.add(new_task)
     db.commit()
     db.refresh(new_task)

     return new_task
@app.get("/tasks")
def get_tasks(
     user_id: int = Depends(security.get_current_user),
     db: Session = Depends(get_db)):
     tasks = db.query(model.Task).filter(model.Task.user_id == user_id).all()

     return tasks 

@app.put("/tasks/{task_id}")
def update_task(
     task_id: int,
     task: schemas.TaskUpdate,
     user_id: int = Depends(security.get_current_user),
     db: Session = Depends(get_db)):
     db_task = db.query(model.Task).filter(model.Task.id == task_id, model.Task.user_id == user_id).first()
     if not db_task:
          raise HTTPException(
               status_code = 404,
               detail = "Task not found"
          )
     db_task.title = task.title
     db_task.description = task.description
     db_task.completed = task.completed
     db.commit()
     db.refresh(db_task)

     return db_task

@app.delete("/task/{task_id}")
def delete_task(
     task_id: int,
     user_id: int = Depends(security.get_current_user),
     db: Session = Depends(get_db)):

     db_task = db.query(model.Task).filter(model.Task.id == task_id, model.Task.user_id == user_id).first()
     if not db_task:
          raise HTTPException(
               status_code = 404,
               detail = "Task not found"
          )
     db.delete(db_task)
     db.commit()
     return {"message": "Task deleted succesfully"}

@app.get("/tasks/{task_id}")
def get_task(
     task_id: int,
     user_id: int = Depends(security.get_current_user),
     db: Session = Depends(get_db)):

     db_task = db.query(model.Task).filter(model.Task.user_id == user_id).first()
     if not db_task:
          raise HTTPException(status_code = 404, detail = "Task not found")
     return db_task
