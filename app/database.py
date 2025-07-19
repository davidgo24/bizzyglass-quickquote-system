# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise Exception("DATABASE_URL environment variable is not set.")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models - Defined here, before models import it
Base = declarative_base()

# Dependency to get the database session
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
