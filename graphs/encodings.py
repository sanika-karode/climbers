import math
from graphs.models import *

REACH_TOLERANCE = 1.15

def compute_max_reach_image_units(arm_span_cm: float, wall_height_cm: float) -> float:
    """Convert arm span to image units (0–1) using wall calibration.
    Applies REACH_TOLERANCE to allow slightly longer reaches for edge cases."""
    return (arm_span_cm / wall_height_cm) * REACH_TOLERANCE


def wall_height_from_calibration(calibration_20cm_y: float, reference_cm: float = 20.0) -> float:
    """Compute wall height in cm from '20cm up the wall' calibration point."""
    if calibration_20cm_y == 0:
        raise ValueError("Calibration 20cm y is 0, cannot compute wall height")
    return reference_cm / calibration_20cm_y

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
    return HOLD_PENALTY.get(hold_type, 2.0)

def exp_penalty(exp: str) -> float:
    #climber comes from api schema
    return EXPERIENCE_MODIFIER.get(exp, 1.5)

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