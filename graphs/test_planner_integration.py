"""
Integration test for the planner pipeline: graph building → A* → instruction generation.

Run from project root:
    python -m graphs.test_planner_integration
    # or
    python graphs/test_planner_integration.py
"""

import sys
from pathlib import Path

# Ensure project root is on path when running script directly
_project_root = Path(__file__).resolve().parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))


def make_mock_hold(hold_id: int, x: float, y: float, hold_type: str, role: str):
    """Create a minimal mock hold with required attributes."""
    return type("Hold", (), {"id": hold_id, "x": x, "y": y, "hold_type": hold_type, "role": role})()


def make_mock_climber(height: float, experience: str, arm_span: float):
    """Create a minimal mock climber with required attributes."""
    return type("Climber", (), {"height": height, "experience": experience, "arm_span": arm_span})()


def make_mock_wall(holds, calibration_20cm_y: float):
    """Create a minimal mock wall with required attributes."""
    return type("Wall", (), {"holds": holds, "calibration_20cm_y": calibration_20cm_y})()


def test_planner_integration_success():
    """Test that generate_route_plan returns a valid route for feasible input."""
    from graphs.planner import generate_route_plan

    # Setup: 4 holds - start pair at bottom, middle, top exit
    holds = [
        make_mock_hold(1, 0.4, 0.9, "jug", "start"),
        make_mock_hold(2, 0.6, 0.9, "jug", "start"),
        make_mock_hold(3, 0.5, 0.5, "jug", "middle"),
        make_mock_hold(4, 0.5, 0.1, "jug", "end"),
    ]
    wall = make_mock_wall(holds, calibration_20cm_y=0.05)
    climber = make_mock_climber(height=175, experience="intermediate", arm_span=180)

    result = generate_route_plan(
        wall=wall, climber=climber,
        start_left_hold_id=1, start_right_hold_id=2, end_hold_id=4,
    )

    assert "route" in result and "total_cost" in result and "estimated_grade" in result
    assert len(result["route"]) > 0

    required = ["from_hold", "to_hold", "moved_limb", "move_type", "cost"]
    for step in result["route"]:
        for field in required:
            assert field in step
        assert step["moved_limb"] in ("left_hand", "right_hand")

    assert result["total_cost"] > 0
    assert result["estimated_grade"] in ("V1", "V3", "V5", "V7+")
    assert result["route"][-1]["to_hold"] == 4

    print("✓ test_planner_integration_success passed")


def test_planner_integration_no_path_raises():
    """Test that generate_route_plan raises ValueError when no route exists."""
    from graphs.planner import generate_route_plan

    holds = [
        make_mock_hold(1, 0.1, 0.9, "jug", "start"),
        make_mock_hold(2, 0.9, 0.9, "jug", "start"),
        make_mock_hold(3, 0.5, 0.1, "jug", "end"),
    ]
    wall = make_mock_wall(holds, calibration_20cm_y=0.05)
    climber = make_mock_climber(height=150, experience="beginner", arm_span=50)

    try:
        generate_route_plan(
            wall=wall, climber=climber,
            start_left_hold_id=1, start_right_hold_id=2, end_hold_id=3,
        )
        assert False, "Expected ValueError when no path exists"
    except ValueError as e:
        assert "No feasible route" in str(e)
        print("✓ test_planner_integration_no_path_raises passed")


def test_planner_integration_structure():
    """Test response structure matches what route_service expects."""
    from graphs.planner import generate_route_plan

    holds = [
        make_mock_hold(1, 0.5, 0.9, "jug", "start"),
        make_mock_hold(2, 0.5, 0.5, "jug", "middle"),
        make_mock_hold(3, 0.5, 0.1, "jug", "end"),
    ]
    wall = make_mock_wall(holds, calibration_20cm_y=0.05)
    climber = make_mock_climber(height=175, experience="advanced", arm_span=180)

    result = generate_route_plan(
        wall=wall, climber=climber,
        start_left_hold_id=1, start_right_hold_id=1, end_hold_id=3,
    )

    for step in result["route"]:
        assert step["moved_limb"] in ("left_hand", "right_hand")
        assert isinstance(step["from_hold"], int) and isinstance(step["to_hold"], int)
        assert isinstance(step["cost"], (int, float))

    print("✓ test_planner_integration_structure passed")


if __name__ == "__main__":
    print("Running planner integration tests...\n")
    test_planner_integration_success()
    test_planner_integration_no_path_raises()
    test_planner_integration_structure()
    print("\nAll planner integration tests passed.")