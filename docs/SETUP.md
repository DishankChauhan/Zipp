# Zipp Setup Guide

This guide will help you set up and run Zipp Phase 1 (MVP) locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Docker** and Docker Compose
- **Git**
- **Nginx** (optional, for production setup)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd zipp

# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.py
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Enable **Authentication** and **Firestore Database**
4. Go to **Project Settings > Service Accounts**
5. Click **Generate new private key**
6. Download the JSON file to `backend/` directory

#### Configure Firebase
```bash
cd backend
python3 ../scripts/setup_firebase.py
```

This script will:
- Auto-generate `.env` file from your Firebase service account
- Test the Firebase connection
- Show you the Firestore security rules to apply

#### Set Firestore Rules
1. Go to Firebase Console > Firestore Database > Rules
2. Replace the rules with the ones shown by the setup script
3. Publish the rules

### 3. Start Backend

```bash
cd backend
../scripts/start_backend.sh
```

The script will:
- Create a Python virtual environment
- Install all dependencies
- Check Docker connection
- Start the FastAPI server on `http://localhost:8000`

### 4. Test the Setup

Once the backend is running:

1. **Health Check**: Visit `http://localhost:8000/health`
2. **API Documentation**: Visit `http://localhost:8000/docs`
3. **Test Authentication**: Use the interactive docs to test auth endpoints

## Manual Setup (Alternative)

If the scripts don't work, follow these manual steps:

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p uploads clones static

# Copy environment file and configure
cp env.example .env
# Edit .env with your Firebase credentials

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Firebase Configuration

Create `.env` file in backend directory:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# App Configuration
APP_NAME=Zipp
APP_VERSION=1.0.0
DEBUG=True
SECRET_KEY=your-secret-key-here

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
```

## Testing the API

### 1. Authentication

First, you'll need to get a Firebase ID token. You can do this by:

1. Setting up Firebase Auth in a frontend app
2. Using Firebase Admin SDK to create custom tokens
3. Using the Firebase Auth REST API

### 2. Deploy from Git

```bash
curl -X POST "http://localhost:8000/api/deployments/git" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repo_url": "https://github.com/vercel/next.js/tree/canary/examples/hello-world",
    "branch": "canary",
    "name": "hello-world-app",
    "description": "Test Next.js deployment"
  }'
```

### 3. Deploy from ZIP

```bash
curl -X POST "http://localhost:8000/api/deployments/zip" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -F "file=@your-project.zip" \
  -F "name=my-zip-app" \
  -F "description=Test ZIP deployment"
```

### 4. List Deployments

```bash
curl -X GET "http://localhost:8000/api/deployments/" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Project Structure

```
zipp/
├── backend/              # FastAPI backend
│   ├── routes/          # API routes
│   ├── main.py          # FastAPI app
│   ├── config.py        # Configuration
│   ├── models.py        # Pydantic models  
│   ├── auth.py          # Authentication
│   ├── firebase_config.py  # Firebase setup
│   ├── docker_service.py   # Docker operations
│   └── requirements.txt    # Python dependencies
├── nginx/               # Nginx configuration
├── scripts/             # Setup and utility scripts
├── docs/                # Documentation
└── README.md           # Project overview
```

## Troubleshooting

### Docker Issues

- **Permission denied**: Add your user to docker group
  ```bash
  sudo usermod -aG docker $USER
  # Then logout and login again
  ```

- **Docker not running**: Start Docker service
  ```bash
  sudo systemctl start docker
  ```

### Firebase Issues

- **Invalid credentials**: Check your service account JSON file
- **Permission denied**: Ensure service account has Firestore and Auth permissions
- **Project not found**: Verify the project ID in your configuration

### Port Issues

- **Port already in use**: Change `BASE_PORT` in `.env` file
- **Cannot assign ports**: Check if ports 3000-4000 range is available

### Build Issues

- **Python version**: Ensure you're using Python 3.9+
- **Dependencies**: Try upgrading pip: `pip install --upgrade pip`
- **Virtual environment**: Make sure you're in the activated venv

## Next Steps

Once Phase 1 is working:

1. **Frontend Development**: Create React/Next.js frontend
2. **WebSocket Integration**: Add real-time logs (Phase 2)
3. **Resource Management**: Add cleanup and limits (Phase 3)
4. **Production Deployment**: Set up on cloud providers

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Look at the API documentation at `/docs`
3. Check server logs for detailed error messages 