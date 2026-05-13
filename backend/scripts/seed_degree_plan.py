"""
Seed degree_plans table for UTRGV programs.

Currently seeds the official CS plan for program_id=44.
"""

import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

PROGRAM_ID = 44

CS_DEGREE_PLAN = [
    {"year": 1, "semester": "Fall", "order": 0, "code": "MATH 2413"},
    {"year": 1, "semester": "Fall", "order": 1, "code": "CSCI 1101"},
    {"year": 1, "semester": "Fall", "order": 2, "code": "CSCI 1470"},
    {"year": 1, "semester": "Spring", "order": 0, "code": "MATH 2414"},
    {"year": 1, "semester": "Spring", "order": 1, "code": "CSCI 2380"},
    {"year": 1, "semester": "Spring", "order": 2, "code": "COMM 1315"},
    {"year": 2, "semester": "Fall", "order": 0, "code": "CSCI 2344"},
    {"year": 2, "semester": "Fall", "order": 1, "code": "CSCI 2333"},
    {"year": 2, "semester": "Fall", "order": 2, "code": "CSCI 3326"},
    {"year": 2, "semester": "Spring", "order": 0, "code": "PHIL 2326"},
    {"year": 2, "semester": "Spring", "order": 1, "code": "CSCI 3310"},
    {"year": 2, "semester": "Spring", "order": 2, "code": "EECE 2106"},
    {"year": 2, "semester": "Spring", "order": 3, "code": "EECE 2306"},
    {"year": 3, "semester": "Fall", "order": 0, "code": "CSCI 3333"},
    {"year": 3, "semester": "Fall", "order": 1, "code": "CSCI 3340"},
    {"year": 3, "semester": "Fall", "order": 2, "code": "ENGL 3342"},
    {"year": 3, "semester": "Fall", "order": 3, "code": "MATH 2318"},
    {"year": 3, "semester": "Spring", "order": 0, "code": "CSCI 3336"},
    {"year": 3, "semester": "Spring", "order": 1, "code": "STAT 3337"},
    {"year": 3, "semester": "Spring", "order": 2, "code": "CSCI 3334"},
    {"year": 4, "semester": "Fall", "order": 0, "code": "CSCI 4325"},
    {"year": 4, "semester": "Fall", "order": 1, "code": "CSCI 4333"},
    {"year": 4, "semester": "Fall", "order": 2, "code": "CSCI 4334"},
    {"year": 4, "semester": "Fall", "order": 3, "code": "CSCI 4335"},
    {"year": 4, "semester": "Spring", "order": 0, "code": "CSCI 4390"},
    {"year": 4, "semester": "Spring", "order": 1, "code": "CSCI 4343"},
    {"year": 4, "semester": "Spring", "order": 2, "code": "CSCI 4352"},
]


def get_course_ids(codes: list[str]) -> dict[str, int]:
    result = (
        supabase.table("courses")
        .select("id, code")
        .in_("code", codes)
        .execute()
    )
    return {row["code"]: row["id"] for row in (result.data or [])}


def main():
    print("Seeding degree_plans for Computer Science (program_id=44)...")

    unique_codes = sorted({row["code"] for row in CS_DEGREE_PLAN})
    code_to_id = get_course_ids(unique_codes)
    missing = [code for code in unique_codes if code not in code_to_id]

    if missing:
        print("Missing course codes in courses table:")
        for code in missing:
            print(f"  - {code}")
        raise RuntimeError("Cannot seed degree_plans until all courses exist")

    rows = []
    for item in CS_DEGREE_PLAN:
        rows.append(
            {
                "program_id": PROGRAM_ID,
                "course_id": code_to_id[item["code"]],
                "year": item["year"],
                "semester": item["semester"],
                "display_order": item["order"],
                "notes": None,
            }
        )

    result = (
        supabase.table("degree_plans")
        .upsert(rows, on_conflict="program_id,course_id")
        .execute()
    )
    upserted = len(result.data or [])

    verify = (
        supabase.table("degree_plans")
        .select("id", count="exact")
        .eq("program_id", PROGRAM_ID)
        .execute()
    )
    final_count = verify.count or 0

    print(f"Upserted rows this run: {upserted}")
    print(f"Total degree_plans rows for program {PROGRAM_ID}: {final_count}")
    print("Done.")


if __name__ == "__main__":
    main()
