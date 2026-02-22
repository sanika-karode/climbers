from app.models.schemas import RouteRequest, RouteResponse, RouteStep
from graph_engine.planner import generate_route_plan


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
    result = generate_route_plan(
        wall=request.wall,
        climber=request.climber,
        start_hold_id=request.start_hold_id,
        end_hold_id=request.end_hold_id,
    )

    # -----------------------------
    # Convert steps to Pydantic model
    # -----------------------------
    steps = [
        RouteStep(
            step_number=i + 1,
            from_hold=step["from_hold"],
            to_hold=step["to_hold"],
            limb=step["limb"],
            move_type=step["move_type"],
        )
        for i, step in enumerate(result["route"])
    ]

    return RouteResponse(
        route=steps,
        total_cost=result["total_cost"],
        difficulty_score=result["difficulty_score"],
        estimated_grade=result["estimated_grade"],
    )