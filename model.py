from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer,
                primary_key= True, index=True)
    username = Column(String,
                      unique=True, nullable=False)
    email = Column(String,
                   unique= True, nullable= False)
    password = Column(String,
                      unique = True, nullable = False)

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key = True, index = True)
    title = Column(String, nullable = False)
    description = Column(String)
    completed  = Column(Boolean, default = False, nullable = False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable = False)
