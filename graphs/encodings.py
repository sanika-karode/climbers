import math
from graphs.models import *


WALL_HEIGHT_METERS = 4.0  # Assume the image represents a 4m tall wall

def compute_reach(height_cm: float) -> float:
    # 1. Calculate reach in meters
    reach_meters = (height_cm * 1.05) / 100
    # 2. Normalize it to the 0.0-1.0 scale
    return reach_meters / WALL_HEIGHT_METERS

HOLD_PENALTY = {
    "jug": 1.0,
    "pinch": 1.5,
    "sloper": 2.0,
    "crimp": 2.5,
}


EXPERIENCE_MODIFIER = {
    "beginner": 2.0,     # Penalize hard holds more for beginners
    "intermediate": 1.2,
    "advanced": 1.0
}

#def compute_reach(height_cm: float) -> float:
#    return (height_cm*1.05) / 100

def hold_penalty(hold_type: str) -> float:
    return HOLD_PENALTY.get(hold_type)

def exp_penalty(exp: str) -> float:
    #climber comes from api schema
    return EXPERIENCE_MODIFIER.get(exp)

def reach_ratio(distance: float, max_reach: float) -> float:
    return distance/max_reach

#update later for more accuracy
def technique_from_ratio(ratio: float) -> str:
    if ratio < .6:
        return "static"
    elif ratio < .85:
        return "extended static"
    elif ratio <= 1.0:
        return "dynamic"
    else:
        return "dyno"