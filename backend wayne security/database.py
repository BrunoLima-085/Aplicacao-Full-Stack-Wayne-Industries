from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db():
    from models import User, Resource
    db.create_all()
