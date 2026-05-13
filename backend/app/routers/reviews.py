from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.database import supabase
from app.auth import decode_access_token

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    """Payload for creating a single professor review."""
    professor_id: int
    course_code: str | None = None
    course_name: str | None = None
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=3, max_length=2000)
    difficulty: str = "Medium"
    would_take_again: bool = True


def get_current_user(authorization: str | None) -> dict:
    """Validate bearer token and return the current user row."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    payload = decode_access_token(authorization.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    user = supabase.table("users").select("id, email").eq("email", email).limit(1).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    return user.data[0]


@router.get("/professors")
def list_professors(
    q: str | None = Query(default=None),
    department: str | None = Query(default=None),
):
    """List professors for UI selectors/search panels."""
    query = supabase.table("professors").select("id, name, department, email").order("name")

    if department:
        query = query.ilike("department", f"%{department}%")
    if q:
        query = query.ilike("name", f"%{q}%")

    result = query.execute()
    return result.data or []


@router.get("")
def list_reviews(
    q: str | None = Query(default=None),
    department: str | None = Query(default=None),
    min_rating: int = Query(default=1, ge=1, le=5),
):
    """
    Return reviews with optional filters.
    We filter in Python after the join so UI search can match professor names.
    """
    query = (
        supabase.table("professor_reviews")
        .select(
            "id, professor_id, course_code, course_name, rating, review_text, difficulty, would_take_again, created_at, professors(name, department)"
        )
        .gte("rating", min_rating)
        .order("created_at", desc=True)
    )

    rows = query.execute().data or []

    filtered = []
    for row in rows:
        prof = row.get("professors") or {}
        if department and department.lower() not in (prof.get("department") or "").lower():
            continue
        if q and q.lower() not in (prof.get("name") or "").lower():
            continue

        filtered.append(
            {
                "id": row["id"],
                "professor_id": row["professor_id"],
                "professor_name": prof.get("name") or "Unknown",
                "department": prof.get("department") or "Unknown",
                "course_code": row.get("course_code"),
                "course_name": row.get("course_name"),
                "rating": row.get("rating"),
                "review_text": row.get("review_text"),
                "difficulty": row.get("difficulty"),
                "would_take_again": row.get("would_take_again"),
                "created_at": row.get("created_at"),
            }
        )

    return filtered


@router.post("")
def create_review(payload: ReviewCreate, authorization: str = Header(default=None)):
    """Create a new review tied to an authenticated user."""
    user = get_current_user(authorization)

    prof = (
        supabase.table("professors")
        .select("id, name")
        .eq("id", payload.professor_id)
        .limit(1)
        .execute()
    )
    if not prof.data:
        raise HTTPException(status_code=404, detail="Professor not found")

    result = (
        supabase.table("professor_reviews")
        .insert(
            {
                "professor_id": payload.professor_id,
                "user_id": user["id"],
                "course_code": payload.course_code,
                "course_name": payload.course_name,
                "rating": payload.rating,
                "review_text": payload.review_text,
                "difficulty": payload.difficulty,
                "would_take_again": payload.would_take_again,
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create review")

    return {"message": "Review submitted", "review": result.data[0]}
