# 🏗️ Zipp Architecture

## System Overview

Zipp is a one-click website deployment platform that combines Firebase authentication, FastAPI backend, Docker containerization, and automated deployment workflows.

## 🔥 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ZIPP PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Frontend      │    │   Backend       │    │   Infrastructure│         │
│  │   (React/Next)  │◄──►│   (FastAPI)     │◄──►│   (Docker)      │         │
│  │                 │    │                 │    │                 │         │
│  │ • Auth UI       │    │ • API Routes    │    │ • Containers    │         │
│  │ • Deploy UI     │    │ • Auth Service  │    │ • Docker Mgmt   │         │
│  │ • Dashboard     │    │ • Docker Mgmt   │    │ • Networking    │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                │
│           └───────────────────────┼───────────────────────┘                │
│                                   │                                        │
│  ┌─────────────────────────────────┼─────────────────────────────────────┐  │
│  │                    FIREBASE SERVICES                                   │  │
│  │                                 │                                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │    Auth     │  │  Firestore  │  │   Storage   │  │   Hosting   │   │  │
│  │  │             │  │             │  │             │  │             │   │  │
│  │  │ • ID Tokens │  │ • Users     │  │ • Files     │  │ • Static    │   │  │
│  │  │ • Custom    │  │ • Deploy    │  │ • Logs      │  │ • Assets    │   │  │
│  │  │   Tokens    │  │   Records   │  │ • Backups   │  │ • CDN       │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Firebase   │    │   Zipp      │    │  Firestore  │
│             │    │    Auth     │    │  Backend    │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Login Request │                  │                  │
       ├─────────────────►│                  │                  │
       │                  │                  │                  │
       │ 2. ID Token      │                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 3. API Request + Token              │                  │
       ├─────────────────────────────────────►│                  │
       │                  │                  │                  │
       │                  │ 4. Verify Token  │                  │
       │                  │◄─────────────────┤                  │
       │                  │                  │                  │
       │                  │ 5. User Data     │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │                  │
       │                  │                  │ 6. Store/Update  │
       │                  │                  ├─────────────────►│
       │                  │                  │                  │
       │ 7. Authenticated Response           │                  │
       │◄─────────────────────────────────────┤                  │
       │                  │                  │                  │
```

## 🚀 Deployment Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Zipp      │    │   Docker    │    │  Container  │
│             │    │  Backend    │    │   Engine    │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Upload ZIP/Git│                  │                  │
       ├─────────────────►│                  │                  │
       │                  │                  │                  │
       │ 2. Create Deploy │                  │                  │
       │    Record        │                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
       │                  │ 3. Extract/Clone │                  │
       │                  │ ┌─────────────┐  │                  │
       │                  │ │   Project   │  │                  │
       │                  │ │    Files    │  │                  │
       │                  │ └─────────────┘  │                  │
       │                  │                  │                  │
       │                  │ 4. Build Image   │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │                  │
       │                  │ 5. Create Container                 │
       │                  ├─────────────────────────────────────►│
       │                  │                  │                  │
       │                  │ 6. Start Container                  │
       │                  ├─────────────────────────────────────►│
       │                  │                  │                  │
       │ 7. Deployment URL│                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
```

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOCKER HOST                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Container 1   │  │   Container 2   │  │   Container N   │             │
│  │   Port: 3001    │  │   Port: 3002    │  │   Port: 300N    │             │
│  │                 │  │                 │  │                 │             │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │             │
│  │ │   Node.js   │ │  │ │   React     │ │  │ │   Python    │ │             │
│  │ │     App     │ │  │ │     App     │ │  │ │     App     │ │             │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                     │                     │                    │
│           └─────────────────────┼─────────────────────┘                    │
│                                 │                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      NGINX REVERSE PROXY                           │   │
│  │                         Port: 80/443                               │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Route 1   │  │   Route 2   │  │   Route N   │                 │   │
│  │  │ app1.zipp   │  │ app2.zipp   │  │ appN.zipp   │                 │   │
│  │  │ :3001       │  │ :3002       │  │ :300N       │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │   Client    │    │   Backend   │    │  Firestore  │                     │
│  │             │    │             │    │             │                     │
│  │ • Auth      │◄──►│ • Validate  │◄──►│ • Users     │                     │
│  │ • Upload    │    │ • Process   │    │ • Deploys   │                     │
│  │ • Monitor   │    │ • Deploy    │    │ • Logs      │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                     │
│         │                   │                   │                          │
│         │                   │                   │                          │
│         │            ┌─────────────┐    ┌─────────────┐                     │
│         │            │   Docker    │    │   Storage   │                     │
│         │            │             │    │             │                     │
│         └───────────►│ • Build     │◄──►│ • Files     │                     │
│                      │ • Deploy    │    │ • Logs      │                     │
│                      │ • Monitor   │    │ • Backups   │                     │
│                      └─────────────┘    └─────────────┘                     │
│                             │                   │                          │
│                             │                   │                          │
│                      ┌─────────────┐    ┌─────────────┐                     │
│                      │ Containers  │    │   Network   │                     │
│                      │             │    │             │                     │
│                      │ • App 1     │◄──►│ • Ports     │                     │
│                      │ • App 2     │    │ • Routing   │                     │
│                      │ • App N     │    │ • SSL       │                     │
│                      └─────────────┘    └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Details

### Backend Services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Auth Service   │  │ Deploy Service  │  │ Docker Service  │             │
│  │                 │  │                 │  │                 │             │
│  │ • Token Verify  │  │ • Git Clone     │  │ • Build Images  │             │
│  │ • User Mgmt     │  │ • ZIP Extract   │  │ • Run Containers│             │
│  │ • Permissions   │  │ • Status Track  │  │ • Port Mgmt     │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                     │                     │                    │
│           └─────────────────────┼─────────────────────┘                    │
│                                 │                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      API ROUTES                                     │   │
│  │                                                                     │   │
│  │  /api/auth/*     /api/deployments/*     /api/health                │   │
│  │  • login         • git                  • status                   │   │
│  │  • logout        • zip                  • metrics                  │   │
│  │  • me            • list                                            │   │
│  │  • verify        • get/{id}                                        │   │
│  │                  • delete/{id}                                     │   │
│  │                  • stop/{id}                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Security Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY LAYERS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 1: AUTHENTICATION                       │   │
│  │                                                                     │   │
│  │  • Firebase ID Tokens (JWT)                                        │   │
│  │  • Token Verification on Every Request                             │   │
│  │  • User Session Management                                         │   │
│  │  • Custom Claims Support                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 2: AUTHORIZATION                        │   │
│  │                                                                     │   │
│  │  • User-based Resource Access                                      │   │
│  │  • Deployment Ownership Validation                                 │   │
│  │  • Firestore Security Rules                                        │   │
│  │  • API Rate Limiting                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 3: INFRASTRUCTURE                       │   │
│  │                                                                     │   │
│  │  • Docker Container Isolation                                      │   │
│  │  • Network Segmentation                                            │   │
│  │  • Resource Limits (CPU/Memory)                                    │   │
│  │  • Port Management & Allocation                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      LAYER 4: DATA PROTECTION                      │   │
│  │                                                                     │   │
│  │  • Environment Variable Isolation                                  │   │
│  │  • Secure File Upload Handling                                     │   │
│  │  • Encrypted Data at Rest (Firebase)                               │   │
│  │  • HTTPS/TLS in Transit                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   PENDING   │───►│   CLONING   │───►│  BUILDING   │───►│   RUNNING   │  │
│  │             │    │             │    │             │    │             │  │
│  │ • Queued    │    │ • Git Clone │    │ • Docker    │    │ • Live URL  │  │
│  │ • Validated │    │ • ZIP Extract│    │   Build     │    │ • Health    │  │
│  │ • Scheduled │    │ • File Prep │    │ • Image Tag │    │   Check     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │                   │      │
│         │                   │                   │                   │      │
│         ▼                   ▼                   ▼                   ▼      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   FAILED    │    │   FAILED    │    │   FAILED    │    │   STOPPED   │  │
│  │             │    │             │    │             │    │             │  │
│  │ • Validation│    │ • Clone     │    │ • Build     │    │ • Manual    │  │
│  │   Error     │    │   Error     │    │ • Syntax    │    │   Stop      │  │
│  │ • Auth Fail │    │ • Network   │    │   Error     │    │ • Resource  │  │
│  │             │    │   Timeout   │    │   Error     │    │   Cleanup   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📈 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING STACK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │     Logs        │  │    Metrics      │  │     Health      │             │
│  │                 │  │                 │  │                 │             │
│  │ • Build Logs    │  │ • Deploy Count  │  │ • API Status    │             │
│  │ • Error Logs    │  │ • Success Rate  │  │ • DB Status     │             │
│  │ • Access Logs   │  │ • Response Time │  │ • Docker Status │             │
│  │ • Audit Logs    │  │ • Resource Use  │  │ • Container     │             │
│  │                 │  │                 │  │   Health        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│           │                     │                     │                    │
│           └─────────────────────┼─────────────────────┘                    │
│                                 │                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      REAL-TIME DASHBOARD                           │   │
│  │                                                                     │   │
│  │  • Active Deployments                                              │   │
│  │  • System Resource Usage                                           │   │
│  │  • Error Rates & Alerts                                            │   │
│  │  • User Activity & Analytics                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React/Next.js | User interface and experience |
| **Backend** | FastAPI (Python) | API server and business logic |
| **Authentication** | Firebase Auth | User management and security |
| **Database** | Firestore | User data and deployment records |
| **Containerization** | Docker | Application isolation and deployment |
| **Reverse Proxy** | Nginx | Load balancing and SSL termination |
| **File Storage** | Firebase Storage | File uploads and static assets |
| **Monitoring** | Custom + Firebase | Logging and performance tracking |

## 🌐 Network Architecture

```
Internet
    │
    ▼
┌─────────────────┐
│   Load Balancer │ (Future: Cloudflare/AWS ALB)
│   SSL/TLS       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Nginx Proxy    │ Port 80/443
│  Rate Limiting  │
└─────────────────┘
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌─────────────────┐                 ┌─────────────────┐
│  Zipp Backend   │                 │  User Apps      │
│  Port 8000      │                 │  Ports 3000+    │
│                 │                 │                 │
│ • API Routes    │                 │ • Container 1   │
│ • Auth          │                 │ • Container 2   │
│ • Deployment    │                 │ • Container N   │
└─────────────────┘                 └─────────────────┘
    │
    ▼
┌─────────────────┐
│  Firebase       │
│  Services       │
│                 │
│ • Auth          │
│ • Firestore     │
│ • Storage       │
└─────────────────┘
```

This architecture provides:
- **Scalability**: Horizontal scaling through containerization
- **Security**: Multi-layer security with Firebase Auth and container isolation
- **Reliability**: Health monitoring and automatic recovery
- **Performance**: Efficient resource utilization and caching
- **Maintainability**: Clean separation of concerns and modular design 