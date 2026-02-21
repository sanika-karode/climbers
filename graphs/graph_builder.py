import networkx as nx
import math
from graphs.encodings import *
from graphs.models import *



def distance(h1: Hold, h2: Hold) -> float:
    return math.sqrt((h1.x-h2.x)**2 + (h1.y-h2.y)**2)

def valid_move(current_hold, candidate_hold, max_reach):
    d = distance(current_hold, candidate_hold)
    return d <= max_reach * 1.1

def get_penalty(dist: float, h1: Hold, h2: Hold, climber: Climber) -> float:
    hold_type_penalty = hold_penalty(h2.hold_type)
    experience_penalty = exp_penalty(climber.experience)
    direction_multiplier = 1.0 if h2.y < h1.y else 1.5
    return dist * hold_type_penalty * experience_penalty * direction_multiplier
 


def build_climbing_graph(holds: List[Hold], climber: Climber):
    G = nx.DiGraph()
    max_reach = compute_reach(climber.height_cm)

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


def add_edgeStates(state, holds, max_reach, hand, stack, G) :
    for candidate in holds.value():
        if candidate == state[candidate]:
            continue
        if not valid_move(state[hand], candidate, max_reach):
            continue
        new_state = (candidate if hand == 0 else state[0],
                    candidate if hand == 1 else state[1])
        d = distance(state[hand], candidate)
        ratio = reach_ratio(d,max_reach)
        weight = (
                (ratio ** 2) * 3
                + hold_penalty(state[hand].hold_type)
            )
        G.add_edge(state, new_state, weight = weight)
        stack.append(new_state) 


def build_graph_states(holds, climber, start_ids):
    G = nx.DiGraph()
    max_reach = compute_reach(climber.height_cm)


    start_state = tuple(start_ids)
    G.add_node(start_state)
    visited = set()
    stack = [start_state]

    while stack:
        state = stack.pop()
        if state in visited:
            continue
        visited.add(state)
        add_edgeStates(state, holds, max_reach, 0, stack, G)
        add_edgeStates(state, holds, max_reach, 1, stack, G)
    return G


        


    