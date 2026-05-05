import os
import re
import time
from collections import Counter
from typing import Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

HEADERS = {"User-Agent": "UTRGV-Degree-Planner/1.0 (student project)"}
BASE_URL = "https://utrgv.smartcatalogiq.com/en"
COURSE_CODE_RE = re.compile(r"\b([A-Z]{2,4}\s\d{4})\b")

REQUIREMENT_SECTION_HINTS = (
    "requirements",
    "degree plan",
    "recommended course sequence",
    "core curriculum",
)

NON_REQUIREMENT_HINTS = (
    "prerequisite",
    "pre-requisite",
    "co-requisite",
    "corequisite",
    "admission",
    "minimum gpa",
)

REQUIREMENT_TYPE_RULES = [
    ("choose four", "choose_four"),
    ("select four", "choose_four"),
    ("choose three", "choose_three"),
    ("select three", "choose_three"),
    ("choose two", "choose_two"),
    ("select two", "choose_two"),
    ("choose one", "choose_one"),
    ("select one", "choose_one"),
    ("one of the following", "choose_one"),
    ("elective", "elective"),
    ("required", "required"),
    ("core", "required"),
]

REQUIREMENT_TYPE_PRIORITY = {
    "required": 0,
    "choose_one": 1,
    "choose_two": 2,
    "choose_three": 3,
    "choose_four": 4,
    "elective": 5,
}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def classify_requirement_type(text: str) -> Optional[str]:
    low = text.lower()
    for needle, req_type in REQUIREMENT_TYPE_RULES:
        if needle in low:
            return req_type
    return None


def get_all_programs() -> list:
    """Get all programs from the database with catalog paths."""
    result = (
        supabase.table("programs")
        .select("id, name, catalog_path")
        .order("name")
        .execute()
    )
    return result.data or []


def path_to_url(catalog_path: str) -> Optional[str]:
    """Convert Sitecore catalog path to SmartCatalogIQ page URL."""
    if not catalog_path:
        return None

    marker = "University-of-Texas-Rio-Grande-Valley/"
    idx = catalog_path.find(marker)
    if idx == -1:
        return None

    slug = catalog_path[idx + len(marker):].strip("/")
    if not slug:
        return None

    return f"{BASE_URL}/{slug.lower()}"


def should_skip_text(text: str) -> bool:
    low = text.lower()
    return any(hint in low for hint in NON_REQUIREMENT_HINTS)


def extract_codes(text: str) -> list[str]:
    found = COURSE_CODE_RE.findall(text)
    # Keep deterministic ordering with dedupe
    seen = set()
    out = []
    for code in found:
        if code in seen:
            continue
        seen.add(code)
        out.append(code)
    return out


def parse_requirement_candidates(content) -> list[dict]:
    """
    Parse requirement candidates from the main content area.

    Strategy for better accuracy:
    - Track requirement section/headings in document order.
    - Extract course codes only from list/table/paragraph-like elements in those sections.
    - Skip text that looks like prereq/coreq or admissions notes.
    """
    candidates = []

    in_requirement_area = False
    current_section = "Requirements"
    current_type = "required"

    tags = content.find_all(["h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "tr"])

    for tag in tags:
        text = normalize_text(tag.get_text(" ", strip=True))
        if not text:
            continue

        low = text.lower()

        if tag.name.startswith("h"):
            if any(h in low for h in REQUIREMENT_SECTION_HINTS):
                in_requirement_area = True
            if in_requirement_area:
                current_section = text[:160]
                inferred = classify_requirement_type(text)
                if inferred:
                    current_type = inferred
            continue

        if not in_requirement_area:
            continue

        # Section rows like "Choose one:" can appear in <p>/<li> and should update type.
        inferred = classify_requirement_type(text)
        if inferred:
            current_type = inferred

        if should_skip_text(text):
            continue

        # Prefer linked/course-structured rows, but allow plain text rows that contain codes.
        codes = extract_codes(text)
        if not codes:
            continue

        for code in codes:
            candidates.append(
                {
                    "code": code,
                    "section_name": current_section,
                    "requirement_type": current_type,
                }
            )

    return candidates


def dedupe_candidates(candidates: list[dict]) -> list[dict]:
    """
    Deduplicate by (code, section_name, requirement_type), preserving order.
    """
    seen = set()
    out = []

    for row in candidates:
        key = (row["code"], row["section_name"], row["requirement_type"])
        if key in seen:
            continue
        seen.add(key)
        out.append(row)

    return out


def choose_better_candidate(current: dict, contender: dict) -> dict:
    """
    Pick the better row for the same course code when duplicates exist.
    Lower priority value wins (required > choose_* > elective).
    If same priority, keep the earlier row (current).
    """
    curr_pri = REQUIREMENT_TYPE_PRIORITY.get(current["requirement_type"], 999)
    cont_pri = REQUIREMENT_TYPE_PRIORITY.get(contender["requirement_type"], 999)
    if cont_pri < curr_pri:
        return contender
    return current


def collapse_candidates_by_code(candidates: list[dict]) -> list[dict]:
    """
    Collapse to one row per course code so a single upsert batch never contains
    duplicate (program_id, course_id) keys.
    """
    by_code: dict[str, dict] = {}
    order: list[str] = []

    for row in candidates:
        code = row["code"]
        if code not in by_code:
            by_code[code] = row
            order.append(code)
            continue
        by_code[code] = choose_better_candidate(by_code[code], row)

    return [by_code[code] for code in order]


def get_course_ids(codes: list[str]) -> dict[str, int]:
    """Map course codes to database ids."""
    if not codes:
        return {}

    result = (
        supabase.table("courses")
        .select("id, code")
        .in_("code", codes)
        .execute()
    )
    return {row["code"]: row["id"] for row in (result.data or [])}


def fetch_requirement_candidates(url: str) -> list[dict]:
    """Fetch program page and parse requirement candidates."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        if response.status_code != 200:
            return []
    except Exception as exc:
        print(f"  Request failed: {exc}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    content = (
        soup.find("div", {"id": "main"})
        or soup.find("main")
        or soup.find("article")
        or soup.find("div", {"class": "page-content"})
    )
    if not content:
        return []

    return dedupe_candidates(parse_requirement_candidates(content))


def seed_requirements_for_program(program_id: int, candidates: list[dict]) -> tuple[int, int]:
    """
    Upsert requirements for one program.

    Returns (rows_seeded, rows_missing_course_code).
    """
    if not candidates:
        return 0, 0

    collapsed = collapse_candidates_by_code(candidates)

    codes = [row["code"] for row in collapsed]
    course_ids = get_course_ids(codes)

    rows = []
    missing = 0
    for order, row in enumerate(collapsed):
        code = row["code"]
        course_id = course_ids.get(code)
        if not course_id:
            missing += 1
            continue

        rows.append(
            {
                "program_id": program_id,
                "course_id": course_id,
                "section_name": row["section_name"],
                "requirement_type": row["requirement_type"],
                "display_order": order,
            }
        )

    for i in range(0, len(rows), 100):
        batch = rows[i : i + 100]
        (
            supabase.table("program_requirements")
            .upsert(batch, on_conflict="program_id,course_id")
            .execute()
        )

    return len(rows), missing


def main():
    print("\n" + "=" * 60)
    print("Seeding Program Requirements (Structured Parser)")
    print("=" * 60)

    programs = get_all_programs()
    print(f"\nFound {len(programs)} programs")

    total_seeded = 0
    total_skipped = 0
    total_missing = 0
    totals_by_type = Counter()

    for i, program in enumerate(programs, start=1):
        name = program["name"]
        program_id = program["id"]
        catalog_path = program.get("catalog_path")

        print(f"\n[{i}/{len(programs)}] {name[:90]}")

        if not catalog_path:
            print("  Missing catalog path - skipping")
            total_skipped += 1
            continue

        url = path_to_url(catalog_path)
        if not url:
            print("  Could not build catalog URL - skipping")
            total_skipped += 1
            continue

        candidates = fetch_requirement_candidates(url)
        if not candidates:
            print("  No requirement candidates found - skipping")
            total_skipped += 1
            continue

        type_counts = Counter(row["requirement_type"] for row in candidates)
        totals_by_type.update(type_counts)

        seeded, missing = seed_requirements_for_program(program_id, candidates)

        total_seeded += seeded
        total_missing += missing

        print(f"  Candidates: {len(candidates)} | Seeded: {seeded} | Missing course codes: {missing}")
        print(f"  Types: {dict(type_counts)}")

        time.sleep(0.2)

    print("\n" + "=" * 60)
    print("Done")
    print(f"Programs processed: {len(programs)}")
    print(f"Programs skipped:   {total_skipped}")
    print(f"Rows seeded:        {total_seeded}")
    print(f"Missing course refs:{total_missing}")
    print(f"Type totals:        {dict(totals_by_type)}")


if __name__ == "__main__":
    main()
