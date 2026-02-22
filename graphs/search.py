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
        #best left hand move
        if left_id != end_id:
            for next_left in G.neighbors(left_id):
                if get_dist(G, next_left, right_id) <= climber.arm_span:
                    new_state = (next_left, right_id)
                    edge_weight = G[left_id][next_left]['weight']
                    new_g = g + edge_weight

                    h_val = max(get_dist(G, next_left, end_id), get_dist(G, right_id, end_id))

                    heapq.heappush(pq, (new_g + h_val,new_g, new_state, path + [new_state] ))

        #best right hand move
        if right_id != end_id:
            for next_right in G.neighbors(right_id):
                if get_dist(G, next_right, left_id) <= climber.arm_span:
                    new_state = (left_id, next_right)
                    edge_weight = G[right_id][next_right]['weight']
                    new_g = g + edge_weight

                    h_val = max(get_dist(G, left_id, end_id), get_dist(G, next_right, end_id))

                    heapq.heappush(pq, (new_g + h_val,new_g, new_state, path + [new_state] ))

    return None #no path found

