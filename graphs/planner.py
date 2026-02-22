from graphs.graph_builder import *
from graphs.search import *
from graphs.solver import *
from graphs.encodings import *
from graphs.models import Hold as EngineHold, Climber as EngineClimber

def generate_route_plan(wall, climber, start_left_hold_id, start_right_hold_id, end_hold_id):
    engine_holds = [
        EngineHold(
            id=h.id,
            x=h.x,
            y=h.y,
            hold_type=h.hold_type,
            role=h.role,
        )
        for h in wall.holds
    ]

    
    wall_height_cm = wall_height_from_calibration(wall.calibration_20cm_y)
    max_reach_img = compute_max_reach_image_units(climber.arm_span, wall_height_cm)

    engine_climber = EngineClimber(
        height_cm=climber.height,
        experience=climber.experience,
        arm_span=max_reach_img,
    )

    G = build_climbing_graph(engine_holds, engine_climber)
    path_states = aStar(G, engine_climber, start_left_hold_id, start_right_hold_id, end_hold_id)
    if path_states is None:
        raise ValueError(
            "No feasible route found between start and end holds for this climber. "
            "Try selecting different holds or increasing reach."
        )

    steps = generate_instruction(G, path_states, engine_climber)
    total_cost = sum(step.cost for step in steps)

    if total_cost < 20:
        grade = "V1"
    elif total_cost < 40:
        grade = "V3"
    elif total_cost < 70:
        grade = "V5"
    else:
        grade = "V7+"

    return {
        "route": [
            {
                "from_hold": s.from_hold,
                "to_hold": s.to_hold,
                "moved_limb": s.moved_limb,
                "move_type": s.move_type,
                "cost": s.cost,
            }
            for s in steps
        ],
        "total_cost": total_cost,
        "estimated_grade": grade,
    }





