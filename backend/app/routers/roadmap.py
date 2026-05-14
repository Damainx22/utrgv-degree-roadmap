from fastapi import APIRouter, HTTPException, Header
from app.database import supabase
from app.auth import decode_access_token
from pydantic import BaseModel
import json
import re

# Create a router with /roadmap prefix
# All endpoints in this file will start with /roadmap
router = APIRouter(prefix="/roadmap", tags=["roadmap"])

# Courses that depend on placement tests, transfer credits, or high school prereqs
# These are always unlocked since we can't verify placement in our system
ALWAYS_UNLOCKED = {
    "MATH 1314", "MATH 1414", "MATH 1324", "MATH 1325",
    "MATH 2412", "MATH 2413",
    "ENGL 1301", "ENGL 1302", "ENGL 1305",
    "HIST 1301", "HIST 1302", "HIST 1387", "HIST 1388",
    "POLS 2301", "POLS 2302", "POLS 2305", "POLS 2306",
    "COMM 1315", "PHIL 2326", "UNIV 1301",
    "BIOL 1406", "BIOL 1407", "CHEM 1311", "CHEM 1312",
    "PHYS 1401", "PHYS 1402", "PHYS 2425", "PHYS 2426",
    "CSCI 1101", "CSCI 1170", "CMPE 1101", "CMPE 1170",
    # Manufacturing/ME prereq data includes circular concurrent enrollment
    # and legacy chemistry parse artifacts, so these must remain manually unlockable.
    "MECE 2140", "MECE 2340",
}


class CompletedCourseCreate(BaseModel):
    course_code: str


def get_current_user(authorization: str) -> dict:
    """
    Extract and verify the JWT token from the Authorization header.
    Returns the user record from the database.
    Raises 401 if token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    email = payload.get("sub")
    result = supabase.table("users").select("*").eq("email", email).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

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


def compute_course_status(course: dict, completed_codes: set[str]) -> str:
    """Compute roadmap status for a single course record."""
    code = course["code"]
    prereqs = course.get("prereqs")
    if isinstance(prereqs, str):
        try:
            prereqs = json.loads(prereqs)
        except Exception:
            prereqs = None

    if code in completed_codes:
        return "completed"
    if code in ALWAYS_UNLOCKED:
        return "unlocked"
    if prereqs is None or prereqs.get("type") == "raw":
        return "unlocked"
    if prereqs_satisfied(prereqs, completed_codes):
        return "unlocked"
    return "locked"


def level_from_code(code: str) -> int:
    """Map course code to level group (1000/2000/3000/4000)."""
    match = re.search(r"\b([1-6])\d{3}\b", code or "")
    if not match:
        return 1000
    first_digit = int(match.group(1))
    return max(1, min(first_digit, 4)) * 1000


@router.get("/programs")
def get_programs():
    """
    Returns all degree programs.
    Used to populate the major selection dropdown on the frontend.
    No auth required.
    """
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
    user = get_current_user(authorization)

    program = supabase.table("programs").select("id").eq("id", program_id).execute()
    if not program.data:
        raise HTTPException(status_code=404, detail=f"Program not found: {program_id}")

    # Clear completed courses when changing majors — clean slate
    supabase.table("completed_courses")\
        .delete()\
        .eq("user_id", user["id"])\
        .execute()

    # Update the user's program
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
        completed.append({
            "course_id": row["course_id"],
            "code": course["code"],
            "name": course["name"],
            "credits": course["credits"],
        })

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
        return {"message": "Course already marked completed", "course": course}

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


@router.delete("/student/completed")
def reset_completed_courses(authorization: str = Header(None)):
    """Clear all completed courses for the current user."""
    user = get_current_user(authorization)
    supabase.table("completed_courses").delete().eq("user_id", user["id"]).execute()
    return {"message": "Progress reset successfully"}


@router.get("/student/roadmap")
def get_roadmap(authorization: str = Header(None)):
    """
    Returns the student's personalized degree roadmap.
    Shows completed, unlocked, and locked courses based on their
    selected major and completed courses.
    """
    user = get_current_user(authorization)

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
        status = compute_course_status(course, completed_codes)

        roadmap.append({
            "code": code,
            "name": course["name"],
            "credits": course["credits"],
            "status": status,
            "section": req.get("section_name"),
            "requirement_type": req.get("requirement_type"),
        })

    # Compute progress stats by unique required course codes so counts are stable
    # even if requirement rows contain section/elective duplicates.
    required_codes = {row["code"] for row in roadmap}
    completed_required = required_codes.intersection(completed_codes)
    remaining_required = required_codes - completed_required
    available_required = {
        row["code"]
        for row in roadmap
        if row["status"] == "unlocked" and row["code"] not in completed_required
    }

    return {
        "program_id": user["program_id"],
        "completed_count": len(completed_required),
        "available_count": len(available_required),
        "remaining_count": len(remaining_required),
        "courses": roadmap,
    }


@router.get("/student/degree-plan")
def get_degree_plan(authorization: str = Header(None)):
    """
    Return student's semester-by-semester degree plan for their selected major.
    Falls back to 1000/2000/3000/4000 level grouping when no semester plan exists.
    """
    user = get_current_user(authorization)

    if not user.get("program_id"):
        raise HTTPException(status_code=400, detail="No major selected")

    program = (
        supabase.table("programs")
        .select("id, name")
        .eq("id", user["program_id"])
        .limit(1)
        .execute()
    )
    if not program.data:
        raise HTTPException(status_code=404, detail="Program not found")
    program_name = program.data[0]["name"]

    completed = (
        supabase.table("completed_courses")
        .select("course_id, courses(code)")
        .eq("user_id", user["id"])
        .execute()
    )
    completed_codes = {
        c["courses"]["code"]
        for c in (completed.data or [])
        if c.get("courses")
    }

    degree_rows = (
        supabase.table("degree_plans")
        .select("year, semester, display_order, notes, courses(code, name, credits, prereqs)")
        .eq("program_id", user["program_id"])
        .order("year")
        .order("display_order")
        .execute()
    )

    if degree_rows.data:
        grouped: dict[tuple[int, str], dict] = {}
        for row in degree_rows.data:
            course = row.get("courses")
            if not course:
                continue
            key = (row["year"], row["semester"])
            if key not in grouped:
                grouped[key] = {
                    "year": row["year"],
                    "semester": row["semester"],
                    "courses": [],
                    "total_credits": 0,
                }

            status = compute_course_status(course, completed_codes)
            course_row = {
                "code": course["code"],
                "name": course["name"],
                "credits": course["credits"],
                "status": status,
                "display_order": row.get("display_order", 0),
            }
            if row.get("notes"):
                course_row["notes"] = row["notes"]

            grouped[key]["courses"].append(course_row)
            grouped[key]["total_credits"] += course["credits"] or 0

        semesters = list(grouped.values())
        semesters.sort(
            key=lambda s: (
                s["year"],
                {"Fall": 1, "Spring": 2, "Summer": 3}.get(s["semester"], 99),
            )
        )

        return {
            "program_id": user["program_id"],
            "program_name": program_name,
            "has_plan": True,
            "semesters": semesters,
        }

    requirements = (
        supabase.table("program_requirements")
        .select("courses(code, name, credits, prereqs)")
        .eq("program_id", user["program_id"])
        .execute()
    )

    by_level: dict[int, list[dict]] = {1000: [], 2000: [], 3000: [], 4000: []}
    for req in requirements.data or []:
        course = req.get("courses")
        if not course:
            continue
        level = level_from_code(course["code"])
        status = compute_course_status(course, completed_codes)
        by_level[level].append(
            {
                "code": course["code"],
                "name": course["name"],
                "credits": course["credits"],
                "status": status,
                "display_order": 0,
            }
        )

    semesters = []
    for idx, level in enumerate([1000, 2000, 3000, 4000], start=1):
        courses = sorted(by_level[level], key=lambda c: c["code"])
        if not courses:
            continue
        semesters.append(
            {
                "year": idx,
                "semester": f"{level}-Level",
                "courses": courses,
                "total_credits": sum(c["credits"] or 0 for c in courses),
            }
        )

    return {
        "program_id": user["program_id"],
        "program_name": program_name,
        "has_plan": False,
        "semesters": semesters,
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
    if not prereqs:
        return True

    prereq_type = prereqs.get("type")

    if prereq_type == "course":
        return prereqs["code"] in completed_codes

    if prereq_type == "or":
        return any(code in completed_codes for code in prereqs.get("courses", []))

    if prereq_type == "and":
        return all(
            prereqs_satisfied(operand, completed_codes)
            for operand in prereqs.get("operands", [])
        )

    # Raw or unknown type — assume satisfied
    return True

@router.delete("/student/account")
def delete_account(authorization: str = Header(None)):
    """Delete the current user's account and all their data."""
    user = get_current_user(authorization)
    user_id = user["id"]

    # Delete completed courses first
    supabase.table("completed_courses").delete().eq("user_id", user_id).execute()

    # Delete saved schedules
    supabase.table("saved_schedules").delete().eq("user_id", user_id).execute()

    # Delete the user
    supabase.table("users").delete().eq("id", user_id).execute()

    return {"message": "Account deleted successfully"}
