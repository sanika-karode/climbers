from fastapi import APIRouter, HTTPException
from app.models.schemas import RouteRequest, RouteResponse
from app.services.route_service import generate_route

router = APIRouter()

@router.post("/generate-route", response_model=RouteResponse)
async def create_route(request: RouteRequest):
    try:
        result = generate_route(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")