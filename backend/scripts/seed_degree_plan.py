"""
Seed degree_plans table for UTRGV degree programs defined in PROGRAMS.
"""

import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)

PROGRAMS = [
    {
        "name_search": "Computer Science, Bachelor of Science Computer Science",
        "program_id": 44,  # known
        "plan": [
            # Year 1 Fall (12 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "CSCI 1101"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "CSCI 1470"},
            # Year 1 Spring (13 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "HIST 1301"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "CSCI 2380"},
            # Year 2 Fall (16 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "COMM 1315"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "BIOL 1406"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "CSCI 2344"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "CSCI 3326"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "CSCI 2333"},
            # Year 2 Spring (17 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "PHIL 2326"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "CSCI 3310"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "BIOL 1407"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "ENGL 3342"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "EECE 2306"},
            {"year": 2, "semester": "Spring", "order": 5, "code": "EECE 2106"},
            # Year 3 Fall (15 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "CSCI 3333"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "CSCI 3336"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "CSCI 3334"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "ENGL 3342"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "POLS 2305"},
            # Year 3 Spring (15 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "CSCI 3340"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "CSCI 4333"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "MATH 2318"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "POLS 2306"},
            # Year 4 Fall (17 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "CSCI 4334"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "CSCI 4325"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "CSCI 4343"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "CSCI 4352"},
            {"year": 4, "semester": "Fall",   "order": 4, "code": "STAT 3337"},
            # Year 4 Spring (15 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "CSCI 4353"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "CSCI 4341"},
            {"year": 4, "semester": "Spring", "order": 2, "code": "HIST 1302"},
            {"year": 4, "semester": "Spring", "order": 3, "code": "CSCI 4390"},
        ]
    },
    {
        "name_search": "Computer Engineering, Bachelor",
        "plan": [
            # Year 1 Fall (14 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "EECE 1101"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "POLS 2305"},
            # Year 1 Spring (15 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "CSCI 1470"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "PHYS 2425"},
            # Year 2 Fall (17 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "MATH 2346"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "EECE 2146"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "CSCI 2380"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "HIST 1301"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "EECE 2306"},
            {"year": 2, "semester": "Fall",   "order": 5, "code": "EECE 2106"},
            # Year 2 Spring (18 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "CSCI 3333"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "PHYS 2426"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "EECE 2305"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "EECE 2105"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "POLS 2306"},
            {"year": 2, "semester": "Spring", "order": 5, "code": "CHEM 1309"},
            {"year": 2, "semester": "Spring", "order": 6, "code": "CHEM 1109"},
            # Year 3 Fall (16 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "CSCI 3340"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "EECE 3435"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "MATH 3341"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "CSCI 3334"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "EECE 3301"},
            # Year 3 Spring (18 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "EECE 3331"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "PHIL 2326"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "CSCI 3326"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "EECE 3340"},
            {"year": 3, "semester": "Spring", "order": 4, "code": "EECE 4303"},
            # Year 4 Fall (15 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "EECE 4380"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "HIST 1302"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "CSCI 4333"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "EECE 4361"},
            # Year 4 Spring (14 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "CSCI 4334"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "EECE 4362"},
        ]
    },
    {
        "name_search": "Electrical Engineering, Bachelor",
        "plan": [
            # Year 1 Fall (14 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "CSCI 1381"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "EECE 1101"},
            # Year 1 Spring (15 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2346"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "PHYS 2425"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "EECE 2306"},
            {"year": 1, "semester": "Spring", "order": 4, "code": "EECE 2106"},
            # Year 1 Summer (6 hrs)
            {"year": 1, "semester": "Summer", "order": 0, "code": "ENGL 1302"},
            # Year 2 Fall (14 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "MATH 3341"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "PHYS 2426"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "EECE 2305"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "EECE 2105"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "EECE 2319"},
            # Year 2 Spring (17 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "MATH 2415"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "CHEM 1309"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "EECE 3321"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "EECE 3301"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "EECE 3101"},
            {"year": 2, "semester": "Spring", "order": 5, "code": "HIST 1301"},
            # Year 3 Fall (15 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "EECE 3225"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "EECE 3315"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "EECE 3435"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "EECE 4303"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "HIST 1302"},
            # Year 3 Spring (14 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "EECE 3230"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "EECE 3340"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "EECE 3302"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "POLS 2305"},
            # Year 4 Fall (15 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "EECE 4321"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "EECE 4328"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "EECE 4351"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "EECE 4361"},
            {"year": 4, "semester": "Fall",   "order": 4, "code": "PHIL 2326"},
            # Year 4 Spring (15 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "EECE 4362"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "POLS 2306"},
        ]
    },
    {
        "name_search": "Mechanical Engineering, Bachelor",
        "plan": [
            # Year 1 Fall (14 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MECE 1101"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "MECE 1221"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "CHEM 1309"},
            {"year": 1, "semester": "Fall",   "order": 4, "code": "CHEM 1109"},
            {"year": 1, "semester": "Fall",   "order": 5, "code": "CSCI 1380"},
            # Year 1 Spring (15 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "PHYS 2425"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "MECE 2340"},
            {"year": 1, "semester": "Spring", "order": 4, "code": "MECE 2140"},
            # Year 1 Summer I (6 hrs)
            {"year": 1, "semester": "Summer", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Summer", "order": 1, "code": "MANE 3332"},
            # Year 1 Summer II (7 hrs)
            {"year": 2, "semester": "Summer", "order": 0, "code": "HIST 1301"},
            {"year": 2, "semester": "Summer", "order": 1, "code": "MANE 3364"},
            {"year": 2, "semester": "Summer", "order": 2, "code": "MANE 3164"},
            # Year 2 Fall (15 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "MATH 2415"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "PHYS 2426"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "MECE 3440"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "MECE 2301"},
            # Year 2 Spring (16 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "MECE 3450"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "MECE 2302"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "MECE 3335"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "EECE 2317"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "HIST 1302"},
            # Year 3 Fall (15 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "MECE 3304"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "MECE 3315"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "MECE 3321"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "MECE 3380"},
            # Year 3 Spring (16 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "MECE 3320"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "MECE 3360"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "MECE 3170"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "MECE 4350"},
            # Year 4 Fall (13 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "MECE 4361"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "MECE 3336"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "MECE 4101"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "POLS 2305"},
            # Year 4 Spring (12 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "MECE 4362"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "PHIL 2326"},
            {"year": 4, "semester": "Spring", "order": 2, "code": "POLS 2306"},
        ]
    },
    {
        "name_search": "Civil Engineering, Bachelor",
        "plan": [
            # Year 1 Fall (17 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "CIVE 1101"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "CIVE 2220"},
            {"year": 1, "semester": "Fall",   "order": 4, "code": "CHEM 1309"},
            {"year": 1, "semester": "Fall",   "order": 5, "code": "CHEM 1109"},
            {"year": 1, "semester": "Fall",   "order": 6, "code": "HIST 1301"},
            # Year 1 Spring (18 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "PHYS 2425"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "MANE 3332"},
            {"year": 1, "semester": "Spring", "order": 4, "code": "CIVE 3440"},
            # Year 2 Fall (17 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "MATH 2415"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "MECE 2301"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "CIVE 2350"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "PHYS 2426"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "POLS 2305"},
            # Year 2 Spring (16 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "HIST 1302"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "MECE 2302"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "CIVE 3321"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "MATH 3341"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "CIVE 3315"},
            {"year": 2, "semester": "Spring", "order": 5, "code": "CIVE 3115"},
            # Year 3 Fall (15 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "MANE 3337"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "CIVE 3324"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "CIVE 3331"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "CIVE 3475"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "POLS 2306"},
            # Year 3 Spring (15 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "CIVE 3341"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "CIVE 3345"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "CIVE 4335"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "CIVE 4346"},
            # Year 4 Fall (16 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "CIVE 4349"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "CIVE 4347"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "CIVE 4391"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "PHIL 2326"},
            # Year 4 Spring (16 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "CIVE 4392"},
        ]
    },
    {
        "name_search": "Cyber Security, Bachelor",
        "plan": [
            # Year 1 Fall (14 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2412"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "CYBI 1101"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "CSCI 1380"},
            {"year": 1, "semester": "Fall",   "order": 4, "code": "CRIJ 1301"},
            # Year 1 Spring (15 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "CYBI 2322"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "CYBI 2324"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "CYBI 2326"},
            {"year": 1, "semester": "Spring", "order": 4, "code": "STAT 2334"},
            # Year 2 Fall (15 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "CYBI 3318"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "COMM 1315"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "CYBI 3345"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "CYBI 4319"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "BLAW 3337"},
            # Year 2 Spring (16 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "CYBI 3335"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "CYBI 3343"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "CRIJ 3316"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "COMM 3313"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "PHYS 1401"},
            # Year 3 Fall (16 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "CYBI 3346"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "CYBI 3331"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "CYBI 3101"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "POLS 2305"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "PHIL 2326"},
            # Year 3 Spring (16 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "CYBI 4347"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "PHYS 1402"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "CYBI 4365"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "POLS 2306"},
            # Year 4 Fall (16 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "HIST 1301"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "INFS 3308"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "CYBI 3101"},
            # Year 4 Spring (12 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "CYBI 4340"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "HIST 1302"},
        ]
    },
    {
        "name_search": "Manufacturing Engineering, Bachelor",
        "plan": [
            # Year 1 Fall (14 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "CSCI 1380"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "CHEM 1309"},
            {"year": 1, "semester": "Fall",   "order": 4, "code": "CHEM 1109"},
            # Year 1 Spring (16 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGL 1302"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "MANE 1101"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "MANE 3332"},
            {"year": 1, "semester": "Spring", "order": 4, "code": "MANE 1204"},
            # Year 2 Fall (17 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "MANE 3351"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "PHYS 2425"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "MANE 4311"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "MECE 2340"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "MECE 2140"},
            {"year": 2, "semester": "Fall",   "order": 5, "code": "MANE 3300"},
            # Year 2 Spring (17 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "MATH 2415"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "MANE 4340"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "PHYS 2426"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "MANE 3337"},
            {"year": 2, "semester": "Spring", "order": 4, "code": "MANE 3340"},
            # Year 3 Fall (16 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "HIST 1301"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "MANE 4331"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "MANE 2403"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "MATH 3341"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "MANE 3364"},
            {"year": 3, "semester": "Fall",   "order": 5, "code": "MANE 3164"},
            # Year 3 Spring (18 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "HIST 1302"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "MECE 3321"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "MANE 4173"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "MANE 3302"},
            {"year": 3, "semester": "Spring", "order": 4, "code": "MANE 4444"},
            # Year 4 Fall (16 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "POLS 2305"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "EECE 2317"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "MANE 4361"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "MANE 4352"},
            # Year 4 Spring (17 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "POLS 2306"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "MANE 4322"},
            {"year": 4, "semester": "Spring", "order": 2, "code": "PHIL 2326"},
            {"year": 4, "semester": "Spring", "order": 3, "code": "MANE 4362"},
        ]
    },
    {
        "name_search": "Engineering Technology, Bachelor",
        "plan": [
            # Year 1 Fall (16 hrs)
            {"year": 1, "semester": "Fall",   "order": 0, "code": "ENGL 1301"},
            {"year": 1, "semester": "Fall",   "order": 1, "code": "MATH 2413"},
            {"year": 1, "semester": "Fall",   "order": 2, "code": "ENGT 1201"},
            {"year": 1, "semester": "Fall",   "order": 3, "code": "ENGT 1310"},
            {"year": 1, "semester": "Fall",   "order": 4, "code": "CHEM 1311"},
            {"year": 1, "semester": "Fall",   "order": 5, "code": "CHEM 1111"},
            # Year 1 Spring (14 hrs)
            {"year": 1, "semester": "Spring", "order": 0, "code": "ENGT 1320"},
            {"year": 1, "semester": "Spring", "order": 1, "code": "MATH 2414"},
            {"year": 1, "semester": "Spring", "order": 2, "code": "PHYS 2425"},
            {"year": 1, "semester": "Spring", "order": 3, "code": "ENGT 2307"},
            # Year 2 Fall (17 hrs)
            {"year": 2, "semester": "Fall",   "order": 0, "code": "ENGT 1105"},
            {"year": 2, "semester": "Fall",   "order": 1, "code": "MANE 3332"},
            {"year": 2, "semester": "Fall",   "order": 2, "code": "PHYS 2426"},
            {"year": 2, "semester": "Fall",   "order": 3, "code": "ENGT 2310"},
            {"year": 2, "semester": "Fall",   "order": 4, "code": "ENGL 1302"},
            {"year": 2, "semester": "Fall",   "order": 5, "code": "CSCI 1380"},
            # Year 2 Spring (15 hrs)
            {"year": 2, "semester": "Spring", "order": 0, "code": "ENGT 2321"},
            {"year": 2, "semester": "Spring", "order": 1, "code": "ENGT 3313"},
            {"year": 2, "semester": "Spring", "order": 2, "code": "HIST 1301"},
            {"year": 2, "semester": "Spring", "order": 3, "code": "ENGT 3301"},
            # Year 3 Fall (15 hrs)
            {"year": 3, "semester": "Fall",   "order": 0, "code": "ENGT 3318"},
            {"year": 3, "semester": "Fall",   "order": 1, "code": "ENGT 3310"},
            {"year": 3, "semester": "Fall",   "order": 2, "code": "ENGT 3315"},
            {"year": 3, "semester": "Fall",   "order": 3, "code": "MANE 3337"},
            {"year": 3, "semester": "Fall",   "order": 4, "code": "ENGT 4310"},
            # Year 3 Spring (15 hrs)
            {"year": 3, "semester": "Spring", "order": 0, "code": "HIST 1302"},
            {"year": 3, "semester": "Spring", "order": 1, "code": "ENGT 3324"},
            {"year": 3, "semester": "Spring", "order": 2, "code": "ENGT 3303"},
            {"year": 3, "semester": "Spring", "order": 3, "code": "POLS 2305"},
            # Year 4 Fall (14 hrs)
            {"year": 4, "semester": "Fall",   "order": 0, "code": "ENGT 4322"},
            {"year": 4, "semester": "Fall",   "order": 1, "code": "ENGT 4201"},
            {"year": 4, "semester": "Fall",   "order": 2, "code": "ENGT 4335"},
            {"year": 4, "semester": "Fall",   "order": 3, "code": "ENGT 4315"},
            # Year 4 Spring (14 hrs)
            {"year": 4, "semester": "Spring", "order": 0, "code": "PHIL 2326"},
            {"year": 4, "semester": "Spring", "order": 1, "code": "ENGT 4202"},
            {"year": 4, "semester": "Spring", "order": 2, "code": "ENGT 4326"},
            {"year": 4, "semester": "Spring", "order": 3, "code": "POLS 2306"},
        ]
    },
]


def get_course_ids(codes: list) -> dict:
    """Look up course IDs by code."""
    result = supabase.table("courses").select("id, code").in_("code", codes).execute()
    return {row["code"]: row["id"] for row in (result.data or [])}


def get_program_id(name_fragment: str) -> int | None:
    """Find a program ID by partial name match."""
    result = supabase.table("programs").select("id, name").ilike("name", f"%{name_fragment}%").execute()
    if result.data:
        print(f"  Found: {result.data[0]['name']} (id={result.data[0]['id']})")
        return result.data[0]["id"]
    return None


def get_program_by_id(program_id: int) -> dict | None:
    """Fetch a program by ID."""
    result = (
        supabase.table("programs")
        .select("id, name")
        .eq("id", program_id)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]
    return None


def find_program_matches(name_fragment: str) -> list[dict]:
    """Return all program rows matching a name fragment."""
    result = (
        supabase.table("programs")
        .select("id, name")
        .ilike("name", f"%{name_fragment}%")
        .execute()
    )
    return result.data or []


def resolve_program(program_cfg: dict) -> tuple[int | None, str]:
    """
    Resolve a program config to (program_id, program_name_for_logs).
    Uses explicit program_id when provided; otherwise searches by name fragment.
    """
    explicit_id = program_cfg.get("program_id")
    name_fragment = program_cfg["name_search"]

    if explicit_id is not None:
        row = get_program_by_id(explicit_id)
        if not row:
            print(f"  ERROR: program_id={explicit_id} not found for '{name_fragment}'")
            return None, name_fragment
        return row["id"], row["name"]

    matches = find_program_matches(name_fragment)
    if not matches:
        print(f"  ERROR: no program found matching '{name_fragment}'")
        return None, name_fragment

    if len(matches) == 1:
        return matches[0]["id"], matches[0]["name"]

    # Prefer exact case-insensitive match when multiple rows are returned
    needle = name_fragment.strip().lower()
    exact = [m for m in matches if m["name"].strip().lower() == needle]
    if len(exact) == 1:
        return exact[0]["id"], exact[0]["name"]

    print(f"  ERROR: multiple programs match '{name_fragment}':")
    for m in matches[:10]:
        print(f"    - {m['id']}: {m['name']}")
    print("  Refine name_search or set program_id explicitly.")
    return None, name_fragment


def seed_program(program_id: int, plan: list, program_name: str) -> bool:
    """Seed degree plan for one program."""
    print(f"\nSeeding {program_name} (program_id={program_id})...")

    # Look up course IDs before deleting any existing rows.
    codes = [row["code"] for row in plan]
    code_to_id = get_course_ids(codes)

    missing = sorted(code for code in set(codes) if code not in code_to_id)
    if missing:
        print(f"  Warning: missing {len(missing)} courses in catalog (skipped): {', '.join(missing)}")

    # Delete existing rows only after all validations pass
    supabase.table("degree_plans").delete().eq("program_id", program_id).execute()
    print("  Cleared existing rows")

    # Build rows
    rows = []
    semester_counts = {}
    seen_codes = set()
    repeated = set()

    for item in plan:
        code = item["code"]
        if code not in code_to_id:
            continue

        # degree_plans enforces UNIQUE(program_id, course_id), so keep first placement
        # and warn on repeated placements.
        if code in seen_codes:
            repeated.add(code)
            continue
        seen_codes.add(code)

        course_id = code_to_id[code]

        rows.append({
            "program_id": program_id,
            "course_id": course_id,
            "year": item["year"],
            "semester": item["semester"],
            "display_order": item["order"],
        })

        key = f"Year {item['year']} {item['semester']}"
        semester_counts[key] = semester_counts.get(key, 0) + 1

    if repeated:
        print(f"  Warning: skipped repeated courses due unique constraint: {', '.join(sorted(repeated))}")

    if not rows:
        print("  ERROR: no valid rows to seed")
        return False

    # Upsert
    if rows:
        supabase.table("degree_plans").upsert(rows, on_conflict="program_id,course_id").execute()

    # Print per-semester summary
    for sem, count in semester_counts.items():
        print(f"  {sem}: {count} courses")

    print(f"  Total seeded: {len(rows)} courses")
    return True


def main():
    print("\n" + "=" * 60)
    print("Seeding degree_plans")
    print("=" * 60)

    seeded = 0
    failed = 0

    for cfg in PROGRAMS:
        plan = cfg.get("plan", [])
        if not plan:
            print(f"\nERROR: empty plan for '{cfg.get('name_search', 'unknown')}'")
            failed += 1
            continue

        program_id, resolved_name = resolve_program(cfg)
        if program_id is None:
            failed += 1
            continue

        ok = seed_program(program_id, plan, resolved_name)
        if ok:
            seeded += 1
        else:
            failed += 1

    print("\nDone!")
    print(f"  Seeded programs: {seeded}")
    print(f"  Failed programs: {failed}")


if __name__ == "__main__":
    main()
