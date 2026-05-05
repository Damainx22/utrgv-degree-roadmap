"""
UTRGV Catalog Seed Script
Reads the JSON files produced by scrape_catalog.py and loads them into Supabase.

Usage:
  1. Make sure your .env file has SUPABASE_URL and SUPABASE_SECRET_KEY set
  2. Make sure you have already run: python scripts/scrape_catalog.py
  3. Run: python scripts/seed.py
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ── Connect to Supabase ───────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

DATA_DIR = Path(__file__).parent.parent / "data"


# ── Load JSON files ───────────────────────────────────────────────────────────

def load_json(filename: str):
    """Read a JSON file from backend/data/ and return its contents."""
    path = DATA_DIR / filename
    if not path.exists():
        print(f"  Missing {filename} — run scrape_catalog.py first")
        return None
    with open(path) as f:
        return json.load(f)


# ── Seed functions ────────────────────────────────────────────────────────────

def seed_colleges(colleges: list) -> dict:
    """
    Insert all colleges into the database.
    Returns a dict mapping college name to its database id.
    e.g. {"College of Engineering And Computer Science": 3}
    """
    college_ids = {}
    print(f"  Seeding {len(colleges)} colleges...")

    for college in colleges:
        result = supabase.table("colleges").upsert(
            {"name": college["name"]},
            on_conflict="name"
        ).execute()

        if result.data:
            college_ids[college["name"]] = result.data[0]["id"]

    print(f"  Done — {len(college_ids)} colleges seeded")
    return college_ids


def seed_departments(colleges: list, college_ids: dict) -> dict:
    """
    Insert all departments into the database.
    Returns a dict mapping (dept_name, college_name) to its database id.
    """
    dept_ids = {}
    count = 0

    for college in colleges:
        for dept in college.get("departments", []):
            college_id = college_ids.get(college["name"])
            if not college_id:
                continue

            result = supabase.table("departments").upsert(
                {
                    "name": dept["name"],
                    "college_id": college_id,
                },
                on_conflict="name,college_id"
            ).execute()

            if result.data:
                dept_ids[(dept["name"], college["name"])] = result.data[0]["id"]
                count += 1

    print(f"  Done — {count} departments seeded")
    return dept_ids


def seed_programs(programs: list, college_ids: dict, dept_ids: dict) -> dict:
    """
    Insert all degree programs into the database.
    Returns a dict mapping program name to its database id.
    """
    program_ids = {}
    count = 0

    for prog in programs:
        college_id = college_ids.get(prog.get("college"))
        dept_key = (prog.get("department"), prog.get("college"))
        dept_id = dept_ids.get(dept_key)

        result = supabase.table("programs").insert({
            "name": prog["name"],
            "college_id": college_id,
            "department_id": dept_id,
            "catalog_path": prog.get("path"),
        }).execute()

        if result.data:
            program_ids[prog["name"]] = result.data[0]["id"]
            count += 1

    print(f"  Done — {count} programs seeded")
    return program_ids


def seed_courses(courses: dict) -> dict:
    """
    Insert all courses into the database in batches of 100.
    Returns a dict mapping course code to its database id.
    e.g. {"CSCI 1470": 142}
    """
    course_ids = {}
    course_list = list(courses.values())
    batch_size = 100
    total = len(course_list)
    inserted = 0

    for i in range(0, total, batch_size):
        batch = course_list[i:i + batch_size]

        rows = []
        for course in batch:
            rows.append({
                "code":        course["code"],
                "name":        course["name"],
                "credits":     course.get("credits"),
                "description": course.get("description", ""),
                "prereq_raw":  course.get("prereq_raw"),
                "prereqs":     course.get("prereqs"),
                "coreq_raw":   course.get("coreq_raw"),
            })

        result = supabase.table("courses").upsert(
            rows, on_conflict="code"
        ).execute()

        if result.data:
            for row in result.data:
                course_ids[row["code"]] = row["id"]
            inserted += len(result.data)

        print(f"  {min(i + batch_size, total)}/{total} courses seeded...")

    print(f"  Done — {inserted} courses seeded")
    return course_ids


# ── Verify ────────────────────────────────────────────────────────────────────

def verify():
    """Print row counts for every table to confirm seeding worked."""
    tables = ["colleges", "departments", "programs", "courses"]
    print("\n  Verification:")
    for table in tables:
        result = supabase.table(table).select("id", count="exact").execute()
        print(f"    {table:<25} {result.count:>5} rows")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "="*50)
    print("UTRGV Catalog Seed Script")
    print("="*50)

    # Load JSON files
    print("\nLoading JSON files from backend/data/...")
    colleges = load_json("colleges.json")
    programs = load_json("programs.json")
    courses  = load_json("courses.json")

    if not colleges or not programs or not courses:
        print("Missing data files. Run scrape_catalog.py first.")
        return

    print(f"  Loaded {len(colleges)} colleges")
    print(f"  Loaded {len(programs)} programs")
    print(f"  Loaded {len(courses)} courses")

    # Seed in order — parent tables before child tables
    print("\nSeeding tables...")
    print("\n[1/4] Colleges...")
    college_ids = seed_colleges(colleges)

    print("\n[2/4] Departments...")
    dept_ids = seed_departments(colleges, college_ids)

    print("\n[3/4] Programs...")
    program_ids = seed_programs(programs, college_ids, dept_ids)

    print("\n[4/4] Courses...")
    course_ids = seed_courses(courses)

    # Verify everything loaded correctly
    verify()

    print("\n✓ Database seeded successfully!")


if __name__ == "__main__":
    main()
