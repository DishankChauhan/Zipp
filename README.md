# Zipp: One-Click Website Deployer

A platform where developers can deploy their personal or project websites instantly with a single click using Docker containerization.

## 🏗️ Architecture

Zipp combines Firebase authentication, FastAPI backend, and Docker containerization for seamless website deployment:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure│
│   (React/Next)  │◄──►│   (FastAPI)     │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ • Auth UI       │    │ • API Routes    │    │ • Containers    │
│ • Deploy UI     │    │ • Auth Service  │    │ • Port Mgmt     │
│ • Dashboard     │    │ • Docker Mgmt   │    │ • Networking    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌─────────────────────────────────────────────────────────┐
    │                 FIREBASE SERVICES                       │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
    │  │    Auth     │  │  Firestore  │  │   Storage   │     │
    │  │ • ID Tokens │  │ • Users     │  │ • Files     │     │
    │  │ • Sessions  │  │ • Deploys   │  │ • Logs      │     │
    │  └─────────────┘  └─────────────┘  └─────────────┘     │
    └─────────────────────────────────────────────────────────┘
```

📖 **[View Detailed Architecture Documentation](docs/architecture.md)**

## Features (Phase 1 - MVP)

- **User Authentication**: Firebase Auth integration
- **Git/ZIP Upload**: Deploy from GitHub repos or ZIP files
- **Docker-based Deployment**: Automatic containerization and deployment
- **Public URLs**: Access deployed sites via unique URLs
- **Deployment Management**: View and manage your deployments

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: React.js/Next.js + TailwindCSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Containerization**: Docker + Docker SDK
- **Reverse Proxy**: Nginx/Traefik
- **Real-time**: WebSocket for logs

## Project Structure

```
zipp/
├── backend/          # FastAPI backend
├── frontend/         # React/Next.js frontend
├── docker/          # Docker configurations
├── nginx/           # Reverse proxy configs
└── scripts/         # Deployment scripts
```

## Getting Started

1. Clone the repository
2. Set up Firebase project and configuration
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start backend: `cd backend && uvicorn main:app --reload`
6. Start frontend: `cd frontend && npm run dev`

## Development Phases

- [x] Phase 1: Core MVP (One-Click Deploy + View URL)
- [ ] Phase 2: Real-Time Logs + Deployment Management
- [ ] Phase 3: Stability, Resource Limits, and Cleanup
- [ ] Phase 4: Extra Features & Production Readiness 