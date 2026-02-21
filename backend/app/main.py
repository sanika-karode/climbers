from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.route import router as route_router

app = FastAPI(title="Climbing Route API", version="1.0.0")

# Enable React connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(route_router, prefix="/api/v1")