from pydantic import BaseModel, EmailStr

# Pydantic models define the shape of data coming in and going out of our API
# FastAPI uses these to automatically validate requests and format responses

class UserRegister(BaseModel):
    """Data required to create a new account."""
    email: EmailStr    # EmailStr validates it's a properly formatted email
    password: str
    name: str

class UserLogin(BaseModel):
    """Data required to log in."""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """What we send back after successful login or register."""
    access_token: str  # the JWT token the frontend will store and send with future requests
    token_type: str    # always "bearer" - the standard way to send JWT tokens