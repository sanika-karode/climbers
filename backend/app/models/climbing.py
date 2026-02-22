from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Wall(Base):
    __tablename__ = "walls"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)  # Path to where the photo is stored (S3 or local)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="walls")
    holds = relationship("Hold", back_populates="wall", cascade="all, delete-orphan")

class Hold(Base):
    __tablename__ = "holds"

    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("walls.id"))
    
    # Coordinates (Normalized 0.0 to 1.0 is usually best for different screen sizes)
    x_position = Column(Float, nullable=False)
    y_position = Column(Float, nullable=False)
    
    # Optional metadata for the graph engine
    hold_type = Column(String, nullable=True)  # e.g., 'jug', 'crimp', 'sloper'
    grade_contribution = Column(Float, default=0.0)

    wall = relationship("Wall", back_populates="holds")