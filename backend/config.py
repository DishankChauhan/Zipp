import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

class Settings:
    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY_ID: str = os.getenv("FIREBASE_PRIVATE_KEY_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_CLIENT_ID: str = os.getenv("FIREBASE_CLIENT_ID", "")
    FIREBASE_AUTH_URI: str = os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth")
    FIREBASE_TOKEN_URI: str = os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token")
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: str = os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs")
    FIREBASE_CLIENT_X509_CERT_URL: str = os.getenv("FIREBASE_CLIENT_X509_CERT_URL", "")
    
    # App Configuration
    APP_NAME: str = os.getenv("APP_NAME", "Zipp")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    
    # Docker Configuration
    DOCKER_SOCKET: str = os.getenv("DOCKER_SOCKET", "unix://var/run/docker.sock")
    
    # Deployment Configuration
    BASE_DOMAIN: str = os.getenv("BASE_DOMAIN", "localhost")
    BASE_PORT: int = int(os.getenv("BASE_PORT", "8000"))
    DEPLOYMENT_PORT_RANGE_START: int = int(os.getenv("DEPLOYMENT_PORT_RANGE_START", "3000"))
    DEPLOYMENT_PORT_RANGE_END: int = int(os.getenv("DEPLOYMENT_PORT_RANGE_END", "4000"))
    
    # Storage Configuration
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    CLONE_DIR: str = os.getenv("CLONE_DIR", "./clones")
    
    @property
    def firebase_credentials(self) -> dict:
        """Return Firebase credentials as a dictionary for service account initialization."""
        return {
            "type": "service_account",
            "project_id": self.FIREBASE_PROJECT_ID,
            "private_key_id": self.FIREBASE_PRIVATE_KEY_ID,
            "private_key": self.FIREBASE_PRIVATE_KEY,
            "client_email": self.FIREBASE_CLIENT_EMAIL,
            "client_id": self.FIREBASE_CLIENT_ID,
            "auth_uri": self.FIREBASE_AUTH_URI,
            "token_uri": self.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": self.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            "client_x509_cert_url": self.FIREBASE_CLIENT_X509_CERT_URL
        }

settings = Settings() 