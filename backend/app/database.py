from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Read Supabase connection details from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

# Create a single Supabase client instance
# This is imported by other files to interact with the database
# We use the secret key here because this runs server-side only
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)