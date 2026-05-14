from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, roadmap, reviews
import os

# Create the FastAPI app instance with a title
# The title appears in the auto-generated API docs at /docs
app = FastAPI(title="UTRGV Degree Roadmap API")

# Add CORS middleware to allow the Next.js frontend to call this API
# Without this the browser would block requests from localhost:3000 to localhost:8000
default_origins = ",".join(
    [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ]
)
allow_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,              # frontend URLs (local + env override)
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,                   # allow cookies and auth headers
    allow_methods=["*"],                      # allow GET, POST, PUT, DELETE etc
    allow_headers=["*"],                      # allow all headers
)

# Register the auth router which adds /auth/register and /auth/login endpoints
app.include_router(auth.router)
app.include_router(roadmap.router)
app.include_router(reviews.router)

# Root endpoint to verify the API is running
@app.get("/")
def root():
    return {"message": "UTRGV Degree Roadmap API running"}
