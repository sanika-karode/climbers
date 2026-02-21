import json
import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.models.schemas import RouteRequest, RouteResponse, WallCreateResponse
from app.models.user import User
from app.services.route_service import generate_route
from app.db.database import get_db
from app.models.climbing import Wall, Hold

router = APIRouter(tags=["Climbing Logic"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Endpoint 1: Pathfinding
@router.post("/generate-route", response_model=RouteResponse)
def create_route(request: RouteRequest):
    try:
        result = generate_route(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

# Endpoint 2: Upload (Notice we added the prefix to the path string)
@router.post("/walls/upload", response_model=WallCreateResponse)
async def upload_wall(
    file: UploadFile = File(...),
    holds_data: str = Form(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    #Save file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    #Parse the holds JSON
    try:
        holds_list = json.loads(holds_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for holds_data")

    # Create the Wall record
    new_wall = Wall(image_path=file_path, user_id=current_user.id) 
    db.add(new_wall)
    db.flush() 

    # 4. Create the Hold records
    for h in holds_list:
        new_hold = Hold(
            wall_id=new_wall.id,
            x_position=h['x_position'],
            y_position=h['y_position'],
            hold_type=h.get('hold_type', 'unknown')
        )
        db.add(new_hold)

    db.commit()
    return {"wall_id": new_wall.id, "message": "Wall and holds saved successfully"}