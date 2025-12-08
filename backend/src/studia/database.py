import os
from supabase import create_client, Client
from dotenv import load_dotenv

# On force le chargement des variables d'environnement ici
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    # On ne lève pas d'erreur bloquante ici pour ne pas casser l'import
    # mais on met un client dummy ou None
    print("⚠️ Warning: Supabase keys not found in environment.")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)