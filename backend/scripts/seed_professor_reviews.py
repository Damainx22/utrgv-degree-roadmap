import argparse
import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

DATA_FILE = Path(__file__).parent.parent / "data" / "cs_professors_seed.json"

REVIEW_TEMPLATES = [
    "Explains concepts clearly and gives useful examples.",
    "Challenging course, but the lectures are organized and fair.",
    "Good pacing and practical assignments that match exams.",
    "Helpful office hours and strong feedback on projects.",
    "Great for understanding fundamentals and problem solving.",
    "Assignments are meaningful and prepare you for exams.",
    "Clear grading expectations and supportive feedback throughout the term.",
]

SPECIAL_REVIEW_TEMPLATES = {
    "Pedro Fonseca": [
        "Excellent professor. Very clear explanations, patient in office hours, and genuinely wants students to succeed.",
        "Best professor I have taken. Fair grading, engaging lectures, and strong support for project work.",
        "Makes hard topics feel approachable. Great energy in class and very respectful to students.",
    ],
    "Robert Schweller": [
        "Great professor for Data Structures and Algorithms. Challenging class, but you learn a lot if you stay consistent.",
        "High standards and tough assignments, but his teaching is clear and the learning payoff is huge.",
        "Demanding but excellent. He pushes you to think deeply and prepares you well for upper-level CS courses.",
    ],
}


def load_curated_seed() -> list[dict]:
    """Load manually curated CS professors/courses from local JSON."""
    if not DATA_FILE.exists():
        raise RuntimeError(f"Missing seed file: {DATA_FILE}")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data if isinstance(data, list) else []


def get_course_name_map(codes: list[str]) -> dict[str, str]:
    """Resolve course code -> official course name from the courses table."""
    if not codes:
        return {}
    result = supabase.table("courses").select("code, name").in_("code", codes).execute()
    return {row["code"]: row["name"] for row in (result.data or [])}


def pick_demo_user_ids(limit: int = 20) -> list[str]:
    """Pick existing users to attach seeded reviews to valid user_ids."""
    users = supabase.table("users").select("id").limit(limit).execute().data or []
    return [u["id"] for u in users]


def upsert_professor(name: str, department: str, email: str | None) -> int | None:
    """Create professor when missing; otherwise return existing id."""
    existing = supabase.table("professors").select("id").eq("name", name).limit(1).execute()
    if existing.data:
        return existing.data[0]["id"]

    created = (
        supabase.table("professors")
        .insert({"name": name, "department": department, "email": email})
        .execute()
    )
    if created.data:
        return created.data[0]["id"]
    return None


def pick_review_text(name: str) -> str:
    """Use custom tone for selected professors; generic template otherwise."""
    if name in SPECIAL_REVIEW_TEMPLATES:
        return random.choice(SPECIAL_REVIEW_TEMPLATES[name])
    return random.choice(REVIEW_TEMPLATES)

def pick_rating(name: str) -> int:
    """Bias ratings for specific professors to match requested demo tone."""
    if name == "Pedro Fonseca":
        return random.choice([5, 5, 5, 4, 5])
    if name == "Robert Schweller":
        return random.choice([4, 4, 5, 4, 5])
    return random.choice([3, 4, 4, 5, 5])


def reset_existing_seed_data() -> None:
    """Clear previously seeded CS rows so reruns are deterministic."""
    supabase.table("professor_reviews").delete().ilike("course_code", "CSCI %").execute()
    supabase.table("professors").delete().ilike("department", "%Computer Science%").execute()


def main(reset: bool) -> None:
    """Seed professors and reviews from curated file into Supabase."""
    if reset:
        reset_existing_seed_data()

    curated = load_curated_seed()
    merged = curated

    all_codes = sorted(
        {
            code.upper()
            for row in merged
            for code in row.get("courses", [])
            if isinstance(code, str) and code.upper().startswith("CSCI ")
        }
    )
    code_to_name = get_course_name_map(all_codes)

    if not code_to_name:
        print("No matching CSCI courses found in courses table.")
        return

    user_ids = pick_demo_user_ids()
    if not user_ids:
        print("No users found. Create at least one user first.")
        return

    inserted_professors = 0
    inserted_reviews = 0

    for row in merged:
        name = row.get("name")
        if not name:
            continue

        prof_id = upsert_professor(
            name=name,
            department=row.get("department") or "Computer Science",
            email=row.get("email"),
        )
        if not prof_id:
            continue

        inserted_professors += 1
        for code in row.get("courses", []):
            code = str(code).upper().strip()
            if code not in code_to_name:
                continue

            exists = (
                supabase.table("professor_reviews")
                .select("id")
                .eq("professor_id", prof_id)
                .eq("course_code", code)
                .limit(1)
                .execute()
            )
            if exists.data:
                continue

            created = (
                supabase.table("professor_reviews")
                .insert(
                    {
                        "professor_id": prof_id,
                        "user_id": random.choice(user_ids),
                        "course_code": code,
                        "course_name": code_to_name[code],
                        "rating": pick_rating(name),
                        "review_text": pick_review_text(name),
                        "difficulty": random.choice(["Easy", "Medium", "Medium", "Hard"]),
                        "would_take_again": random.choice([True, True, True, False]),
                    }
                )
                .execute()
            )
            if created.data:
                inserted_reviews += 1

    print(f"Seeded professors: {inserted_professors}")
    print(f"Seeded reviews: {inserted_reviews}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed UTRGV CS professors and reviews")
    parser.add_argument("--reset", action="store_true", help="Delete existing CS review seed rows first")
    args = parser.parse_args()
    main(reset=args.reset)
