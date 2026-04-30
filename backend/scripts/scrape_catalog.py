import requests
import json
import re
import time
from pathlib import Path
from bs4 import BeautifulSoup

# ── URLs ──────────────────────────────────────────────────────────────────────

# Navigation tree — gives us the structure (colleges, departments, programs)
NAV_URL = (
    "https://utrgv.smartcatalogiq.com/Institutions"
    "/University-of-Texas-Rio-Grande-Valley"
    "/json/2025-2026/Undergraduate-Catalog-local.json"
)

# Full catalog — gives us course codes and names
FULL_URL = (
    "https://utrgv.smartcatalogiq.com/Institutions"
    "/University-of-Texas-Rio-Grande-Valley"
    "/json/2025-2026/Undergraduate-Catalog.json"
)

# Tells the server who we are so we don't get blocked
HEADERS = {"User-Agent": "UTRGV-Degree-Planner/1.0 (student project)"}

# Path to the folder where we save output files (backend/data/)
DATA_DIR = Path(__file__).parent.parent / "data"
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


def path_to_url(sitecore_path: str) -> str:
    """
    Convert a Sitecore JSON path to a SmartCatalogIQ HTML URL.
    Example:
      Input:  /2025-2026/Undergraduate-Catalog/Courses/ACCT-Accounting/2000/ACCT-2301
      Output: https://utrgv.smartcatalogiq.com/en/2025-2026/undergraduate-catalog/courses/acct-accounting/2000/acct-2301
    """
    return "https://utrgv.smartcatalogiq.com/en" + sitecore_path.lower()


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
    Walk the Courses UG section and extract every course code, name, and path.
    Structure: Courses UG > Subject > Number Group (1000/2000/3000/4000) > Course
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

    # Loop through subjects > number groups > individual courses
    for subject_node in courses_node.get("Children", []):
        for group_node in subject_node.get("Children", []):
            for course_node in group_node.get("Children", []):

                code_match = re.match(r"^([A-Z]{2,4}\s\d{4})", course_node.get("Name", ""))
                if not code_match:
                    continue

                code = code_match.group(1)
                name = course_node.get("Name", "")[len(code):].strip()

                courses[code] = {
                    "code": code,
                    "name": name,
                    "path": course_node.get("Path", ""),  # used to build HTML URL
                    "credits": None,
                    "description": "",
                    "prereq_raw": None,
                    "prereqs": None,
                    "coreq_raw": None,
                }

    return courses


# ── Step 3: Enrich courses with details from HTML pages ───────────────────────

def enrich_courses(courses: dict) -> dict:
    """
    For each course fetch its HTML page and extract:
    - credits
    - description
    - prereq_raw (raw prerequisite text)
    - prereqs (parsed AND/OR tree)
    - coreq_raw

    Adds a 0.3s delay between requests to be polite to the server.
    Takes about 15-20 minutes for all 2385 courses.
    """
    total = len(courses)
    enriched = 0

    for i, (code, course) in enumerate(courses.items()):
        path = course.get("path", "")
        if not path:
            continue

        url = path_to_url(path)

        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            if r.status_code != 200:
                continue

            # Parse HTML and find main content area
            soup = BeautifulSoup(r.text, "html.parser")
            content = (
                soup.find("div", {"id": "main"}) or
                soup.find("main") or
                soup.find("article") or
                soup.find("div", {"class": "page-content"})
            )

            if not content:
                continue

            # Get plain text from the HTML
            text = content.get_text(separator=" ", strip=True)

            # Extract course details
            course["credits"]     = extract_credits(text)
            # Keep full description text. Truncation breaks downstream parsing/debugging.
            course["description"] = text
            course["prereq_raw"]  = extract_prereq_string(text)
            course["prereqs"]     = parse_prereq_string(course["prereq_raw"])
            course["coreq_raw"]   = extract_coreq_string(text)

            enriched += 1

            # Progress update every 50 courses
            if enriched % 50 == 0:
                print(f"  {enriched}/{total} courses enriched...")

            time.sleep(0.3)  # polite delay — don't hammer the server

        except Exception as e:
            print(f"  Failed {code}: {e}")
            continue

    print(f"  Done — {enriched}/{total} courses enriched")
    return courses


# ── Step 4: Extract course details from text ──────────────────────────────────

def extract_credits(text: str) -> int | None:
    """Pull the credit hour count out of course description text."""
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
    m = re.search(
        r"\b[Pp]re-?requisites?(?:\s*\([sS]\))?\s*:?\s*(.+?)(?:\.|[Cc]o-?[Rr]eq(?:uisites?)?|[Cc]redits?|[Nn]ote|[Ss]chedule [Tt]ype|$)",
        text, re.IGNORECASE | re.DOTALL
    )
    return m.group(1).strip() if m else None


def extract_coreq_string(text: str) -> str | None:
    """Pull the co-requisite text out of a course description."""
    if not text:
        return None
    m = re.search(
        r"\b[Cc]o-?[Rr]equisites?(?:\s*\([sS]\))?\s*:?\s*(.+?)(?:\.|[Pp]re-?[Rr]eq(?:uisites?)?|[Cc]redits?|[Nn]ote|[Ss]chedule [Tt]ype|$)",
        text, re.IGNORECASE | re.DOTALL
    )
    return m.group(1).strip() if m else None


# ── Step 5: Parse prerequisite strings into AND/OR trees ─────────────────────

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

    # Clean up grade requirement noise
    s = re.sub(r"\s+", " ", text).strip()
    s = re.sub(
        r"with\s+a?\s*(minimum\s+)?grade\s+of\s+\"?[A-C][+-]?\"?\s*(or\s+better)?",
        "", s, flags=re.IGNORECASE
    )
    s = re.sub(
        r"with\s+a?\s*\"?[A-C][+-]?\"?\s*or\s+better",
        "", s, flags=re.IGNORECASE
    )
    s = s.strip().rstrip(".,")

    return parse_expr(s)


def parse_expr(text: str) -> dict:
    """Recursively parse a prereq expression into a tree."""
    text = text.strip()

    # Check for AND first
    and_parts = split_on(text, "and")
    if len(and_parts) > 1:
        return {"type": "and", "operands": [parse_expr(p) for p in and_parts]}

    # Check for OR
    or_parts = split_on(text, "or")
    if len(or_parts) > 1:
        codes = []
        for p in or_parts:
            codes.extend(re.findall(r"[A-Z]{2,4}\s\d{4}", p.strip()))
        if codes:
            unique_codes = list(dict.fromkeys(codes))
            if len(unique_codes) == 1:
                return {"type": "course", "code": unique_codes[0]}
            return {"type": "or", "courses": unique_codes}

    # Single course
    m = re.match(r"^([A-Z]{2,4}\s\d{4})", text)
    if m:
        return {"type": "course", "code": m.group(1)}

    # Couldn't parse — return raw text
    return {"type": "raw", "text": text}


def split_on(text: str, word: str) -> list:
    """Split text on ' and ' or ' or ' only outside parentheses."""
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
    print("\n[1/4] Downloading navigation tree...")
    nav = get_json(NAV_URL)
    if not nav:
        print("FAILED: Could not fetch navigation JSON")
        return
    print(f"  OK — top level: {nav.get('Name')}")

    # Step 2 — Parse colleges and programs
    print("\n[2/4] Parsing colleges and programs...")
    colleges, programs = parse_nav_tree(nav)
    total_programs = sum(
        len(dept["programs"])
        for college in colleges
        for dept in college["departments"]
    )
    print(f"  {len(colleges)} colleges found")
    print(f"  {total_programs} programs found")

    # Step 3 — Download full catalog and parse course codes
    print("\n[3/4] Downloading full catalog and parsing courses...")
    full = get_json(FULL_URL)
    courses = {}
    if full:
        courses = parse_all_courses(full)
        print(f"  {len(courses)} courses parsed")
    else:
        print("  Could not load full catalog")
        return

    # Step 4 — Enrich courses with details from HTML pages
    print(f"\n[4/4] Enriching {len(courses)} courses with details...")
    print("  This will take 15-20 minutes...")
    courses = enrich_courses(courses)

    # Save all output files
    print("\nSaving files to backend/data/...")
    save_json("colleges.json", colleges)
    save_json("programs.json", programs)
    save_json("courses.json", courses)

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
