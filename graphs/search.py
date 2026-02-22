import heapq
import math
from typing import List, Optional, Tuple
import networkx as nx
from graphs.models import *
from graphs.encodings import *
from graphs.graph_builder import *

WALL_HEIGHT_METERS = 4.0

def get_dist(G: nx.DiGraph, id1: int, id2: int) -> float:
    h1 = G.nodes[id1]['data']
    h2 = G.nodes[id2]['data']
    return math.sqrt((h1.x - h2.x)**2 + (h1.y - h2.y)**2)


def get_x(G: nx.DiGraph, hold_id: int) -> float:
    return G.nodes[hold_id]['data'].x

def aStar(G: nx.DiGraph, climber: Climber, start_left: int, start_right: int,  end_id: int) -> Optional[List[int]]:
    start_state = (start_left, start_right)

    h = max(get_dist(G, start_left, end_id), get_dist(G, start_right, end_id))
    #heap: (f = g + h, g = cummulative weights, current state , path_seqeunce to return)
    pq = [(h,0,start_state, [start_state])]

    # map: state -> min(g)
    visited = {}
    while pq:
        f, g, current_state, path = heapq.heappop(pq)
        left_id, right_id = current_state

        #done climbing + we have path to return
        if left_id == end_id and right_id == end_id:
            return path

        #check if this makes sense
        state_key = tuple(sorted(current_state))
        if state_key in visited and visited[state_key] <= g:
            continue
        visited[state_key] = g
        def is_match(nl, nr):
            return nl == nr

        def allowed_match(nl, nr):
            return nl == end_id and nr == end_id

        def valid_left_right_order(a_id: int, b_id: int) -> bool:
            """Ensure left hold (first) has x <= right hold (second)."""
            if a_id == b_id:
                return True
            return get_x(G, a_id) <= get_x(G, b_id)

        # best left hand move (no matches except goal, left x <= right x)
        if left_id != end_id:
            for next_left in G.neighbors(left_id):
                new_state = (next_left, right_id)
                if is_match(next_left, right_id) and not allowed_match(next_left, right_id):
                    continue
                if not valid_left_right_order(next_left, right_id):
                    continue
                if get_dist(G, next_left, right_id) <= climber.arm_span:
                    edge_weight = G[left_id][next_left]['weight']
                    new_g = g + edge_weight
                    h_val = max(get_dist(G, next_left, end_id), get_dist(G, right_id, end_id))
                    heapq.heappush(pq, (new_g + h_val, new_g, new_state, path + [new_state]))

        # best right hand move (no matches except goal, left x <= right x)
        if right_id != end_id:
            for next_right in G.neighbors(right_id):
                new_state = (left_id, next_right)
                if is_match(left_id, next_right) and not allowed_match(left_id, next_right):
                    continue
                if not valid_left_right_order(left_id, next_right):
                    continue
                if get_dist(G, next_right, left_id) <= climber.arm_span:
                    edge_weight = G[right_id][next_right]['weight']
                    new_g = g + edge_weight
                    h_val = max(get_dist(G, left_id, end_id), get_dist(G, next_right, end_id))
                    heapq.heappush(pq, (new_g + h_val, new_g, new_state, path + [new_state]))

    return None #no path found

