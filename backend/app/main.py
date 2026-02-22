import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.database import engine, Base
from app.models.user import User  # noqa: F401 - ensure table is registered
from app.models.climbing import Wall, Hold  # noqa: F401 - ensure tables are registered
from app.routes.auth import router as auth_router
from app.routes.route import router as route_router

app = FastAPI(title="Climbing Route API", version="1.0.0")


@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"Unhandled error: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )


@app.get("/health")
def health():
    return {"status": "ok"}


# Defer DB init so app can start even if DB is temporarily unavailable (e.g. cold start)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB init warning: {e}")

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(route_router, prefix="/api/v1")