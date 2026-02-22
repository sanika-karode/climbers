from dataclasses import dataclass
from typing import List, Tuple

@dataclass
class Hold:
    id: int
    x: float
    y: float
    hold_type: str #turn into enum later
    role: str #turn into enum later

@dataclass
class Climber:
    height_cm: float
    experience: str
    arm_span: float

@dataclass
class RouteStep:
    step_number: int
    #turn int enum later
    moved_limb: str
    from_hold: int
    to_hold: int
    move_type: str
    cost: float
