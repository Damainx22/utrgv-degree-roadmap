from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth

# Create the FastAPI app instance with a title
# The title appears in the auto-generated API docs at /docs
app = FastAPI(title="UTRGV Degree Roadmap API")

# Add CORS middleware to allow the Next.js frontend to call this API
# Without this the browser would block requests from localhost:3000 to localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend URL
    allow_credentials=True,                   # allow cookies and auth headers
    allow_methods=["*"],                      # allow GET, POST, PUT, DELETE etc
    allow_headers=["*"],                      # allow all headers
)

# Register the auth router which adds /auth/register and /auth/login endpoints
app.include_router(auth.router)

# Root endpoint to verify the API is running
@app.get("/")
def root():
    return {"message": "UTRGV Degree Roadmap API running"}