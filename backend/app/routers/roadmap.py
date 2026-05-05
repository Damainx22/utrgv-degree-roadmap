from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.auth import decode_access_token
from pydantic import BaseModel

# Create a router with /roadmap prefix
# All endpoints in this file will start with /roadmap
router = APIRouter(prefix="/roadmap", tags=["roadmap"])


class CompletedCourseCreate(BaseModel):
    course_code: str


def get_current_user(authorization: str) -> dict:
    """
    Extract and verify the JWT token from the Authorization header.
    Returns the user record from the database.
    Raises 401 if token is missing or invalid.

    The Authorization header looks like: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    We split on the space to get just the token part.
    """
    # Check that the header exists and starts with "Bearer "
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    # Split "Bearer <token>" and take just the token
    token = authorization.split(" ")[1]

    # Decode the JWT token to get the payload (contains the student's email)
    payload = decode_access_token(token)

    # If token is expired or tampered with, payload will be None
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # The email was stored as "sub" (subject) when we created the token
    email = payload.get("sub")

    # Look up the user in the database by email
    result = supabase.table("users").select("*").eq("email", email).execute()

    # If user doesn't exist in the database return 404
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Return the full user record as a dictionary
    return result.data[0]


def get_course_by_code(course_code: str) -> dict:
    """Look up a course by code and return its record."""
    normalized = course_code.strip().upper()
    result = (
        supabase.table("courses")
        .select("id, code, name, credits")
        .eq("code", normalized)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Course not found: {normalized}")
    return result.data[0]

@router.get("/programs")
def get_programs():
    """
    Returns all degree programs grouped by college.
    Used to populate the major selection dropdown on the frontend.
    No auth required — anyone can browse available programs.
    """
    # Fetch all programs with their college name
    result = supabase.table("programs")\
        .select("id, name, college_id, colleges(name)")\
        .order("name")\
        .execute()

    if not result.data:
        return []

    return result.data

@router.post("/student/major")
def set_major(
    program_id: int,
    authorization: str = Header(None)
):
    """
    Save the student's selected major to their user record.
    Requires a valid JWT token in the Authorization header.
    """
    # Get the current logged in user from the JWT token
    user = get_current_user(authorization)

    # Validate selected program exists
    program = supabase.table("programs").select("id").eq("id", program_id).execute()
    if not program.data:
        raise HTTPException(status_code=404, detail=f"Program not found: {program_id}")

    # Update the user's program_id in the database
    result = supabase.table("users")\
        .update({"program_id": program_id})\
        .eq("id", user["id"])\
        .execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not update major")

    return {"message": "Major updated successfully", "program_id": program_id}


@router.get("/student/completed")
def get_completed_courses(authorization: str = Header(None)):
    """Return completed courses for the current user."""
    user = get_current_user(authorization)

    result = (
        supabase.table("completed_courses")
        .select("course_id, courses(code, name, credits)")
        .eq("user_id", user["id"])
        .execute()
    )

    completed = []
    for row in result.data or []:
        course = row.get("courses")
        if not course:
            continue
        completed.append(
            {
                "course_id": row["course_id"],
                "code": course["code"],
                "name": course["name"],
                "credits": course["credits"],
            }
        )

    completed.sort(key=lambda c: c["code"])
    return {"count": len(completed), "courses": completed}


@router.post("/student/completed")
def add_completed_course(payload: CompletedCourseCreate, authorization: str = Header(None)):
    """Mark a course as completed for the current user."""
    user = get_current_user(authorization)
    course = get_course_by_code(payload.course_code)

    existing = (
        supabase.table("completed_courses")
        .select("id")
        .eq("user_id", user["id"])
        .eq("course_id", course["id"])
        .execute()
    )
    if existing.data:
        return {
            "message": "Course already marked completed",
            "course": course,
        }

    inserted = (
        supabase.table("completed_courses")
        .insert({"user_id": user["id"], "course_id": course["id"]})
        .execute()
    )
    if not inserted.data:
        raise HTTPException(status_code=500, detail="Could not add completed course")

    return {"message": "Course marked completed", "course": course}


@router.delete("/student/completed/{course_code}")
def remove_completed_course(course_code: str, authorization: str = Header(None)):
    """Remove a completed course for the current user."""
    user = get_current_user(authorization)
    course = get_course_by_code(course_code)

    deleted = (
        supabase.table("completed_courses")
        .delete()
        .eq("user_id", user["id"])
        .eq("course_id", course["id"])
        .execute()
    )

    if not deleted.data:
        raise HTTPException(
            status_code=404,
            detail=f"Course not marked completed: {course['code']}",
        )

    return {"message": "Completed course removed", "course": course}


@router.get("/student/roadmap")
def get_roadmap(authorization: str = Header(None)):
    """
    Returns the student's personalized degree roadmap.
    Shows completed, unlocked, and locked courses based on their
    selected major and completed courses.
    Requires a valid JWT token in the Authorization header.
    """
    # Get the current logged in user
    user = get_current_user(authorization)

    # Check if student has selected a major
    if not user.get("program_id"):
        raise HTTPException(status_code=400, detail="No major selected")

    # Get all courses required for this program
    requirements = supabase.table("program_requirements")\
        .select("course_id, section_name, requirement_type, courses(code, name, credits, prereqs)")\
        .eq("program_id", user["program_id"])\
        .execute()

    # Get all courses this student has completed
    completed = supabase.table("completed_courses")\
        .select("course_id, courses(code)")\
        .eq("user_id", user["id"])\
        .execute()

    # Build a set of completed course codes for fast lookup
    completed_codes = {
        c["courses"]["code"]
        for c in completed.data
        if c.get("courses")
    }

    # Categorize each required course
    roadmap = []
    for req in requirements.data:
        course = req.get("courses")
        if not course:
            continue

        code = course["code"]
        prereqs = course.get("prereqs")

        # Check if completed
        if code in completed_codes:
            status = "completed"
        # Check if prereqs are satisfied
        elif prereqs_satisfied(prereqs, completed_codes):
            status = "unlocked"
        else:
            status = "locked"

        roadmap.append({
            "code": code,
            "name": course["name"],
            "credits": course["credits"],
            "status": status,
            "section": req.get("section_name"),
            "requirement_type": req.get("requirement_type"),
        })

    return {
        "program_id": user["program_id"],
        "completed_count": len(completed_codes),
        "remaining_count": max(0, len(roadmap) - len(completed_codes)),
        "courses": roadmap,
    }


def prereqs_satisfied(prereqs: dict, completed_codes: set) -> bool:
    """
    Recursively check if a student has satisfied the prerequisites
    for a course based on their completed courses.

    Handles AND/OR trees:
      {"type": "course", "code": "CSCI 1470"}
        → True if CSCI 1470 is in completed_codes

      {"type": "or", "courses": ["MATH 1314", "MATH 1414"]}
        → True if ANY of those courses are in completed_codes

      {"type": "and", "operands": [...]}
        → True if ALL operands are satisfied
    """
    # No prereqs means the course is open to anyone
    if not prereqs:
        return True

    prereq_type = prereqs.get("type")

    # Single course requirement
    if prereq_type == "course":
        return prereqs["code"] in completed_codes

    # OR — student needs at least one
    if prereq_type == "or":
        return any(code in completed_codes for code in prereqs.get("courses", []))

    # AND — student needs all of them
    if prereq_type == "and":
        return all(
            prereqs_satisfied(operand, completed_codes)
            for operand in prereqs.get("operands", [])
        )

    # Raw or unknown type — assume satisfied
    return True
