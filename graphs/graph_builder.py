import networkx as nx
import math
from graphs.encodings import *
from graphs.models import *



def distance(h1: Hold, h2: Hold) -> float:
    return math.sqrt((h1.x-h2.x)**2 + (h1.y-h2.y)**2)

#def valid_move(current_hold, candidate_hold, max_reach) -> bool:
#    d = distance(current_hold, candidate_hold)
#    return d <= (max_reach * 1.1)

def get_penalty(dist: float, h1: Hold, h2: Hold, climber: Climber) -> float:
    hold_type_penalty = hold_penalty(h2.hold_type)
    experience_penalty = exp_penalty(climber.experience)
    direction_multiplier = 1.0 if h2.y < h1.y else 1.5
    return dist * hold_type_penalty * experience_penalty * direction_multiplier
 


def build_climbing_graph(holds: List[Hold], climber: Climber):
    G = nx.DiGraph()
    max_reach = climber.arm_span

    for hold in holds:
        G.add_node(hold.id, data=hold)

    for h1 in holds:
        for h2 in holds:
            if h1.id == h2.id:
                continue

            dist = distance(h1,h2)

            if dist <= max_reach:
                weight = get_penalty(dist, h1, h2, climber)
                G.add_edge(h1.id, h2.id, weight = weight, distance = dist)
    return G




        


    