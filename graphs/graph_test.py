from graphs.models import *
from graphs.graph_builder import *
import networkx as nx

def test_climbing_logic():
    print("testing")
        # 1. Setup Mock Holds (x, y from 0.0 to 1.0)
    # 0.0 is Top/Left, 1.0 is Bottom/Right
    h1 = Hold(id=1, x=0.4, y=0.9, hold_type="jug", role = "start")    # Start Left
    h2 = Hold(id=2, x=0.6, y=0.9, hold_type="jug", role ="start")    # Start Right
    h3 = Hold(id=3, x=0.5, y=0.5, hold_type="crimp", role = "middle")  # Middle (Hard)
    h4 = Hold(id=4, x=0.5, y=0.1, hold_type="jug", role = "top")    # Top Exit
    
    holds_list = [h1, h2, h3, h4]
    print(h1.id)

    # 2. Setup Two Different Climbers
    tall_climber = Climber(height_cm=500.0, experience="advanced")
    short_climber = Climber(height_cm=160.0, experience="beginner")

    # 3. Test Tall Climber
    print("--- Testing Tall Climber ---")
    G_tall = build_climbing_graph(holds_list, tall_climber)
    print(f"Edges found: {G_tall.number_of_edges()}")
    # Check if a direct path from bottom to top exists (skipping the crimp)
    if G_tall.has_edge(1, 4):
        print("Success: Tall climber can skip the middle hold!")

    # 4. Test Short Climber
    print("\n--- Testing Short Climber ---")
    G_short = build_climbing_graph(holds_list, short_climber)
    print(f"Edges found: {G_short.number_of_edges()}")
    # Short climber should have fewer edges because of max_reach
    if not G_short.has_edge(1, 4):
        print("Logic Correct: Short climber cannot reach the top directly.")

    # 5. Check Weights
    # The weight to a 'crimp' should be higher than to a 'jug'
    if G_tall.has_edge(1, 3) and G_tall.has_edge(1, 2):
        w_crimp = G_tall[1][3]['weight']
        w_jug = G_tall[1][2]['weight']
        print(f"\nWeight to Crimp: {w_crimp:.2f}")
        print(f"Weight to Jug: {w_jug:.2f}")
        assert w_crimp > w_jug, "Error: Crimp should be harder (higher weight) than Jug!"

if __name__ == "__main__":
    test_climbing_logic()