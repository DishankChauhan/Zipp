from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class DeploymentType(str, Enum):
    GIT = "git"
    ZIP = "zip"

class DeploymentStatus(str, Enum):
    PENDING = "pending"
    CLONING = "cloning"
    BUILDING = "building"
    DEPLOYING = "deploying"
    RUNNING = "running"
    FAILED = "failed"
    STOPPED = "stopped"

# User Models
class UserResponse(BaseModel):
    uid: str
    email: str
    email_verified: bool
    name: Optional[str] = None
    picture: Optional[str] = None
    deployments_count: int = 0
    active_deployments: int = 0

# Auth Models
class TokenRequest(BaseModel):
    id_token: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None

# Deployment Models
class GitDeploymentRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = "main"
    name: Optional[str] = None
    description: Optional[str] = None

class ZipDeploymentRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DeploymentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    deployment_type: DeploymentType
    status: DeploymentStatus
    repo_url: Optional[str] = None
    branch: Optional[str] = None
    container_id: Optional[str] = None
    port: Optional[int] = None
    public_url: Optional[str] = None
    build_logs: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class DeploymentListResponse(BaseModel):
    deployments: List[DeploymentResponse]
    total: int

class DeploymentStatusUpdate(BaseModel):
    status: DeploymentStatus
    message: Optional[str] = None
    container_id: Optional[str] = None
    port: Optional[int] = None
    public_url: Optional[str] = None
    logs: Optional[List[str]] = None

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

# Docker Models
class ContainerInfo(BaseModel):
    container_id: str
    name: str
    status: str
    port: Optional[int] = None
    created_at: datetime
    
class BuildProgress(BaseModel):
    step: str
    progress: float
    message: str
    logs: List[str] = [] 