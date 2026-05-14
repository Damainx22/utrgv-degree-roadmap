from fastapi import APIRouter, Header, HTTPException, Query
from pydantic import BaseModel, Field

from app.database import supabase
from app.auth import decode_access_token

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    """Payload for creating a single professor review."""
    professor_id: int | None = None
    professor_name: str | None = None
    professor_department: str | None = None
    professor_email: str | None = None
    course_code: str | None = None
    course_name: str | None = None
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=3, max_length=2000)
    difficulty: str = "Medium"
    would_take_again: bool = True

class ReviewUpdate(BaseModel):
    course_code: str | None = None
    course_name: str | None = None
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=3, max_length=2000)
    difficulty: str = "Medium"
    would_take_again: bool = True

class ProfessorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    department: str = Field(min_length=2, max_length=120)
    email: str | None = None


def get_current_user(authorization: str | None) -> dict:
    """Validate bearer token and return the current user row."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    payload = decode_access_token(authorization.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    user = supabase.table("users").select("id, email, name").eq("email", email).limit(1).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    return user.data[0]


def get_current_user_id_from_optional_token(authorization: str | None) -> str | None:
    """Return current user id when a valid bearer token is provided, else None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    payload = decode_access_token(authorization.split(" ", 1)[1])
    if not payload:
        return None

    email = payload.get("sub")
    if not email:
        return None

    user_rows = (
        supabase.table("users")
        .select("id")
        .eq("email", email)
        .limit(1)
        .execute()
    )
    if not user_rows.data:
        return None
    return user_rows.data[0]["id"]


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


@router.post("/professors")
def create_professor(payload: ProfessorCreate, authorization: str = Header(default=None)):
    """Allow authenticated users to add a missing professor for reviews."""
    get_current_user(authorization)

    existing = (
        supabase.table("professors")
        .select("id, name, department, email")
        .ilike("name", payload.name.strip())
        .limit(1)
        .execute()
    )
    if existing.data:
        return {"message": "Professor already exists", "professor": existing.data[0]}

    created = (
        supabase.table("professors")
        .insert(
            {
                "name": payload.name.strip(),
                "department": payload.department.strip(),
                "email": payload.email.strip() if payload.email else None,
            }
        )
        .execute()
    )
    if not created.data:
        raise HTTPException(status_code=500, detail="Could not create professor")
    return {"message": "Professor created", "professor": created.data[0]}


@router.get("")
def list_reviews(
    q: str | None = Query(default=None),
    department: str | None = Query(default=None),
    min_rating: int = Query(default=1, ge=1, le=5),
    authorization: str | None = Header(default=None),
):
    """
    Return reviews with optional filters.
    We filter in Python after the join so UI search can match professor names.
    """
    # Query all rows first, then apply name/department text filters in Python.
    # This keeps matching behavior consistent with joined professor fields.
    query = (
        supabase.table("professor_reviews")
        .select(
            "id, professor_id, user_id, course_code, course_name, rating, review_text, difficulty, would_take_again, created_at, professors(name, department), users(name, email)"
        )
        .gte("rating", min_rating)
        .order("created_at", desc=True)
    )

    current_user_id = get_current_user_id_from_optional_token(authorization)

    rows = query.execute().data or []

    filtered = []
    for row in rows:
        prof = row.get("professors") or {}
        reviewer = row.get("users") or {}
        if department and department.lower() not in (prof.get("department") or "").lower():
            continue
        if q and q.lower() not in (prof.get("name") or "").lower():
            continue

        # Flatten joined DB shape into the exact object shape the frontend expects.
        filtered.append(
            {
                "id": row["id"],
                "professor_id": row["professor_id"],
                "professor_name": prof.get("name") or "Unknown",
                "department": prof.get("department") or "Unknown",
                "user_id": row.get("user_id"),
                "reviewer_name": reviewer.get("name") or "Anonymous Student",
                "reviewer_email": reviewer.get("email"),
                "is_owner": bool(current_user_id and row.get("user_id") == current_user_id),
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

    professor_id = payload.professor_id

    # Single-request flow: create professor on-the-fly when missing.
    # Support one-step submit: create professor inline if "not listed" path was used.
    if not professor_id and payload.professor_name:
        existing = (
            supabase.table("professors")
            .select("id")
            .ilike("name", payload.professor_name.strip())
            .limit(1)
            .execute()
        )
        if existing.data:
            professor_id = existing.data[0]["id"]
        else:
            created_prof = (
                supabase.table("professors")
                .insert(
                    {
                        "name": payload.professor_name.strip(),
                        "department": (payload.professor_department or "Computer Science").strip(),
                        "email": payload.professor_email.strip() if payload.professor_email else None,
                    }
                )
                .execute()
            )
            if not created_prof.data:
                raise HTTPException(status_code=500, detail="Could not create professor")
            professor_id = created_prof.data[0]["id"]

    if not professor_id:
        raise HTTPException(status_code=400, detail="Professor is required")

    prof = (
        supabase.table("professors")
        .select("id, name")
        .eq("id", professor_id)
        .limit(1)
        .execute()
    )
    if not prof.data:
        # Retry path: if caller provided a name, recover by create/find name and continue.
        if payload.professor_name:
            existing = (
                supabase.table("professors")
                .select("id")
                .ilike("name", payload.professor_name.strip())
                .limit(1)
                .execute()
            )
            if existing.data:
                professor_id = existing.data[0]["id"]
            else:
                created_prof = (
                    supabase.table("professors")
                    .insert(
                        {
                            "name": payload.professor_name.strip(),
                            "department": (payload.professor_department or "Computer Science").strip(),
                            "email": payload.professor_email.strip() if payload.professor_email else None,
                        }
                    )
                    .execute()
                )
                if not created_prof.data:
                    raise HTTPException(status_code=500, detail="Could not create professor")
                professor_id = created_prof.data[0]["id"]
        else:
            raise HTTPException(status_code=404, detail="Professor not found")

    result = (
        supabase.table("professor_reviews")
        .insert(
            {
                "professor_id": professor_id,
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


@router.put("/{review_id}")
def update_review(review_id: int, payload: ReviewUpdate, authorization: str = Header(default=None)):
    """Update an existing review owned by the current user."""
    user = get_current_user(authorization)
    existing = (
        supabase.table("professor_reviews")
        .select("id, user_id")
        .eq("id", review_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Review not found")
    if existing.data[0]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own review")

    updated = (
        supabase.table("professor_reviews")
        .update(
            {
                "course_code": payload.course_code,
                "course_name": payload.course_name,
                "rating": payload.rating,
                "review_text": payload.review_text,
                "difficulty": payload.difficulty,
                "would_take_again": payload.would_take_again,
            }
        )
        .eq("id", review_id)
        .execute()
    )
    if not updated.data:
        raise HTTPException(status_code=500, detail="Could not update review")
    return {"message": "Review updated", "review": updated.data[0]}


@router.delete("/{review_id}")
def delete_review(review_id: int, authorization: str = Header(default=None)):
    """Delete a review owned by the current user."""
    user = get_current_user(authorization)
    existing = (
        supabase.table("professor_reviews")
        .select("id, user_id")
        .eq("id", review_id)
        .limit(1)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Review not found")
    if existing.data[0]["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    deleted = supabase.table("professor_reviews").delete().eq("id", review_id).execute()
    if not deleted.data:
        raise HTTPException(status_code=500, detail="Could not delete review")
    return {"message": "Review deleted"}
