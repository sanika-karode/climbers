from app.models.schemas import RouteRequest, RouteResponse, RouteStep
from graphs.planner import generate_route_plan


#   assuming backend is from graph_engine/planner.py and
#   def generate_route_plan(wall, climber, start_hold_id, end_hold_id) -> dict:

def generate_route(request: RouteRequest) -> RouteResponse:
    """
    Orchestrates route generation:
    - Calls graph engine
    - Converts result to API response schema
    """

    # -----------------------------
    # Call Graph Engine
    # -----------------------------
    result = generate_route_plan (
        wall=request.wall,
        climber=request.climber,
        start_left_hold_id=request.start_left_hold_id,
        start_right_hold_id=request.start_right_hold_id,
        end_hold_id=request.end_hold_id,
    )

    # -----------------------------
    # Convert steps to Pydantic model
    # -----------------------------
    steps = [
        RouteStep(
            step_number=i + 1,
            moved_limb=step["moved_limb"],
            from_hold=step["from_hold"],
            to_hold=step["to_hold"],
            move_type=step["move_type"],
            cost=step["cost"],
        )
        for i, step in enumerate(result["route"])
    ]

    return RouteResponse(
        route=steps,
        total_cost=result["total_cost"],
        estimated_grade=result["estimated_grade"],
    )