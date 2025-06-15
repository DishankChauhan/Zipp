from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging
import os
from contextlib import asynccontextmanager

from config import settings
from routes import auth, deployments
from models import ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Zipp API...")
    
    # Ensure required directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CLONE_DIR, exist_ok=True)
    
    try:
        # Test Firebase connection
        from firebase_config import firebase_service
        logger.info("Firebase connection established")
        
        # Test Docker connection
        from docker_service import docker_service
        logger.info("Docker connection established")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise e
    
    logger.info("Zipp API started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Zipp API...")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Zipp: One-Click Website Deployer
    
    A platform where developers can deploy their personal or project websites 
    instantly with a single click using Docker containerization.
    
    ## Features
    - **Firebase Authentication**: Secure user authentication
    - **Git & ZIP Deployment**: Deploy from GitHub repos or ZIP files
    - **Docker Containerization**: Automatic build and deployment
    - **Real-time Status**: Track deployment progress
    - **Public URLs**: Access your deployed sites
    
    ## Authentication
    All protected endpoints require a valid Firebase ID token in the Authorization header:
    ```
    Authorization: Bearer <firebase-id-token>
    ```
    """,
    lifespan=lifespan,
    debug=settings.DEBUG
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions and return consistent error responses"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            message=exc.detail,
            error_code=str(exc.status_code)
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="Internal server error",
            error_code="500",
            details={"error": str(exc)} if settings.DEBUG else None
        ).dict()
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG
    }

# API Info endpoint
@app.get("/")
async def root():
    """API information endpoint"""
    return {
        "message": "Welcome to Zipp API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(deployments.router, prefix="/api")

# Static files (for serving deployed content via reverse proxy)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.BASE_PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 