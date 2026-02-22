from typing import List, Optional, Tuple
import networkx as nx
from graphs.models import *
from graphs.encodings import *
#from graphs.schema import RouteStep

#need routestep from api
def generate_instruction(G : nx.DiGraph, path_states: List[Tuple[int, int]], climber: Climber) -> List[RouteStep]:
    steps = []
    max_reach = climber.arm_span

    for i in range(1, len(path_states)):
        prev_l, prev_r = path_states[i-1]
        curr_l, curr_r = path_states[i]

        #determine moved limb
        if curr_l != prev_l:
            moved_limb = "left_hand"
            from_id, to_id = prev_l, curr_l
            stationary_id = prev_r
        else: 
            moved_limb = "right_hand"
            from_id, to_id = prev_r, curr_r
            stationary_id = prev_l

        target_hold = G.nodes[to_id]['data']
        from_hold = G.nodes[from_id]['data']
        stat_hold = G.nodes[stationary_id]['data']

        # distance and cost (matches disallowed by search, so to_id != stationary_id)
        edge_data = G[from_id][to_id]
        dist = edge_data['distance']
        cost = edge_data['weight']

        # movement technique from reach ratio
        ratio = reach_ratio(dist, max_reach)
        tech = technique_from_ratio(ratio)

        # Build step
        step = RouteStep(
            step_number=i,
            moved_limb=moved_limb,
            from_hold=from_id,
            to_hold=to_id,
            move_type= tech,
            cost=cost
        )

        steps.append(step)

        

    return steps

