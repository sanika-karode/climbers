from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    height = Column(Float)
    experience = Column(String)
    armspan = Column(Float)

    walls = relationship("Wall", back_populates="owner")