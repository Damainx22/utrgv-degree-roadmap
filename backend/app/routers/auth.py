from fastapi import APIRouter, HTTPException
from app.models import UserRegister, UserLogin, TokenResponse
from app.database import supabase
from app.auth import hash_password, verify_password, create_access_token

# Create a router with /auth prefix - all endpoints here start with /auth
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register(user: UserRegister):
    """
    Register a new student account.
    - Checks if email is already taken
    - Hashes the password before storing
    - Returns a JWT token so the user is logged in immediately after registering
    """
    # Check if a user with this email already exists
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password - never store plain text passwords
    hashed = hash_password(user.password)

    # Insert the new user into the database
    result = supabase.table("users").insert({
        "email": user.email,
        "name": user.name,
        "password": hashed
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create user")

    # Create and return a JWT token so user is logged in right away
    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    """
    Log in with email and password.
    - Looks up the user by email
    - Verifies the password against the stored hash
    - Returns a JWT token on success
    """
    # Find the user by email
    result = supabase.table("users").select("*").eq("email", user.email).execute()
    if not result.data:
        # Use same error message for wrong email AND wrong password
        # This prevents attackers from knowing which emails are registered
        raise HTTPException(status_code=401, detail="Invalid email or password")

    db_user = result.data[0]

    # Verify the password matches the stored hash
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create and return a JWT token
    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, token_type="bearer")