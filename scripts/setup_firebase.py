#!/usr/bin/env python3
"""
Firebase Setup Script for InstantSite

This script helps you set up Firebase configuration and test the connection.
"""

import json
import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file from Firebase service account JSON"""
    print("🔧 Firebase Configuration Setup")
    print("=" * 50)
    
    # Check if service account JSON file exists
    json_files = list(Path(".").glob("*serviceAccountKey.json"))
    if not json_files:
        json_files = list(Path(".").glob("*firebase*.json"))
    
    if json_files:
        json_file = json_files[0]
        print(f"Found Firebase service account file: {json_file}")
        
        with open(json_file, 'r') as f:
            firebase_config = json.load(f)
        
        # Create .env file
        env_content = f"""# Firebase Configuration (Auto-generated)
FIREBASE_PROJECT_ID={firebase_config.get('project_id', '')}
FIREBASE_PRIVATE_KEY_ID={firebase_config.get('private_key_id', '')}
FIREBASE_PRIVATE_KEY="{firebase_config.get('private_key', '').replace(chr(10), '\\n')}"
FIREBASE_CLIENT_EMAIL={firebase_config.get('client_email', '')}
FIREBASE_CLIENT_ID={firebase_config.get('client_id', '')}
FIREBASE_AUTH_URI={firebase_config.get('auth_uri', 'https://accounts.google.com/o/oauth2/auth')}
FIREBASE_TOKEN_URI={firebase_config.get('token_uri', 'https://oauth2.googleapis.com/token')}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL={firebase_config.get('auth_provider_x509_cert_url', 'https://www.googleapis.com/oauth2/v1/certs')}
FIREBASE_CLIENT_X509_CERT_URL={firebase_config.get('client_x509_cert_url', '')}

# App Configuration
APP_NAME=InstantSite
APP_VERSION=1.0.0
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production

# Docker Configuration
DOCKER_SOCKET=unix://var/run/docker.sock

# Deployment Configuration
BASE_DOMAIN=localhost
BASE_PORT=8000
DEPLOYMENT_PORT_RANGE_START=3000
DEPLOYMENT_PORT_RANGE_END=4000

# Storage Configuration
UPLOAD_DIR=./uploads
CLONE_DIR=./clones
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print(f"✅ .env file created successfully!")
        print(f"Project ID: {firebase_config.get('project_id')}")
        print(f"Client Email: {firebase_config.get('client_email')}")
        
    else:
        print("❌ No Firebase service account JSON file found!")
        print("\nTo set up Firebase:")
        print("1. Go to Firebase Console (https://console.firebase.google.com)")
        print("2. Select your project or create a new one")
        print("3. Go to Project Settings > Service Accounts")
        print("4. Click 'Generate new private key'")
        print("5. Download the JSON file and place it in the backend directory")
        print("6. Run this script again")
        return False
    
    return True

def test_firebase_connection():
    """Test Firebase connection"""
    print("\n🧪 Testing Firebase Connection...")
    print("=" * 50)
    
    try:
        # Add backend directory to path
        sys.path.insert(0, '.')
        
        from firebase_config import firebase_service
        
        # Test Firestore connection
        collections = firebase_service.db.collections()
        print("✅ Firestore connection successful!")
        
        # Test auth (this will work if the service account has proper permissions)
        print("✅ Firebase Auth service initialized!")
        
        print("\n🎉 Firebase setup complete!")
        print("You can now start the backend server.")
        
    except Exception as e:
        print(f"❌ Firebase connection failed: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure the service account has the right permissions")
        print("2. Check that Firestore is enabled in your Firebase project")
        print("3. Verify the .env file contains correct credentials")
        return False
    
    return True

def setup_firestore_rules():
    """Display Firestore security rules"""
    print("\n📋 Firestore Security Rules")
    print("=" * 50)
    print("Add these rules to your Firestore database:")
    print("""
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own deployments
    match /deployments/{deploymentId} {
      allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
""")

def main():
    """Main setup function"""
    print("🚀 InstantSite Firebase Setup")
    print("=" * 50)
    
    # Check if we're in the backend directory
    if not os.path.exists('main.py'):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Create .env file
    if create_env_file():
        # Test connection
        test_firebase_connection()
        
        # Show Firestore rules
        setup_firestore_rules()
        
        print("\n✅ Setup complete!")
        print("Next steps:")
        print("1. Update Firestore security rules in Firebase Console")
        print("2. Run './scripts/start_backend.sh' to start the server")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 