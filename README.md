# Zipp: One Click Website Deployer 🚀


A modern platform that revolutionizes how developers deploy their websites. With Zipp, you can deploy any website instantly with just one click using Docker containerization - no complex configurations, no deployment headaches, just pure simplicity.

![Zipp Landing Page](frontend/public/Landing.png)

## 🎯 The Problem I'm Solving

As a developer, I was frustrated with the complexity of deploying websites. Whether it's configuring servers, managing dependencies, or dealing with environment inconsistencies - deployment was always a pain point that took away from actual coding time. 

**Common deployment challenges I faced:**
- ⏰ Hours spent on server configuration and setup
- 🔧 Complex CI/CD pipeline configurations
- 🐛 "It works on my machine" syndrome
- 💸 Expensive hosting solutions for simple projects
- 📊 Lack of real-time deployment monitoring
- 🔒 Security concerns with manual deployments

**My Solution: Zipp**
Zipp eliminates all these pain points by providing a one-click deployment solution that handles everything automatically - from containerization to SSL certificates, from port management to real-time monitoring.

## ✨ What Makes Zipp Special

- **🚀 One-Click Deploy**: Upload your code and get a live URL in seconds
- **🐳 Docker-Powered**: Automatic containerization ensures consistency across all environments
- **🔐 Secure by Default**: Firebase authentication and isolated containers
- **🌐 Instant Public URLs**: Get SSL-secured public URLs immediately
- **📊 Real-Time Monitoring**: Live deployment logs and status updates
- **🔗 Git Integration**: Deploy directly from GitHub repositories
- **📱 Modern UI**: Beautiful, responsive dashboard built with Next.js

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context API
- **Authentication**: Firebase Auth SDK

### Backend
- **Framework**: Python FastAPI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **Containerization**: Docker + Docker SDK for Python
- **File Handling**: Multipart file uploads with ZIP extraction
- **API Documentation**: Auto-generated with FastAPI/OpenAPI

### Infrastructure
- **Containerization**: Docker with dynamic port allocation
- **Reverse Proxy**: Nginx for routing and SSL termination
- **Real-time Communication**: WebSocket connections for live logs
- **File Storage**: Firebase Storage for deployment artifacts
- **Process Management**: Python subprocess for container orchestration

### DevOps & Deployment
- **Container Registry**: Local Docker registry
- **Port Management**: Dynamic port allocation system
- **SSL Certificates**: Automatic HTTPS with Let's Encrypt
- **Monitoring**: Real-time container health checks
- **Logging**: Structured logging with deployment tracking

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Infrastructure│
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ • Auth UI       │    │ • API Routes    │    │ • Containers    │
│ • Deploy UI     │    │ • Auth Service  │    │ • Port Mgmt     │
│ • Dashboard     │    │ • Docker Mgmt   │    │ • SSL Certs     │
│ • Real-time UI  │    │ • WebSocket     │    │ • Networking    │
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

## 📁 Project Structure

```
zipp/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application entry
├── nginx/                  # Reverse proxy configuration
├── scripts/               # Deployment and utility scripts
├── docs/                  # Documentation
└── docker-compose.yml     # Multi-container orchestration
```

## 🚀 Current Progress & Features

### ✅ Completed Features
- **🔐 Authentication System**: Complete Firebase Auth integration with login/signup
- **📊 Dashboard**: Modern dashboard with deployment overview and analytics
- **🎨 Landing Page**: Beautiful hero section with interactive 3D globe using COBE
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔄 Real-time Updates**: Live deployment status and progress tracking
- **🐳 Docker Integration**: Automatic containerization of uploaded projects
- **📁 File Upload**: Support for ZIP file uploads and GitHub integration
- **🌐 Public URLs**: Dynamic URL generation for deployed sites
- **📈 Analytics**: Deployment statistics and performance metrics

### 🔧 Backend Infrastructure
- **FastAPI Server**: RESTful API with automatic documentation
- **Firebase Integration**: Authentication and database connectivity
- **Docker Management**: Container creation, management, and cleanup
- **Port Allocation**: Dynamic port assignment for deployments
- **File Processing**: ZIP extraction and project structure analysis
- **WebSocket Support**: Real-time communication for deployment logs

## 🎯 Roadmap & Future Plans

### Phase 2: Enhanced Deployment Features (In Progress)
- [ ] **Advanced Git Integration**: Direct GitHub repository deployment
- [ ] **Build Process Detection**: Automatic detection of build commands (npm, yarn, etc.)
- [ ] **Environment Variables**: Support for custom environment configurations
- [ ] **Domain Management**: Custom domain support with DNS configuration
- [ ] **Deployment Rollbacks**: One-click rollback to previous versions

### Phase 3: Monitoring & Analytics (Planned)
- [ ] **Performance Monitoring**: Real-time performance metrics and alerts
- [ ] **Usage Analytics**: Detailed traffic and usage statistics
- [ ] **Error Tracking**: Automatic error detection and reporting
- [ ] **Uptime Monitoring**: 24/7 uptime monitoring with notifications
- [ ] **Resource Usage**: CPU, memory, and bandwidth monitoring

### Phase 4: Advanced Features (Future)
- [ ] **Team Collaboration**: Multi-user projects and team management
- [ ] **API Deployments**: Support for backend API deployments
- [ ] **Database Integration**: One-click database setup and management
- [ ] **CI/CD Pipelines**: Automated testing and deployment workflows
- [ ] **Marketplace**: Template marketplace for quick project setup

### Phase 5: Enterprise Features (Long-term)
- [ ] **White-label Solution**: Customizable branding for enterprises
- [ ] **Advanced Security**: SOC2 compliance and enterprise security features
- [ ] **Scalability**: Auto-scaling based on traffic and resource usage
- [ ] **Multi-cloud Support**: Deploy across multiple cloud providers
- [ ] **Advanced Analytics**: Business intelligence and reporting tools

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- Docker and Docker Compose
- Firebase project with Auth and Firestore enabled

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/DishankChauhan/Zipp.git
   cd Zipp
   ```

2. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Download service account key and place in `backend/`
   - Add Firebase config to `frontend/src/lib/firebase.ts`

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🤝 Contributing

I welcome contributions! Whether it's bug fixes, feature additions, or documentation improvements, every contribution helps make Zipp better.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ About Me

Hi! I'm **Dishank Chauhan**, a passionate full-stack developer who loves building tools that make developers' lives easier. Zipp is my solution to the deployment complexity problem that I've faced throughout my development journey.

**Connect with me:**
- 🐙 GitHub: [@DishankChauhan](https://github.com/DishankChauhan)
- 🔗 LinkedIn: [Dishank Chauhan](https://www.linkedin.com/in/dishank-chauhan-186853207/)
- 📧 Email: dishankchauhan29@gmail.com

## ⭐ Show Your Support

If you find Zipp helpful, please consider giving it a star! It helps me understand that the project is valuable to the community and motivates me to continue improving it.

---

**Built with ❤️ by [Dishank Chauhan](https://github.com/DishankChauhan) | [Repository](https://github.com/DishankChauhan/Zipp)** 