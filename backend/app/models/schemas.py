from pydantic import BaseModel
from typing import List, Literal, Optional

LimbType = Literal["left_hand", "right_hand"]

class Hold(BaseModel):
    id: int
    x: float
    y: float
    hold_type: Literal["jug", "crimp", "sloper", "pinch", "volume"]
    size: float
    role: Literal["start", "end", "middle"]

class Wall(BaseModel):
    holds: List[Hold]

class Climber(BaseModel):
    height: float
    experience: Literal["beginner", "intermediate", "advanced"]
    max_reach: float

class BodyState(BaseModel):
    left_hand: int
    right_hand: int

class RouteRequest(BaseModel):
    wall: Wall
    climber: Climber
    start_hold_id: int
    end_hold_id: int

class RouteStep(BaseModel):
    step_number: int
    moved_limb: LimbType
    from_hold: int
    to_hold: int
    move_type: str
    cost: float

class RouteResponse(BaseModel):
    route: List[RouteStep]
    total_cost: float
    estimated_grade: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    height: float
    experience: str
    armspan: float

class HoldCreate(BaseModel):
    x_position: float
    y_position: float
    hold_type: Optional[str] = "unknown"

class WallCreateResponse(BaseModel):
    wall_id: int
    message: str