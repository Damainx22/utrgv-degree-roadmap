import requests  # lets us call URLs and get data back
import json      # lets us read and write JSON files
import re        # lets us find patterns in text
import time      # used to add a small delay between API calls
from pathlib import Path  # used to work with file paths

# ── URLs ─────────────────────────────────────────────────────────────────────

# Navigation tree — gives us the structure (colleges, departments, programs)
NAV_URL = (
    "https://utrgv.smartcatalogiq.com/Institutions"
    "/University-of-Texas-Rio-Grande-Valley"
    "/json/2025-2026/Undergraduate-Catalog-local.json"
)

# Full catalog — gives us course details, descriptions, and prereqs
FULL_URL = (
    "https://utrgv.smartcatalogiq.com/Institutions"
    "/University-of-Texas-Rio-Grande-Valley"
    "/json/2025-2026/Undergraduate-Catalog.json"
)

# Tells the server who we are so we don't get blocked
HEADERS = {"User-Agent": "UTRGV-Degree-Planner/1.0 (student project)"}

# Path to the folder where we save output files (backend/data/)
DATA_DIR = Path(__file__).parent.parent / "data"

# Create the folder if it doesn't exist
DATA_DIR.mkdir(exist_ok=True)


# ── Helper functions ──────────────────────────────────────────────────────────

def get_json(url: str) -> dict | None:
    """Call a URL and return the JSON response as a Python dictionary."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=30)
        if r.status_code == 200:
            return r.json()
        print(f"  HTTP {r.status_code}: {url}")
        return None
    except Exception as e:
        print(f"  Request failed: {e}")
        return None


def save_json(filename: str, data):
    """Save a Python dictionary or list to a JSON file in backend/data/."""
    path = DATA_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  Saved {filename} ({len(str(data)) // 1024}KB)")


# ── Step 1: Parse colleges, departments, programs ─────────────────────────────

def parse_nav_tree(tree: dict) -> tuple[list, list]:
    """
    Walk the navigation tree and extract all colleges, departments, and programs.
    Returns two lists:
      - colleges: nested structure (college > department > programs)
      - programs_flat: flat list of every program across all colleges
    """
    colleges = []
    programs_flat = []

    # Find the "Undergraduate Programs by College" node
    programs_by_college = None
    for child in tree.get("Children", []):
        if "Undergraduate-Programs-by-College" in child.get("Path", ""):
            programs_by_college = child
            break

    # Guard clause — if we didn't find it, return empty lists
    if not programs_by_college:
        print("Could not find programs node")
        return colleges, programs_flat

    # Loop through colleges > departments > programs
    for college_node in programs_by_college.get("Children", []):
        college = {
            "name": college_node["Name"],
            "path": college_node["Path"],
            "departments": [],
        }

        for dept_node in college_node.get("Children", []):
            dept = {
                "name": dept_node["Name"],
                "path": dept_node["Path"],
                "programs": [],
            }

            for prog_node in dept_node.get("Children", []):
                prog = {
                    "name": prog_node["Name"],
                    "path": prog_node["Path"],
                    "college": college_node["Name"],
                    "department": dept_node["Name"],
                }
                # Add to both the nested structure and the flat list
                dept["programs"].append(prog)
                programs_flat.append(prog)

            college["departments"].append(dept)
        colleges.append(college)

    return colleges, programs_flat


# ── Step 2: Parse all courses ─────────────────────────────────────────────────

def parse_all_courses(tree: dict) -> dict:
    """
    Walk the Courses UG section of the catalog and extract every course.
    Structure is: Courses UG > Subject > Number Group (1000/2000/3000/4000) > Course
    Returns a dictionary keyed by course code e.g. {"CSCI 1470": {...}}
    """
    courses = {}

    # Find the Courses UG node
    courses_node = None
    for child in tree.get("Children", []):
        if child.get("Name") == "Courses UG":
            courses_node = child
            break

    # Guard clause
    if not courses_node:
        print("Could not find Courses UG node")
        return courses

    # Loop through subjects (ACCT, CSCI, MATH...)
    for subject_node in courses_node.get("Children", []):
        # Loop through number groups (1000, 2000, 3000, 4000...)
        for group_node in subject_node.get("Children", []):
            # Loop through individual courses
            for course_node in group_node.get("Children", []):
                code_match = re.match(r"^([A-Z]{2,4}\s\d{4})", course_node.get("Name", ""))
                if not code_match:
                    continue

                code = code_match.group(1)                        # "CSCI 1470"
                name = course_node.get("Name", "")[len(code):].strip()  # "Computer Science I"

                courses[code] = {
                    "code": code,
                    "name": name,
                    "credits": None,
                    "description": "",
                    "prereq_raw": None,
                    "prereqs": None,
                    "coreq_raw": None,
                }

    return courses

# ── Step 3: Extract course details from text ──────────────────────────────────

def extract_credits(text: str) -> int | None:
    """Pull the credit hour count out of course description text."""
    # Matches patterns like "3 Credit Hours" or "(3-0)"
    m = re.search(r"(\d)\s*[Cc]redit\s*[Hh]ours?", text)
    if m:
        return int(m.group(1))
    m = re.search(r"\((\d+)-\d+\)", text)
    if m:
        return int(m.group(1))
    return None


def extract_prereq_string(text: str) -> str | None:
    """Pull the raw prerequisite text out of a course description."""
    if not text:
        return None
    # Matches "Prerequisite: ..." or "Prerequisites: ..."
    m = re.search(
        r"[Pp]re-?requisites?\s*:\s*(.+?)(?:\.|[Cc]o-?[Rr]eq|[Cc]redit|[Nn]ote|$)",
        text, re.IGNORECASE | re.DOTALL
    )
    return m.group(1).strip() if m else None


def extract_coreq_string(text: str) -> str | None:
    """Pull the co-requisite text out of a course description."""
    if not text:
        return None
    m = re.search(
        r"[Cc]o-?[Rr]equisites?\s*:\s*(.+?)(?:\.|[Pp]re|[Cc]redit|[Nn]ote|$)",
        text, re.IGNORECASE | re.DOTALL
    )
    return m.group(1).strip() if m else None


# ── Step 4: Parse prerequisite strings into AND/OR trees ─────────────────────

def parse_prereq_string(text: str) -> dict | None:
    """
    Convert a plain text prereq string into a structured AND/OR tree.

    Examples:
      "CSCI 1470"
        → {"type": "course", "code": "CSCI 1470"}

      "CSCI 1370 or CSCI 1380"
        → {"type": "or", "courses": ["CSCI 1370", "CSCI 1380"]}

      "CSCI 2380 and MATH 2413"
        → {"type": "and", "operands": [...]}
    """
    if not text:
        return None

    # Clean up the string — remove grade requirements like "with a grade of C or better"
    s = re.sub(r"\s+", " ", text).strip()
    s = re.sub(
        r"with\s+a?\s*(minimum\s+)?grade\s+of\s+[A-C][+-]?\s*(or\s+better)?",
        "", s, flags=re.IGNORECASE
    )
    s = s.strip().rstrip(".,")

    return parse_expr(s)


def parse_expr(text: str) -> dict:
    """Recursively parse a prereq expression into a tree."""
    text = text.strip()

    # Check for AND first (highest priority)
    and_parts = split_on(text, "and")
    if len(and_parts) > 1:
        return {"type": "and", "operands": [parse_expr(p) for p in and_parts]}

    # Check for OR
    or_parts = split_on(text, "or")
    if len(or_parts) > 1:
        codes = [re.match(r"[A-Z]{2,4}\s\d{4}", p.strip()) for p in or_parts]
        codes = [m.group(0) for m in codes if m]
        if codes:
            return {"type": "or", "courses": codes}

    # Single course
    m = re.match(r"^([A-Z]{2,4}\s\d{4})", text)
    if m:
        return {"type": "course", "code": m.group(1)}

    # Couldn't parse — return raw text
    return {"type": "raw", "text": text}


def split_on(text: str, word: str) -> list:
    """
    Split text on ' and ' or ' or ' but only outside parentheses.
    This handles cases like "(CSCI 1370 or CSCI 1380) and MATH 2413"
    """
    parts, depth, cur, pat = [], 0, "", f" {word} "
    i = 0
    while i < len(text):
        if text[i] == "(":
            depth += 1
            cur += text[i]
        elif text[i] == ")":
            depth -= 1
            cur += text[i]
        elif depth == 0 and text[i:i+len(pat)].lower() == pat:
            parts.append(cur.strip())
            cur = ""
            i += len(pat)
            continue
        else:
            cur += text[i]
        i += 1
    if cur.strip():
        parts.append(cur.strip())
    return parts


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("\n" + "="*50)
    print("UTRGV Catalog Scraper")
    print("="*50)

    # Step 1 — Download navigation tree
    print("\n[1/3] Downloading navigation tree...")
    nav = get_json(NAV_URL)
    if not nav:
        print("FAILED: Could not fetch navigation JSON")
        return
    print(f"  OK — top level: {nav.get('Name')}")

    # Step 2 — Parse colleges and programs from nav tree
    print("\n[2/3] Parsing colleges and programs...")
    colleges, programs = parse_nav_tree(nav)
    total_programs = sum(
        len(dept["programs"])
        for college in colleges
        for dept in college["departments"]
    )
    print(f"  {len(colleges)} colleges found")
    print(f"  {total_programs} programs found")
    for c in colleges:
        prog_count = sum(len(d["programs"]) for d in c["departments"])
        print(f"    - {c['name']} ({prog_count} programs)")

    # Step 3 — Download full catalog and parse courses
    print("\n[3/3] Downloading full catalog and parsing courses...")
    full = get_json(FULL_URL)
    courses = {}
    if full:
        courses = parse_all_courses(full)
        print(f"  {len(courses)} courses parsed")
    else:
        print("  Could not load full catalog")

    # Save all output files
    print("\nSaving files to backend/data/...")
    save_json("colleges.json", colleges)
    save_json("programs.json", programs)
    save_json("courses.json", courses)

    # Save raw prereq strings separately for debugging
    prereqs_raw = {
        code: c["prereq_raw"]
        for code, c in courses.items()
        if c.get("prereq_raw")
    }
    save_json("prereqs_raw.json", prereqs_raw)

    print(f"\n✓ Done!")
    print(f"  {len(colleges)} colleges")
    print(f"  {total_programs} programs")
    print(f"  {len(courses)} courses")
    print(f"  {len(prereqs_raw)} courses with prerequisites")


if __name__ == "__main__":
    main()